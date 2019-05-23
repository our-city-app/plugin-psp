import { Route } from '../../../framework/client/app.routes';
import { ActivateQrPageComponent } from './cities/pages/activate-qr-page/activate-qr-page.component';
import { CityDetailPageComponent } from './cities/pages/city-detail-page/city-detail-page.component';
import { CityListPageComponent } from './cities/pages/city-list-page/city-list-page.component';
import { CityPageComponent } from './cities/pages/city-page/city-page.component';
import { CityQrBatchesPageComponent } from './cities/pages/city-qr-batches-page/city-qr-batches-page.component';
import { EditMerchantPageComponent } from './cities/pages/edit-merchant-page/edit-merchant-page.component';
import { MerchantsListPageComponent } from './cities/pages/merchants-list-page/merchants-list-page.component';
import { MerchantsComponent } from './cities/pages/merchants/merchants.component';

export const routes: Route[] = [
  { path: '', component: CityListPageComponent },
  {
    path: ':id',
    component: CityPageComponent,
    data: {
      label: 'psp.cities',
      meta: {},
    },
    children: [
      { path: '', redirectTo: 'activate-qr', pathMatch: 'full' },
      { path: 'details', component: CityDetailPageComponent },
      { path: 'qr-codes', component: CityQrBatchesPageComponent },
      {
        path: 'merchants', component: MerchantsComponent, children: [
          { path: '', component: MerchantsListPageComponent },
          { path: ':merchantId', component: EditMerchantPageComponent },
        ],
      },
      { path: 'activate-qr', component: ActivateQrPageComponent },
    ],
  },
];
