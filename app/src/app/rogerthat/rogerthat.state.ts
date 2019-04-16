import { createFeatureSelector, createSelector } from '@ngrx/store';
import { QrCodeScannedContent } from 'rogerthat-plugin';
import { DEFAULT_LOADABLE, Loadable } from '../loadable';
import { ServiceData, UserData } from './rogerthat';

export interface RogerthatState<UserDataType = any, ServiceDataType = any> {
  userData: UserDataType;
  serviceData: ServiceDataType;
  scannedQrCode: Loadable<QrCodeScannedContent>;
}

const getRogerthatState = createFeatureSelector<RogerthatState>('rogerthat');

export const initialRogerthatState: RogerthatState<UserData, ServiceData> = {
  userData: {},
  serviceData: {},
  scannedQrCode: DEFAULT_LOADABLE,
};

export const getScannedQr = createSelector(getRogerthatState, s => s.scannedQrCode);

export const getUserData = createSelector(getRogerthatState, s => s.userData);
export const getServiceData = createSelector(getRogerthatState, s => s.serviceData);


