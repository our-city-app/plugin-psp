import { Injectable, NgZone, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { CameraType, RogerthatCallbacks, RogerthatError } from 'rogerthat-plugin';
import { Observable, Subject } from 'rxjs';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../consts';
import { AppVersion } from './rogerthat';
import { ScanQrCodeUpdateAction, SetServiceDataAction, SetUserDataAction } from './rogerthat.actions';
import { RogerthatState } from './rogerthat.state';

@Injectable({ providedIn: 'root' })
export class RogerthatService {
  private _version: AppVersion;

  constructor(private ngZone: NgZone,
              private store: Store<RogerthatState>,
              @Optional() private translate: TranslateService) {
  }

  initialize() {
    if (typeof rogerthat === 'undefined') {
      console.log('rogerthat not defined, Skipping initialization');
      return;
    }
    this.store.dispatch(new SetUserDataAction(rogerthat.user.data));
    this.store.dispatch(new SetServiceDataAction(rogerthat.service.data));
    this.useLanguage(rogerthat.user.language);
    const cb = <RogerthatCallbacks>rogerthat.callbacks;
    cb.qrCodeScanned(result => this.ngZone.run(() => this.store.dispatch(new ScanQrCodeUpdateAction(result))));
    cb.userDataUpdated(() => this.ngZone.run(() => this.store.dispatch(new SetUserDataAction(rogerthat.user.data))));
    cb.serviceDataUpdated(() => this.ngZone.run(() => this.store.dispatch(new SetServiceDataAction(rogerthat.service.data))));
    const [ major, minor, patch ] = rogerthat.system.appVersion.split('.').slice(0, 3).map(s => parseInt(s));
    this._version = { major, minor, patch };
  }

  useLanguage(language: string) {
    let lang;
    if (SUPPORTED_LANGUAGES.indexOf(language) === -1) {
      const split = language.split('_')[ 0 ];
      if (SUPPORTED_LANGUAGES.indexOf(split) === -1) {
        lang = DEFAULT_LANGUAGE;
      } else {
        lang = split;
      }
    } else {
      lang = language;
    }
    if (this.translate) {
      console.log(`Set language to ${lang}`);
      return this.translate.use(lang);
    }
  }

  getVersion() {
    return this._version;
  }

  getContext(): Observable<any> {
    const zone = this.ngZone;
    return Observable.create((emitter: Subject<any>) => {
      rogerthat.context(success, error);

      function success(context: any) {
        zone.run(() => {
          emitter.next(context);
          emitter.complete();
        });
      }

      function error(err: RogerthatError) {
        zone.run(() => {
          emitter.error(err);
        });
      }
    });
  }

  startScanningQrCode(cameraType: CameraType): Observable<null> {
    const zone = this.ngZone;
    return Observable.create((emitter: Subject<null>) => {
      rogerthat.camera.startScanningQrCode(cameraType, success, error);

      function success() {
        zone.run(() => {
          emitter.next(null);
          emitter.complete();
        });
      }

      function error(err: RogerthatError) {
        zone.run(() => {
          emitter.error(err);
        });
      }
    });
  }

}
