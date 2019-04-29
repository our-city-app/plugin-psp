import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Platform } from '@ionic/angular';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { RogerthatContext, RogerthatContextType } from 'rogerthat-plugin';
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
              private changeDetectorRef: ChangeDetectorRef) {
    this.initializeApp();
  }

  initializeApp() {
    this.translate.setDefaultLang('en');
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      this.splashScreen.hide();
      rogerthat.callbacks.ready(() => {
        this.loaded = true;
        this.rogerthatService.initialize();
        this.rogerthatService.getContext().subscribe(context => this.processContext(context));
        this.changeDetectorRef.markForCheck();
      });
    });
    this.actions.subscribe(action => console.log(action));
  }

  private processContext(data: { context: RogerthatContext | null }) {
    if (data.context && data.context.type) {
      switch (data.context.type) {
        case RogerthatContextType.QR_SCANNED:
          this.router.navigate([ 'projects' ], { queryParams: { qr: data.context.content } });
          break;
      }
    }
  }
}
