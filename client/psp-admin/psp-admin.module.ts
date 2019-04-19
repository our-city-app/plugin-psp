import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MissingTranslationWarnHandler } from '../../../framework/client/i18n';
import { CitiesEffects } from './cities/cities.effects';
import { citiesReducer } from './cities/cities.reducer';
import { CityDetailComponent } from './cities/components/city-detail/city-detail.component';
import { OpeningHoursComponent } from './cities/components/opening-hours/opening-hours.component';
import { ActivateQrPageComponent } from './cities/pages/activate-qr-page/activate-qr-page.component';
import { CityDetailPageComponent } from './cities/pages/city-detail-page/city-detail-page.component';
import { CityListPageComponent } from './cities/pages/city-list-page/city-list-page.component';
import { CityQrBatchesPageComponent } from './cities/pages/city-qr-batches-page/city-qr-batches-page.component';
import { routes } from './psp-admin-routes';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslationWarnHandler,
      },
    }),
    ZXingScannerModule.forRoot(),
    EffectsModule.forFeature([ CitiesEffects ]),
    StoreModule.forFeature('cities', citiesReducer),
    FlexLayoutModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  exports: [],
  declarations: [
    CityListPageComponent,
    CityDetailPageComponent,
    CityQrBatchesPageComponent,
    ActivateQrPageComponent,
    CityDetailComponent,
    OpeningHoursComponent,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'standard',
      },
    },
  ],
})

export class PspAdminModule {
}
