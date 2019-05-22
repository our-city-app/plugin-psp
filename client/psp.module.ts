import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { MetaGuard } from '@ngx-meta/core';
import { Route } from '../../framework/client/app.routes';
import { AddRoutesAction } from '../../framework/client/nav/sidebar/actions';
import { IAppState } from '../../framework/client/ngrx';

const routes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'psp' },
  {
  path: 'psp',
  loadChildren: './psp-admin/psp-admin.module#PspAdminModule',
  canActivate: [ MetaGuard ],
  data: {
    id: 'psp_admin',
    description: 'psp.psp_admin',
    icon: 'location_city',
    label: 'psp.psp_admin',
    meta: { title: 'psp.psp_admin' },
  },
} ];

@NgModule({
  imports: [ RouterModule.forChild(routes) ],
  exports: [],
  declarations: [],
  providers: [],
})
export class PspModule {
  constructor(private store: Store<IAppState>) {
    this.store.dispatch(new AddRoutesAction(routes));
  }

}
