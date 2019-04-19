import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { DialogService } from '../../../../framework/client/dialog';
import {
  CitiesActions,
  CitiesActionTypes,
  GetPlaceDetailsAction,
  GetPlaceDetailsCompleteAction,
  GetPlaceDetailsFailedAction,
  LinkQRActionAction,
  LinkQRActionCompleteAction,
  LinkQRActionFailedAction,
  SearchPlacesAction,
  SearchPlacesCompleteAction,
  SearchPlacesFailedAction,
} from './cities.actions';
import { CitiesService } from './cities.service';
import { CitiesState } from './cities.state';

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
      catchError(err => of(new LinkQRActionCompleteAction(err)))),
    ));

  @Effect({ dispatch: false }) afterFailed$ = this.actions$.pipe(
    ofType<LinkQRActionFailedAction>(CitiesActionTypes.LINK_QR_FAILED),
    tap(action => {
      this.dialogService.openAlert({
        ok: this.translate.instant('psp.ok'),
        message: action.payload.error.error,
        title: this.translate.instant('psp.error'),
      });
    }),
  );

  constructor(private actions$: Actions<CitiesActions>,
              private store: Store<CitiesState>,
              private citiesService: CitiesService,
              private dialogService: DialogService,
              private translate: TranslateService) {
  }
}
