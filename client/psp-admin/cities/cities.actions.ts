import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '@ngrx/store';
import { ActivateMerchant } from './cities';

export const enum CitiesActionTypes {
  SEARCH_PLACES = '[cities] Search places',
  SEARCH_PLACES_COMPLETE = '[cities] Search places complete',
  SEARCH_PLACES_FAILED = '[cities] Search places failed',
  GET_PLACE_DETAILS = '[cities] Get place details',
  GET_PLACE_DETAILS_COMPLETE = '[cities] Get place details complete',
  GET_PLACE_DETAILS_FAILED = '[cities] Get place details failed',
  LINK_QR= '[cities] Link QR code',
  LINK_QR_COMPLETE = '[cities] Link QR code complete',
  LINK_QR_FAILED = '[cities] Link QR code failed',
}

export class SearchPlacesAction implements Action {
  readonly type = CitiesActionTypes.SEARCH_PLACES;

  constructor(public payload: { query: string, location: string }) {
  }
}

export class SearchPlacesCompleteAction implements Action {
  readonly type = CitiesActionTypes.SEARCH_PLACES_COMPLETE;

  constructor(public payload: google.maps.places.PlaceResult[]) {
  }

}

export class SearchPlacesFailedAction implements Action {
  readonly type = CitiesActionTypes.SEARCH_PLACES_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class GetPlaceDetailsAction implements Action {
  readonly type = CitiesActionTypes.GET_PLACE_DETAILS;

  constructor(public payload: { placeId: string}) {
  }
}

export class GetPlaceDetailsCompleteAction implements Action {
  readonly type = CitiesActionTypes.GET_PLACE_DETAILS_COMPLETE;

  constructor(public payload: google.maps.places.PlaceResult) {
  }

}

export class GetPlaceDetailsFailedAction implements Action {
  readonly type = CitiesActionTypes.GET_PLACE_DETAILS_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}


export class LinkQRActionAction implements Action {
  readonly type = CitiesActionTypes.LINK_QR;

  constructor(public payload: {cityId: string, data: ActivateMerchant}) {
  }
}

export class LinkQRActionCompleteAction implements Action {
  readonly type = CitiesActionTypes.LINK_QR_COMPLETE;

  constructor(public payload: ActivateMerchant) {
  }

}

export class LinkQRActionFailedAction implements Action {
  readonly type = CitiesActionTypes.LINK_QR_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export type CitiesActions = SearchPlacesAction
  | SearchPlacesCompleteAction
  | SearchPlacesFailedAction
  | GetPlaceDetailsAction
  | GetPlaceDetailsCompleteAction
  | GetPlaceDetailsFailedAction
  | LinkQRActionAction
  | LinkQRActionCompleteAction
  | LinkQRActionFailedAction;

