import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { filterNull } from '../util';
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
  GetProjectsAction,
  GetProjectsCompleteAction,
  GetProjectsFailedAction,
  ProjectsActions,
  ProjectsActionTypes,
  SetProjectAction,
} from './projects.actions';
import { ProjectsService } from './projects.service';
import { getCurrentProjectId, getMerchants, getProjects, ProjectsState } from './projects.state';

@Injectable()
export class ProjectsEffects {

  @Effect() getProjects$ = this.actions$.pipe(
    ofType<GetProjectsAction>(ProjectsActionTypes.GET_PROJECTS),
    switchMap(() => this.projectsService.getProjects().pipe(
      map(data => new GetProjectsCompleteAction(data)),
      catchError(err => of(new GetProjectsFailedAction(err)))),
    ));

  @Effect() maybeGetProjects$ = this.actions$.pipe(
    ofType<SetProjectAction>(ProjectsActionTypes.SET_PROJECT),
    switchMap(() => this.store.pipe(select(getProjects), take(1))),
    filter(projects => !projects.loading),
    switchMap(() => of(new GetProjectsAction())));

  @Effect() addParticipation$ = this.actions$.pipe(
    ofType<AddParticipationAction>(ProjectsActionTypes.ADD_PARTICIPATION),
    switchMap(async action => {
        const loadingDialog = await this.loadingController.create({
          message: this.translate.instant('loading'),
          translucent: true,
        });
        await loadingDialog.present();
        return this.projectsService.addParticipation(action.payload.projectId, action.payload.qrContent).pipe(
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

  @Effect() getProjectMerchants$ = this.actions$.pipe(
    ofType<GetMerchantsAction>(ProjectsActionTypes.GET_MERCHANTS),
    switchMap(() => this.store.pipe(select(getCurrentProjectId), filterNull(), take(1))),
    switchMap(projectId => this.projectsService.getProjectMerchants(projectId).pipe(
      map(data => new GetMerchantsCompleteAction(data)),
      catchError(err => of(new GetMerchantsFailedAction(err)))),
    ));

  @Effect() getMoreProjectMerchants$ = this.actions$.pipe(
    ofType<GetMoreMerchantsAction>(ProjectsActionTypes.GET_MORE_MERCHANTS),
    switchMap(() => this.store.pipe(
      select(getCurrentProjectId),
      filterNull(),
      withLatestFrom(this.store.pipe(select(getMerchants))),
      map(([ projectId, list ]) => this.projectsService.getProjectMerchants(projectId, list.data && list.data.cursor).pipe(
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
