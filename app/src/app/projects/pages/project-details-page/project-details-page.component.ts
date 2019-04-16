import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil, withLatestFrom } from 'rxjs/operators';
import { Loadable } from '../../../loadable';
import { ScanQrCodeAction } from '../../../rogerthat/rogerthat.actions';
import { getScannedQr } from '../../../rogerthat/rogerthat.state';
import { ProjectDetails } from '../../projects';
import { AddParticipationAction } from '../../projects.actions';
import { getCurrentProject, getCurrentProjectId, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-project-page',
  templateUrl: './project-details-page.component.html',
  styleUrls: [ './project-details-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsPageComponent implements OnInit, OnDestroy {
  project$: Observable<Loadable<ProjectDetails>>;

  private _destroyed$ = new Subject();

  constructor(private store: Store<ProjectsState>) {
  }

  ngOnInit(): void {
    this.project$ = this.store.pipe(select(getCurrentProject));
    this.store.pipe(
      select(getScannedQr),
      takeUntil(this._destroyed$),
      withLatestFrom(this.store.pipe(select(getCurrentProjectId))),
    ).subscribe(([ scan, projectId ]) => {
      if (scan.success && scan.data) {
        this.store.dispatch(new AddParticipationAction({ projectId: projectId as number, qrContent: scan.data.content }));
      }
    });
  }

  startScanning() {
    this.store.dispatch(new ScanQrCodeAction('back'));
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }
}
