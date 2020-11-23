import { removeItem } from '../../../../framework/client/ngrx';
import { onLoadableError, onLoadableLoad, onLoadableSuccess } from '../loadable';
import { Merchant } from './cities';
import { CitiesActions, CitiesActionTypes } from './cities.actions';
import { CitiesState, initialCitiesState } from './cities.state';

export function citiesReducer(state = initialCitiesState, action: CitiesActions): CitiesState {
  switch (action.type) {
    case CitiesActionTypes.SEARCH_PLACES:
      return { ...state, places: onLoadableLoad(initialCitiesState.places.data) };
    case CitiesActionTypes.SEARCH_PLACES_COMPLETE:
      return { ...state, places: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.SEARCH_PLACES_FAILED:
      return { ...state, places: onLoadableError(action.payload, initialCitiesState.places.data) };
    case CitiesActionTypes.GET_PLACE_DETAILS:
      return { ...state, placeDetails: onLoadableLoad(initialCitiesState.placeDetails.data) };
    case CitiesActionTypes.GET_PLACE_DETAILS_COMPLETE:
      return { ...state, placeDetails: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.GET_PLACE_DETAILS_FAILED:
      return { ...state, places: onLoadableError(action.payload, []) };
    case CitiesActionTypes.LINK_QR:
      return { ...state, newMerchant: onLoadableLoad(initialCitiesState.newMerchant.data) };
    case CitiesActionTypes.LINK_QR_COMPLETE:
      return { ...state, newMerchant: onLoadableSuccess(action.payload), merchants: initialCitiesState.merchants };
    case CitiesActionTypes.LINK_QR_FAILED:
      return { ...state, newMerchant: onLoadableError(action.payload, initialCitiesState.newMerchant.data) };
    case CitiesActionTypes.SET_CURRENT_CITY:
      return { ...state, currentCityId: action.payload.id };
    case CitiesActionTypes.GET_CITY:
      return { ...state, currentCity: onLoadableLoad(initialCitiesState.currentCity.data) };
    case CitiesActionTypes.GET_CITY_COMPLETE:
      return { ...state, currentCity: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.GET_CITY_FAILED:
      return { ...state, currentCity: onLoadableError(action.payload, initialCitiesState.currentCity.data) };
    case CitiesActionTypes.SAVE_CITY:
      return { ...state, currentCity: onLoadableLoad(action.payload) };
    case CitiesActionTypes.SAVE_CITY_COMPLETE:
      return { ...state, currentCity: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.SAVE_CITY_FAILED:
      return { ...state, currentCity: onLoadableError(action.payload, initialCitiesState.currentCity.data) };
    case CitiesActionTypes.GET_MERCHANTS:
      return { ...state, merchants: onLoadableLoad(initialCitiesState.merchants.data) };
    case CitiesActionTypes.GET_MORE_MERCHANTS:
      return { ...state, merchants: onLoadableLoad(state.merchants.data) };
    case CitiesActionTypes.GET_MERCHANTS_COMPLETE:
      return {
        ...state,
        merchants: onLoadableSuccess({
          ...action.payload,
          results: [ ...(state.merchants.data ? state.merchants.data.results : []), ...action.payload.results ],
        }),
      };
    case CitiesActionTypes.GET_MERCHANTS_FAILED:
      return { ...state, merchants: onLoadableError(action.payload, initialCitiesState.merchants.data) };
    case CitiesActionTypes.GET_MERCHANT:
      return { ...state, merchant: onLoadableLoad(initialCitiesState.merchant.data) };
    case CitiesActionTypes.GET_MERCHANT_COMPLETE:
      return { ...state, merchant: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.GET_MERCHANT_FAILED:
      return { ...state, merchant: onLoadableError(action.payload, initialCitiesState.merchant.data) };
    case CitiesActionTypes.SAVE_MERCHANT:
      return { ...state, merchant: onLoadableLoad(action.payload) };
    case CitiesActionTypes.SAVE_MERCHANT_COMPLETE:
      return { ...state, merchant: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.SAVE_MERCHANT_FAILED:
      return { ...state, merchant: onLoadableError(action.payload, initialCitiesState.merchant.data) };
    case CitiesActionTypes.UPLOAD_FILE:
      return { ...state, uploadPictureStatus: onLoadableLoad(initialCitiesState.uploadPictureStatus.data) };
    case CitiesActionTypes.UPLOAD_FILE_COMPLETE:
      return {
        ...state,
        uploadPictureStatus: onLoadableSuccess(action.payload),
        merchant: onLoadableSuccess({
          ...state.merchant.data as Merchant,
          photos: [ ...(state.merchant.data as Merchant).photos, action.payload ],
        }),
      };
    case CitiesActionTypes.UPLOAD_FILE_FAILED:
      return { ...state, uploadPictureStatus: onLoadableError(action.payload, initialCitiesState.uploadPictureStatus.data) };
    case CitiesActionTypes.DELETE_FILE:
      return state;
    case CitiesActionTypes.DELETE_FILE_COMPLETE:
      return {
        ...state,
        merchant: onLoadableSuccess({
          ...state.merchant.data as Merchant,
          photos: removeItem((state.merchant.data as Merchant).photos, action.payload.id, 'id'),
        }),
      };
    case CitiesActionTypes.DELETE_FILE_FAILED:
      return state;
  }
  return state;
}
