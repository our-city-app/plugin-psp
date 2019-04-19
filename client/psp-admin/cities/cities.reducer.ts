import { onLoadableError, onLoadableLoad, onLoadableSuccess } from '../../../app/src/app/loadable';
import { CitiesActions, CitiesActionTypes } from './cities.actions';
import { CitiesState, initialCitiesState } from './cities.state';

export function citiesReducer(state = initialCitiesState, action: CitiesActions): CitiesState {
  switch (action.type) {
    case CitiesActionTypes.SEARCH_PLACES:
      return { ...state, places: onLoadableLoad(initialCitiesState.places.data) };
    case CitiesActionTypes.SEARCH_PLACES_COMPLETE:
      return { ...state, places: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.SEARCH_PLACES_FAILED:
      return { ...state, places: onLoadableError(action.payload) };
    case CitiesActionTypes.GET_PLACE_DETAILS:
      return { ...state, placeDetails: onLoadableLoad(initialCitiesState.placeDetails.data) };
    case CitiesActionTypes.GET_PLACE_DETAILS_COMPLETE:
      return { ...state, placeDetails: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.GET_PLACE_DETAILS_FAILED:
      return { ...state, places: onLoadableError(action.payload) };
    case CitiesActionTypes.LINK_QR:
      return { ...state, newMerchant: onLoadableLoad(initialCitiesState.newMerchant.data) };
    case CitiesActionTypes.LINK_QR_COMPLETE:
      return { ...state, newMerchant: onLoadableSuccess(action.payload) };
    case CitiesActionTypes.LINK_QR_FAILED:
      return { ...state, newMerchant: onLoadableError(action.payload) };
  }
  return state;
}
