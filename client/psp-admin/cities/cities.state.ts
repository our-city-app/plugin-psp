import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DEFAULT_LIST_LOADABLE, DEFAULT_LOADABLE, Loadable } from '../../../app/src/app/loadable';
import { City, Merchant, MerchantList, UploadedFile } from './cities';

export interface CitiesState {
  places: Loadable<google.maps.places.PlaceResult[]>;
  placeDetails: Loadable<google.maps.places.PlaceResult>;
  newMerchant: Loadable<Merchant>;
  currentCityId: string | null;
  currentCity: Loadable<City>;
  merchants: Loadable<MerchantList>;
  merchant: Loadable<Merchant>;
  uploadPictureStatus: Loadable<UploadedFile>;
}

const getFeatureState = createFeatureSelector<CitiesState>('cities');

export const initialCitiesState: CitiesState = {
  places: DEFAULT_LIST_LOADABLE,
  placeDetails: DEFAULT_LOADABLE,
  newMerchant: DEFAULT_LOADABLE,
  currentCityId: null,
  currentCity: DEFAULT_LOADABLE,
  merchants: DEFAULT_LOADABLE,
  merchant: DEFAULT_LOADABLE,
  uploadPictureStatus: DEFAULT_LOADABLE,
};

export const getPlaces = createSelector(getFeatureState, s => s.places);
export const getPlaceDetails = createSelector(getFeatureState, s => s.placeDetails);
export const getNewMerchant = createSelector(getFeatureState, s => s.newMerchant);
export const getCurrentCityId = createSelector(getFeatureState, s => s.currentCityId);
export const getCity = createSelector(getFeatureState, s => s.currentCity);
export const getMerchants = createSelector(getFeatureState, s => s.merchants);
export const getMerchantsCursor = createSelector(getFeatureState, s => s.merchants.data && s.merchants.data.cursor);
export const getMerchant = createSelector(getFeatureState, s => s.merchant);
export const getPictureStatus = createSelector(getFeatureState, s => s.uploadPictureStatus);
