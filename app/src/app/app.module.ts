import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injectable, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicConfig } from '@ionic/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { CUSTOM_LOCALE_PROVIDER } from './locale';
import { RogerthatModule } from './rogerthat/rogerthat.module';

const routes: Routes = [
  { path: '', loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule) },
];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/');
}

@Injectable()
export class MissingTranslationWarnHandler implements MissingTranslationHandler {

  handle(params: MissingTranslationHandlerParams) {
    const lang = params.translateService.currentLang;
    console.warn(`Missing translation for key '${params.key}' for language '${lang}'`);
    return params.key;
  }
}

const ionConfig: undefined | IonicConfig = environment.production ? undefined : { mode: Math.random() > .5 ? 'ios' : 'md' };

@NgModule({
  declarations: [ AppComponent ],
  entryComponents: [],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    HttpClientModule,
    IonicModule.forRoot(ionConfig),
    StoreModule.forRoot({}),
    StoreDevtoolsModule.instrument(),
    EffectsModule.forRoot([]),
    RogerthatModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslationWarnHandler,
      },
    }),
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    CUSTOM_LOCALE_PROVIDER,
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule {

}
