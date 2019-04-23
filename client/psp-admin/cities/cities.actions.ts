import { HttpErrorResponse } from '@angular/common/http';
import { Action } from '@ngrx/store';
import { MerchantList } from '../../../app/src/app/projects/projects';
import { ActivateMerchant, City } from './cities';

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
  SET_CURRENT_CITY = '[cities] Set current city id',
  GET_CITY = '[cities] Get city id',
  GET_CITY_COMPLETE = '[cities] Get city complete',
  GET_CITY_FAILED = '[cities] Get city failed',
  SAVE_CITY = '[cities] Save city',
  SAVE_CITY_COMPLETE = '[cities] Save city complete',
  SAVE_CITY_FAILED = '[cities] Save city failed',
  GET_MERCHANTS = '[cities] Get merchants',
  GET_MORE_MERCHANTS = '[cities] Get more merchants',
  GET_MERCHANTS_COMPLETE = '[cities] Get merchants complete',
  GET_MERCHANTS_FAILED = '[cities] Get merchants failed',
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

export class SetCurrentCityAction implements Action {
  readonly type = CitiesActionTypes.SET_CURRENT_CITY;

  constructor(public payload: { id: string }) {
  }
}

export class GetCityAction implements Action {
  readonly type = CitiesActionTypes.GET_CITY;
}

export class GetCityCompleteAction implements Action {
  readonly type = CitiesActionTypes.GET_CITY_COMPLETE;

  constructor(public payload: City) {
  }

}

export class GetCityFailedAction implements Action {
  readonly type = CitiesActionTypes.GET_CITY_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class SaveCityAction implements Action {
  readonly type = CitiesActionTypes.SAVE_CITY;

  constructor(public payload: City) {
  }
}

export class SaveCityCompleteAction implements Action {
  readonly type = CitiesActionTypes.SAVE_CITY_COMPLETE;

  constructor(public payload: City) {
  }

}

export class SaveCityFailedAction implements Action {
  readonly type = CitiesActionTypes.SAVE_CITY_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class GetMerchantsAction implements Action {
  readonly type = CitiesActionTypes.GET_MERCHANTS;
}

export class GetMoreMerchantsAction implements Action {
  readonly type = CitiesActionTypes.GET_MORE_MERCHANTS;
}

export class GetMerchantsCompleteAction implements Action {
  readonly type = CitiesActionTypes.GET_MERCHANTS_COMPLETE;

  constructor(public payload: MerchantList) {
  }

}

export class GetMerchantsFailedAction implements Action {
  readonly type = CitiesActionTypes.GET_MERCHANTS_FAILED;

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
  | LinkQRActionFailedAction
  | SetCurrentCityAction
  | GetCityAction
  | GetCityCompleteAction
  | GetCityFailedAction
  | SaveCityAction
  | SaveCityCompleteAction
  | SaveCityFailedAction
  | GetMerchantsAction
  | GetMoreMerchantsAction
  | GetMerchantsCompleteAction
  | GetMerchantsFailedAction;


