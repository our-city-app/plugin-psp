import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CityDetailComponent } from './cities/components/city-detail/city-detail.component';
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
    TranslateModule.forChild(),
    FlexLayoutModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTabsModule,
  ],
  exports: [],
  declarations: [
    CityListPageComponent,
    CityDetailPageComponent,
    CityQrBatchesPageComponent,
    CityDetailComponent,
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
