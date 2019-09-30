import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonSlides } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { map, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { DEFAULT_LOADABLE, Loadable } from '../../../loadable';
import { ScanQrCodeAction } from '../../../rogerthat/rogerthat.actions';
import { getScannedQr } from '../../../rogerthat/rogerthat.state';
import { filterNull } from '../../../util';
import { Project, ProjectDetails } from '../../projects';
import { AddParticipationAction, GetProjectDetailsAction } from '../../projects.actions';
import { getCurrentProject, getCurrentProjectId, getProjects, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrls: [ './projects-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPageComponent implements OnInit, OnDestroy {
  @ViewChild(IonSlides, {static: false}) slides: IonSlides;
  project$: Observable<Loadable<ProjectDetails>>;
  projects$: Observable<Loadable<Project[]>>;
  projectList$: Observable<Project[]>;
  hasNoProjects$: Observable<boolean>;
  currentProjectId$: Observable<number>;
  scannedQr: string | null;
  dummyLoadable = DEFAULT_LOADABLE;
  selectedProjectId: number | null;

  private destroyed$ = new Subject();

  constructor(private store: Store<ProjectsState>,
              private router: Router,
              private route: ActivatedRoute,
              private changeDetectorRef: ChangeDetectorRef,
              private alertController: AlertController,
              private translate: TranslateService) {
  }

  ngOnInit() {
    let hasRequested = false;
    this.projects$ = this.store.pipe(select(getProjects), tap(projects => {
      if (!hasRequested && projects.success && projects.data) {
        hasRequested = true;
        if (projects.data.length > 0) {
          this.store.dispatch(new GetProjectDetailsAction({ id: projects.data[ 0 ].id }));
        }
      }
    }));
    this.projectList$ = this.projects$.pipe(map(p => p.data || []));
    this.hasNoProjects$ = this.projects$.pipe(map(projects => {
      return projects.success && (!projects.data || projects.data.length === 0);
    }));
    this.project$ = this.store.pipe(select(getCurrentProject), tap(p => {
      this.selectedProjectId = p.data ? p.data.id : null;
    }));
    this.currentProjectId$ = this.store.pipe(select(getCurrentProjectId), filterNull());
    this.route.queryParams.subscribe(params => {
      if (params.qr) {
        // Remove query params
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
        const subscription = this.projectList$.subscribe(list => {
          if (list.length > 0) {
            subscription.unsubscribe();
            if (list.length === 1) {
              // Only one project, immediately add a scan without user interaction required
              this.onProjectSelected(list[ 0 ].id, params.qr);
            } else {
              this.scannedQr = params.qr;
            }
          }
        });
      }
    });
  }

  chooseCurrentProject() {
    this.slides.getActiveIndex().then(slideIndex => {
      this.projectList$.pipe(take(1)).subscribe(projects => {
        this.onProjectSelected(projects[ slideIndex ].id, this.scannedQr);
      });
    });
  }

  startScanning() {
    this.store.dispatch(new ScanQrCodeAction('back'));
    const subscription = this.store.pipe(
      select(getScannedQr),
      takeUntil(this.destroyed$),
      withLatestFrom(this.currentProjectId$, this.projects$),
    ).subscribe(async ([ scan, projectId, allProjects ]) => {
      if (scan.success && scan.data) {
        subscription.unsubscribe();
        if (allProjects.data && allProjects.data.length > 1) {
          await this.showProjectChoiceDialog(allProjects.data, scan.data.content);
        } else {
          this.store.dispatch(new AddParticipationAction({ projectId, qrContent: scan.data.content }));
        }
      }
    });
  }

  private async showProjectChoiceDialog(allProjects: Project  [], qrUrl: string) {
    const dialog = await this.alertController.create({
      message: this.translate.instant('choose_project_for_scan'),
      inputs: allProjects.map(p => ({
        name: 'project',
        id: `project-radio-${p.id}`,
        label: p.title,
        checked: this.selectedProjectId === p.id,
        value: p.id,
        type: 'radio',
      })),
      buttons: [
        {
          text: this.translate.instant('cancel'),
          role: 'cancel',
        },
        {
          text: this.translate.instant('ok'),
          handler: (selectedValue: number) => {
            this.onProjectSelected(selectedValue, qrUrl);
            return true;
          },
        },
      ],
    });
    await dialog.present();
  }

  onProjectSelected(projectId: number, qrContent: string) {
    this.store.dispatch(new AddParticipationAction({ projectId, qrContent }));
    this.scannedQr = null;
    this.changeDetectorRef.markForCheck();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadProject() {
    this.slides.getActiveIndex().then(slideIndex => {
      this.projectList$.pipe(take(1)).subscribe(projects => {
        this.store.dispatch(new GetProjectDetailsAction({ id: projects[ slideIndex ].id }));
      });
    });
  }
}
