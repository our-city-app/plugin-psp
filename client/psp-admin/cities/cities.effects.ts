import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { DialogService } from '../../../../framework/client/dialog';
import { filterNull } from '../../../../framework/client/ngrx';
import {
  CitiesActions,
  CitiesActionTypes,
  GetCityCompleteAction,
  GetCityFailedAction,
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
  SearchPlacesAction,
  SearchPlacesCompleteAction,
  SearchPlacesFailedAction,
} from './cities.actions';
import { CitiesService } from './cities.service';
import { CitiesState, getCurrentCityId, getMerchantsCursor } from './cities.state';

@Injectable()
export class CitiesEffects {

  @Effect() searchPlaces$ = this.actions$.pipe(
    ofType<SearchPlacesAction>(CitiesActionTypes.SEARCH_PLACES),
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
      this.dialogService.openAlert({
        ok: this.translate.instant('psp.ok'),
        message: this.translate.instant(action.payload.error.error, action.payload.error.data),
        title: this.translate.instant('psp.error'),
      });
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

  constructor(private actions$: Actions<CitiesActions>,
              private store: Store<CitiesState>,
              private citiesService: CitiesService,
              private dialogService: DialogService,
              private translate: TranslateService) {
  }
}
