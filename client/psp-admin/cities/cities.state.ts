import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DEFAULT_LIST_LOADABLE, DEFAULT_LOADABLE, Loadable } from '../../../app/src/app/loadable';
import { ActivateMerchant } from './cities';

export interface CitiesState {
  places: Loadable<google.maps.places.PlaceResult[]>;
  placeDetails: Loadable<google.maps.places.PlaceResult>;
  newMerchant: Loadable<ActivateMerchant>;
}

const getFeatureState = createFeatureSelector<CitiesState>('cities');

export const initialCitiesState: CitiesState = {
  places: DEFAULT_LIST_LOADABLE,
  placeDetails: DEFAULT_LOADABLE,
  newMerchant: DEFAULT_LOADABLE,
};

export const getPlaces = createSelector(getFeatureState, s => s.places);
export const getPlaceDetails = createSelector(getFeatureState, s => s.placeDetails);
export const getNewMerchant = createSelector(getFeatureState, s => s.newMerchant);
