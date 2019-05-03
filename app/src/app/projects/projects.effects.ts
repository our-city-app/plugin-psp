import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { createAppUser, filterNull } from '../util';
import {
  AddParticipationAction,
  AddParticipationCompleteAction,
  AddParticipationFailedAction,
  DismissDialogAction,
  GetCityAction,
  GetCityCompleteAction,
  GetCityFailedAction,
  GetMerchantAction,
  GetMerchantCompleteAction,
  GetMerchantFailedAction,
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
  ShowDialogAction,
} from './projects.actions';
import { ProjectsService } from './projects.service';
import { getCurrentProject, getMerchants, ProjectsState } from './projects.state';

@Injectable()
export class ProjectsEffects {

  @Effect() getCity$ = this.actions$.pipe(
    ofType<GetCityAction>(ProjectsActionTypes.GET_CITY),
    switchMap(() => this.projectsService.getCity(rogerthat.system.appId).pipe(
      map(data => new GetCityCompleteAction(data)),
      catchError(err => of(new GetCityFailedAction(err)))),
    ));

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
    tap(() => this.store.dispatch(new ShowDialogAction({
      type: 'loading',
      options: {
        message: this.translate.instant('loading'),
        translucent: true,
      },
    }))),
    switchMap(action => {
        return this.projectsService.addParticipation({
          project_id: action.payload.projectId,
          qr_content: action.payload.qrContent,
          app_id: rogerthat.system.appId,
          email: rogerthat.user.account,
        }).pipe(
          map(data => new AddParticipationCompleteAction(data)),
          tap(data => {
            this.router.navigate([ '/projects', data.payload.id ]);
          }),
          catchError(err => {
            return of(new AddParticipationFailedAction(err));
          }));
      },
    ));

  @Effect() afterAddParticipation$ = this.actions$.pipe(
    ofType<AddParticipationCompleteAction>(ProjectsActionTypes.ADD_PARTICIPATION_COMPLETE),
    map(() => new DismissDialogAction('loading')));

  @Effect() afterAddParticipationFailed$ = this.actions$.pipe(
    ofType<AddParticipationFailedAction>(ProjectsActionTypes.ADD_PARTICIPATION_FAILED),
    tap(() => this.store.dispatch(new DismissDialogAction('loading'))),
    map(action => new ShowDialogAction({
        type: 'dialog',
        options: {
          header: this.translate.instant('error'),
          message: this.getErrorMessage(action.payload),
        },
      }),
    ));

  @Effect() getMerchant$ = this.actions$.pipe(
    ofType<GetMerchantAction>(ProjectsActionTypes.GET_MERCHANT),
    withLatestFrom(this.store.pipe(select(getMerchants))),
    switchMap(([ action, merchants ]) => {
        if (merchants.data) {
          const merchant = merchants.data.results.find(m => m.id === action.payload.id);
          if (merchant) {
            return of(new GetMerchantCompleteAction(merchant));
          }
        }
        return this.projectsService.getMerchant(rogerthat.system.appId, action.payload.id).pipe(
          map(data => new GetMerchantCompleteAction(data)),
          catchError(err => of(new GetMerchantFailedAction(err))));
      },
    ));

  @Effect() getCityMerchants$ = this.actions$.pipe(
    ofType<GetMerchantsAction>(ProjectsActionTypes.GET_MERCHANTS),
    switchMap(() => this.projectsService.getCityMerchants(rogerthat.system.appId).pipe(
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

  @Effect({ dispatch: false }) showDialog$ = this.actions$.pipe(
    ofType<ShowDialogAction>(ProjectsActionTypes.SHOW_DIALOG),
    switchMap(action => {
      if (action.data.type === 'loading') {
        return this.loadingController.create(action.data.options).then(dialog => dialog.present());
      } else {
        return this.alertController.create(action.data.options).then(dialog => dialog.present());
      }
    }));

  @Effect({ dispatch: false }) dismissDialog$ = this.actions$.pipe(
    ofType<DismissDialogAction>(ProjectsActionTypes.DISMISS_DIALOG),
    switchMap(action => action.dialogType === 'loading' ? this.loadingController.dismiss() : this.alertController.dismiss()));

  private getErrorMessage(response: HttpErrorResponse) {
    if (response.status.toString().startsWith('4') && response.error && response.error.error) {
      return this.translate.instant(response.error.error, response.error.data);
    }
    return this.translate.instant('unknown_error');
  }


  constructor(private actions$: Actions<ProjectsActions>,
              private router: Router,
              private store: Store<ProjectsState>,
              private projectsService: ProjectsService,
              private translate: TranslateService,
              private alertController: AlertController,
              private loadingController: LoadingController) {
  }
}
