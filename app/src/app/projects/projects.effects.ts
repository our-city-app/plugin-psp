import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { createAppUser, filterNull } from '../util';
import {
  AddParticipationAction,
  AddParticipationCompleteAction,
  AddParticipationFailedAction,
  GetMerchantsAction,
  GetMerchantsCompleteAction,
  GetMerchantsFailedAction,
  GetMoreMerchantsAction,
  GetMoreMerchantsCompleteAction,
  GetMoreMerchantsFailedAction,
  GetProjectDetailsAction,
  GetProjectDetailsCompleteAction,
  GetProjectDetailsFailedAction,
  GetProjectsAction,
  GetProjectsCompleteAction,
  GetProjectsFailedAction,
  ProjectsActions,
  ProjectsActionTypes,
} from './projects.actions';
import { ProjectsService } from './projects.service';
import { getCurrentProject, getMerchants, ProjectsState } from './projects.state';

@Injectable()
export class ProjectsEffects {

  @Effect() getProjects$ = this.actions$.pipe(
    ofType<GetProjectsAction>(ProjectsActionTypes.GET_PROJECTS),
    switchMap(() => this.projectsService.getProjects(rogerthat.system.appId).pipe(
      map(data => new GetProjectsCompleteAction(data)),
      catchError(err => of(new GetProjectsFailedAction(err)))),
    ));

  @Effect() getProjectDetails$ = this.actions$.pipe(
    ofType<GetProjectDetailsAction>(ProjectsActionTypes.GET_PROJECT_DETAILS),
    switchMap(action => this.projectsService.getProjectDetails(rogerthat.system.appId, action.payload.id,
      createAppUser(rogerthat.user.account, rogerthat.system.appId)).pipe(
      map(data => new GetProjectDetailsCompleteAction(data)),
      catchError(err => of(new GetProjectDetailsFailedAction(err)))),
    ));

  @Effect() addParticipation$ = this.actions$.pipe(
    ofType<AddParticipationAction>(ProjectsActionTypes.ADD_PARTICIPATION),
    switchMap(async action => {
        const loadingDialog = await this.loadingController.create({
          message: this.translate.instant('loading'),
          translucent: true,
        });
        await loadingDialog.present();
      return this.projectsService.addParticipation({
        project_id: action.payload.projectId,
        qr_content: action.payload.qrContent,
        app_id: rogerthat.system.appId,
        email: rogerthat.user.account,
      }).pipe(
          map(data => new AddParticipationCompleteAction(data)),
          tap(data => {
            loadingDialog.dismiss();
            this.router.navigate([ '/projects', data.payload.id ]);
          }),
          catchError(err => {
            loadingDialog.dismiss();
            return of(new AddParticipationFailedAction(err));
          }));
      },
    ));

  @Effect() getCityMerchants$ = this.actions$.pipe(
    ofType<GetMerchantsAction>(ProjectsActionTypes.GET_MERCHANTS),
    switchMap(() => this.store.pipe(select(getCurrentProject), map(p => p.data), filterNull(), take(1))),
    switchMap(project => this.projectsService.getCityMerchants(project.city_id).pipe(
      map(data => new GetMerchantsCompleteAction(data)),
      catchError(err => of(new GetMerchantsFailedAction(err)))),
    ));

  @Effect() getMoreProjectMerchants$ = this.actions$.pipe(
    ofType<GetMoreMerchantsAction>(ProjectsActionTypes.GET_MORE_MERCHANTS),
    switchMap(() => this.store.pipe(
      select(getCurrentProject),
      map(p => p.data),
      filterNull(),
      withLatestFrom(this.store.pipe(select(getMerchants))),
      map(([ project, list ]) => this.projectsService.getCityMerchants(project.city_id, list.data && list.data.cursor).pipe(
        map(data => new GetMoreMerchantsCompleteAction(data)),
        catchError(err => of(new GetMoreMerchantsFailedAction(err)))),
      ))));

  constructor(private actions$: Actions<ProjectsActions>,
              private router: Router,
              private store: Store<ProjectsState>,
              private projectsService: ProjectsService,
              private translate: TranslateService,
              private loadingController: LoadingController) {
  }
}
