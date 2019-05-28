import { onLoadableError, onLoadableLoad, onLoadableSuccess } from '../loadable';
import { ServiceData, UserData } from './rogerthat';
import { RogerthatActions, RogerthatActionTypes } from './rogerthat.actions';
import { initialRogerthatState, RogerthatState } from './rogerthat.state';

export function rogerthatReducer(state = initialRogerthatState, action: RogerthatActions): RogerthatState<UserData, ServiceData> {
  switch (action.type) {
    case RogerthatActionTypes.SET_USER_DATA:
      return {
        ...state,
        userData: action.payload,
      };
    case RogerthatActionTypes.SET_SERVICE_DATA:
      return {
        ...state,
        serviceData: action.payload,
      };

    case RogerthatActionTypes.SCAN_QR_CODE:
      return {
        ...state,
        scannedQrCode: onLoadableLoad(initialRogerthatState.scannedQrCode.data),
      };
    case RogerthatActionTypes.SCAN_QR_CODE_UPDATE:
      return {
        ...state,
        scannedQrCode: onLoadableSuccess(action.payload),
      };
    case RogerthatActionTypes.SCAN_QR_CODE_FAILED:
      return {
        ...state,
        scannedQrCode: onLoadableError(action.payload),
      };
  }
  return state;
}
