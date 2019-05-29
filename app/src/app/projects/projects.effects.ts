import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
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
  GetUserSettingsAction,
  GetUserSettingsCompleteAction,
  GetUserSettingsFailedAction,
  ProjectsActions,
  ProjectsActionTypes,
  SaveUserSettingsAction,
  SaveUserSettingsCompleteAction,
  SaveUserSettingsFailedAction,
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
        backdropDismiss: true,
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
          tap(a => {

            this.toastController.create({
              message: this.translate.instant('scan_added'),
              duration: 5000,
              buttons: [ { text: this.translate.instant('ok') } ],
            }).then(toast => toast.present()).catch(e => console.error(e));
          }),
          catchError(err => of(new AddParticipationFailedAction(err))));
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
          ...this.getErrorMessage(action.payload),
          buttons: [ this.translate.instant('ok') ],
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
    map(async action => {
      let dialog: HTMLIonLoadingElement | HTMLIonAlertElement;
      if (action.data.type === 'loading') {
        dialog = await this.loadingController.create(action.data.options);
      } else {
        dialog = await this.alertController.create(action.data.options);
      }
      // arbitrary delay to allow creating / hiding other dialogs that might have been shown just before
      setTimeout(async () => {
        try {
          await this.loadingController.dismiss();
          await this.alertController.dismiss();
        } catch (ignored) {
          // Throws error in case there was no dialog, but we don't actually care
        }
        await dialog.present();
      }, 50);
    }));

  @Effect({ dispatch: false }) dismissDialog$ = this.actions$.pipe(
    ofType<DismissDialogAction>(ProjectsActionTypes.DISMISS_DIALOG),
    map(async action => {
      try {
        action.dialogType === 'loading' ? await this.loadingController.dismiss() : await this.alertController.dismiss();
      } catch (ignored) {
      }
    }));

  private getErrorMessage(response: HttpErrorResponse): { header: string, message: string } {
    const result = {
      header: this.translate.instant('error'),
      message: '',
    };
    if (response.status.toString().startsWith('4') && response.error && response.error.error) {
      if (response.error.error === 'psp.errors.already_scanned_recently') {
        const date = this.datePipe.transform(response.error.data.date, 'medium');
        result.message = this.translate.instant(response.error.error, { date });
        result.header = this.translate.instant('info');
      } else {
        result.message = this.translate.instant(response.error.error, response.error.data);
      }
    } else {
      result.message = this.translate.instant('unknown_error');
    }
    return result;
  }

  @Effect() getUserSettings$ = this.actions$.pipe(
    ofType<GetUserSettingsAction>(ProjectsActionTypes.GET_USER_SETTINGS),
    switchMap(() => this.projectsService.getUserSettings(createAppUser(rogerthat.user.account, rogerthat.system.appId)).pipe(
      map(data => new GetUserSettingsCompleteAction(data)),
      catchError(err => of(new GetUserSettingsFailedAction(err)))),
    ));

  @Effect() saveUserSettings$ = this.actions$.pipe(
    ofType<SaveUserSettingsAction>(ProjectsActionTypes.SAVE_USER_SETTINGS),
    switchMap(a => this.projectsService.saveUserSettings(createAppUser(rogerthat.user.account, rogerthat.system.appId), a.payload).pipe(
      map(data => new SaveUserSettingsCompleteAction(data)),
      catchError(err => of(new SaveUserSettingsFailedAction(err)))),
    ));


  constructor(private actions$: Actions<ProjectsActions>,
              private store: Store<ProjectsState>,
              private projectsService: ProjectsService,
              private translate: TranslateService,
              private datePipe: DatePipe,
              private alertController: AlertController,
              private loadingController: LoadingController,
              private toastController: ToastController) {
  }
}
