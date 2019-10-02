import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { DialogService } from '../../../../framework/client/dialog';
import { filterNull } from '../../../../framework/client/ngrx';
import {
  CitiesActions,
  CitiesActionTypes,
  DeleteFileAction,
  DeleteFileCompleteAction,
  DeleteFileFailedAction,
  GetCityCompleteAction,
  GetCityFailedAction,
  GetMerchantAction,
  GetMerchantCompleteAction,
  GetMerchantFailedAction,
  GetMerchantsAction,
  GetMerchantsCompleteAction,
  GetMerchantsFailedAction,
  GetMoreMerchantsAction,
  GetPlaceDetailsAction,
  GetPlaceDetailsCompleteAction,
  GetPlaceDetailsFailedAction,
  LinkQRActionAction,
  LinkQRActionCompleteAction,
  LinkQRActionFailedAction,
  SaveCityAction,
  SaveCityCompleteAction,
  SaveCityFailedAction,
  SaveMerchantAction,
  SaveMerchantCompleteAction,
  SaveMerchantFailedAction,
  SearchPlacesAction,
  SearchPlacesCompleteAction,
  SearchPlacesFailedAction,
  UploadFileAction,
  UploadFileCompleteAction,
  UploadFileFailedAction,
} from './cities.actions';
import { CitiesService } from './cities.service';
import { CitiesState, getCurrentCityId, getMerchantsCursor } from './cities.state';

@Injectable()
export class CitiesEffects {

  @Effect() searchPlaces$ = this.actions$.pipe(
    ofType<SearchPlacesAction>(CitiesActionTypes.SEARCH_PLACES),
    distinctUntilChanged(),
    debounceTime(700),
    switchMap(action => this.citiesService.searchPlaces(action.payload.query, action.payload.location).pipe(
      map(data => new SearchPlacesCompleteAction(data)),
      catchError(err => of(new SearchPlacesFailedAction(err)))),
    ));

  @Effect() getPlaceDetails$ = this.actions$.pipe(
    ofType<GetPlaceDetailsAction>(CitiesActionTypes.GET_PLACE_DETAILS),
    switchMap(action => this.citiesService.getPlaceDetails(action.payload.placeId).pipe(
      map(data => new GetPlaceDetailsCompleteAction(data)),
      catchError(err => of(new GetPlaceDetailsFailedAction(err)))),
    ));

  @Effect() linkQRCode$ = this.actions$.pipe(
    ofType<LinkQRActionAction>(CitiesActionTypes.LINK_QR),
    switchMap(action => this.citiesService.linkQR(action.payload.cityId, action.payload.data).pipe(
      map(data => new LinkQRActionCompleteAction(data)),
      catchError(err => of(new LinkQRActionFailedAction(err)))),
    ));

  @Effect({ dispatch: false }) afterFailed$ = this.actions$.pipe(
    ofType<LinkQRActionFailedAction>(CitiesActionTypes.LINK_QR_FAILED),
    tap(action => {
      const message = action.payload.error && action.payload.error.error ?
        this.translate.instant(action.payload.error.error, action.payload.error.data)
        : this.translate.instant('errors.unknown');
      this.dialogService.openAlert({
        ok: this.translate.instant('psp.ok'),
        message,
        title: this.translate.instant('psp.error'),
      });
    }),
  );

  @Effect({ dispatch: false }) afterQrLinked$ = this.actions$.pipe(
    ofType<LinkQRActionCompleteAction>(CitiesActionTypes.LINK_QR_COMPLETE),
    tap(action => {
      this.router.navigate([ 'psp', action.payload.city_id, 'merchants', action.payload.id ]);
      this.snackBar.open(this.translate.instant('psp.merchant_created'), this.translate.instant('psp.ok'), { duration: 5000 });
    }),
  );

