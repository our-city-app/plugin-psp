import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSlides } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
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
  @ViewChild(IonSlides) slides: IonSlides;
  project$: Observable<Loadable<ProjectDetails>>;
  projects$: Observable<Loadable<Project[]>>;
  projectList$: Observable<Project[]>;
  currentProjectId$: Observable<number>;
  scannedQr: string | null;
  dummyLoadable = DEFAULT_LOADABLE;

  private _destroyed$ = new Subject();

  constructor(private store: Store<ProjectsState>,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.scannedQr = this.route.snapshot.queryParams.qr;
    if (this.scannedQr) {
      // Remove query params
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
    let hasRequested = false;
    this.projects$ = this.store.pipe(select(getProjects), tap(projects => {
      if (!hasRequested && projects.success && projects.data) {
        hasRequested = true;
        this.store.dispatch(new GetProjectDetailsAction({ id: projects.data[ 0 ].id }));
      }
    }));
    this.projectList$ = this.projects$.pipe(map(p => p.data || []));
    this.project$ = this.store.pipe(select(getCurrentProject));
    this.currentProjectId$ = this.store.pipe(select(getCurrentProjectId), filterNull());
  }

  projectClicked(project: Project) {
    if (this.scannedQr) {
      this.store.dispatch(new AddParticipationAction({ projectId: project.id, qrContent: this.scannedQr }));
    }
    this.router.navigate([ project.id ], { relativeTo: this.route });
  }

  startScanning() {
    this.store.dispatch(new ScanQrCodeAction('back'));
    const subscription = this.store.pipe(
      select(getScannedQr),
      takeUntil(this._destroyed$),
      withLatestFrom(this.currentProjectId$),
    ).subscribe(([ scan, projectId ]) => {
      if (scan.success && scan.data) {
        this.store.dispatch(new AddParticipationAction({ projectId, qrContent: scan.data.content }));
        subscription.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  loadProject() {
    this.slides.getActiveIndex().then(slideIndex => {
      this.projects$.pipe(map(p => p.data), filterNull(), take(1)).subscribe(projects => {
        this.store.dispatch(new GetProjectDetailsAction({ id: projects[ slideIndex ].id }));
      });
    });
  }
}
