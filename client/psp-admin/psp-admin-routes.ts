import { Routes } from '@angular/router';
import { ActivateQrPageComponent } from './cities/pages/activate-qr-page/activate-qr-page.component';
import { CityDetailPageComponent } from './cities/pages/city-detail-page/city-detail-page.component';
import { CityListPageComponent } from './cities/pages/city-list-page/city-list-page.component';
import { CityQrBatchesPageComponent } from './cities/pages/city-qr-batches-page/city-qr-batches-page.component';

export const routes: Routes = [
  { path: '', component: CityListPageComponent },
  { path: ':id', component: CityDetailPageComponent },
  { path: ':id/qr-batches', component: CityQrBatchesPageComponent },
  { path: ':id/activate-qr', component: ActivateQrPageComponent },
];