  @Effect() getCity$ = this.actions$.pipe(
    ofType(CitiesActionTypes.GET_CITY),
    switchMap(() => this.store.pipe(select(getCurrentCityId), filterNull())),
    switchMap(cityId => this.citiesService.getCity(cityId).pipe(
      map(data => new GetCityCompleteAction(data)),
      catchError(err => of(new GetCityFailedAction(err)))),
    ));

  @Effect() saveCity$ = this.actions$.pipe(
    ofType<SaveCityAction>(CitiesActionTypes.SAVE_CITY),
    switchMap(action => this.citiesService.saveCity(action.payload).pipe(
      map(data => new SaveCityCompleteAction(data)),
      catchError(err => of(new SaveCityFailedAction(err)))),
    ));


  @Effect() getMerchants$ = this.actions$.pipe(
    ofType<GetMerchantsAction>(CitiesActionTypes.GET_MERCHANTS),
    switchMap(() => this.store.pipe(select(getCurrentCityId), filterNull())),
    switchMap(cityId => this.citiesService.getMerchants(cityId).pipe(
      map(data => new GetMerchantsCompleteAction(data)),
      catchError(err => of(new GetMerchantsFailedAction(err)))),
    ));

  @Effect() getMoreMerchants$ = this.actions$.pipe(
    ofType<GetMoreMerchantsAction>(CitiesActionTypes.GET_MORE_MERCHANTS),
    switchMap(() => this.store.pipe(select(getCurrentCityId), filterNull())),
    withLatestFrom(this.store.pipe(select(getMerchantsCursor))),
    switchMap(([ cityId, cursor ]) => this.citiesService.getMerchants(cityId, cursor).pipe(
      map(data => new GetMerchantsCompleteAction(data)),
      catchError(err => of(new GetMerchantsFailedAction(err)))),
    ));

  @Effect() getMerchant$ = this.actions$.pipe(
    ofType<GetMerchantAction>(CitiesActionTypes.GET_MERCHANT),
    withLatestFrom(this.store.pipe(select(getCurrentCityId), filterNull())),
    switchMap(([ action, cityId ]) => this.citiesService.getMerchant(cityId, action.payload.id).pipe(
      map(data => new GetMerchantCompleteAction(data)),
      catchError(err => of(new GetMerchantFailedAction(err)))),
    ));

  @Effect() saveMerchant$ = this.actions$.pipe(
    ofType<SaveMerchantAction>(CitiesActionTypes.SAVE_MERCHANT),
    withLatestFrom(this.store.pipe(select(getCurrentCityId), filterNull())),
    switchMap(([ action, cityId ]) => this.citiesService.updateMerchant(cityId, action.payload).pipe(
      map(data => new SaveMerchantCompleteAction(data)),
      catchError(err => of(new SaveMerchantFailedAction(err)))),
    ));

  @Effect() uploadFile$ = this.actions$.pipe(
    ofType<UploadFileAction>(CitiesActionTypes.UPLOAD_FILE),
    withLatestFrom(this.store.pipe(select(getCurrentCityId), filterNull())),
    switchMap(([ action, cityId ]) => this.citiesService.uploadPhoto(cityId, action.payload.merchantId, action.payload.file).pipe(
      map(data => new UploadFileCompleteAction(data)),
      catchError(err => of(new UploadFileFailedAction(err)))),
    ));

  @Effect() deleteFile$ = this.actions$.pipe(
    ofType<DeleteFileAction>(CitiesActionTypes.DELETE_FILE),
    withLatestFrom(this.store.pipe(select(getCurrentCityId), filterNull())),
    switchMap(([ action, cityId ]) => this.citiesService.deletePhoto(cityId, action.payload.merchantId, action.payload.id).pipe(
      map(() => new DeleteFileCompleteAction({ id: action.payload.id })),
      catchError(err => of(new DeleteFileFailedAction(err)))),
    ));

  constructor(private actions$: Actions<CitiesActions>,
              private store: Store<CitiesState>,
              private citiesService: CitiesService,
              private dialogService: DialogService,
              private snackBar: MatSnackBar,
              private router: Router,
              private translate: TranslateService) {
  }
}
