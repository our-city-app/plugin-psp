import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Config, Platform } from '@ionic/angular';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { RogerthatContext, RogerthatContextType } from 'rogerthat-plugin';
import { DEFAULT_LOCALE } from './locale';
import { RogerthatService } from './rogerthat/rogerthat.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  loaded = false;

  constructor(private platform: Platform,
              private splashScreen: SplashScreen,
              private statusBar: StatusBar,
              private translate: TranslateService,
              private store: Store<any>,
              private router: Router,
              private actions: Actions,
              private rogerthatService: RogerthatService,
              private changeDetectorRef: ChangeDetectorRef,
              private config: Config) {
    this.initializeApp();
  }

  initializeApp() {
    this.translate.setDefaultLang(DEFAULT_LOCALE);
    this.platform.ready().then(() => {
      if (rogerthat.system.os === 'android') {
        this.statusBar.styleBlackTranslucent();
      } else {
        this.statusBar.styleDefault();
      }
      this.splashScreen.hide();
      this.platform.backButton.subscribe(() => {
        if (this.shouldExitApp()) {
          (navigator as any).app.exitApp();
        }
      });
      rogerthat.callbacks.ready(() => {
        this.loaded = true;
        this.rogerthatService.initialize();
        this.rogerthatService.getContext().subscribe(context => this.processContext(context));
        this.translate.get('back').subscribe(back => {
          this.config.set('backButtonText', back);
        });
        this.changeDetectorRef.markForCheck();
      });
    });
    this.actions.subscribe(action => console.log(JSON.stringify(action)));
  }

  private shouldExitApp(): boolean {
    const whitelist = [ '/psp/overview', '/psp/merchants', '/psp/info' ];
    return whitelist.includes(this.router.url);
  }

  private processContext(data: { context: RogerthatContext | null }) {
    if (data.context && data.context.type) {
      switch (data.context.type) {
        case RogerthatContextType.QR_SCANNED:
        case RogerthatContextType.URL:
          this.router.navigate([ 'psp', 'overview' ], { queryParams: { qr: data.context.data.content } });
          break;
      }
    }
  }
}
