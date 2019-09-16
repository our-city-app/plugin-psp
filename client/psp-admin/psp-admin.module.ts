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
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { MultilingualModule } from '../../../framework/client/i18n';
import { NavModule } from '../../../framework/client/nav/nav.module';
import { CitiesEffects } from './cities/cities.effects';
import { citiesReducer } from './cities/cities.reducer';
import { CityDetailComponent } from './cities/components/city-detail/city-detail.component';
import { EditMerchantComponent } from './cities/components/edit-merchant/edit-merchant.component';
import { OpeningHoursComponent } from './cities/components/opening-hours/opening-hours.component';
import { ActivateQrPageComponent } from './cities/pages/activate-qr-page/activate-qr-page.component';
import { CityDetailPageComponent } from './cities/pages/city-detail-page/city-detail-page.component';
import { CityListPageComponent } from './cities/pages/city-list-page/city-list-page.component';
import { CityPageComponent } from './cities/pages/city-page/city-page.component';
import { CityQrBatchesPageComponent } from './cities/pages/city-qr-batches-page/city-qr-batches-page.component';
import { EditMerchantPageComponent } from './cities/pages/edit-merchant-page/edit-merchant-page.component';
import { MerchantsListPageComponent } from './cities/pages/merchants-list-page/merchants-list-page.component';
import { MerchantsComponent } from './cities/pages/merchants/merchants.component';
import { routes } from './psp-admin-routes';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    MultilingualModule,
    ZXingScannerModule,
    EffectsModule.forFeature([ CitiesEffects ]),
    StoreModule.forFeature('cities', citiesReducer),
    FlexLayoutModule,
    NavModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  exports: [],
  declarations: [
    CityListPageComponent,
    CityPageComponent,
    CityDetailPageComponent,
    CityQrBatchesPageComponent,
    ActivateQrPageComponent,
    CityDetailComponent,
    OpeningHoursComponent,
    MerchantsListPageComponent,
    EditMerchantPageComponent,
    MerchantsComponent,
    EditMerchantComponent,
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
