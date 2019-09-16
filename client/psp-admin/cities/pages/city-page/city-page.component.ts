import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getIdentity } from '../../../../../../framework/client/identity';
import { SecondarySidebarItem } from '../../../../../../framework/client/nav/sidebar/interfaces';
import { filterNull } from '../../../../../../framework/client/ngrx';
import { CityPermission, PSPPermission } from '../../../permissions';
import { SetCurrentCityAction } from '../../cities.actions';
import { CitiesState } from '../../cities.state';

interface Tab extends SecondarySidebarItem {
  permissions: (PSPPermission | CityPermission)[];
}

@Component({
  selector: 'psp-city-page',
  templateUrl: './city-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CityPageComponent implements OnInit {
  items: Tab[] = [
    {
      label: 'psp.details',
      icon: 'dashboard',
      route: 'details',
      permissions: [ PSPPermission.GET_CITY, CityPermission.GET_CITY ],
    },
    {
      label: 'psp.qr_codes',
      icon: 'photo',
      route: 'qr-codes',
      permissions: [ PSPPermission.LIST_QR_BATCHES, CityPermission.LIST_QR_BATCHES ],
    },
    {
      label: 'psp.merchants',
      icon: 'business',
      route: 'merchants',
      permissions: [ PSPPermission.LIST_MERCHANTS, CityPermission.LIST_MERCHANTS ],
    },
    {
      label: 'psp.activate_qr',
      icon: 'add_location',
      route: 'activate-qr',
      permissions: [ PSPPermission.CREATE_MERCHANT, CityPermission.CREATE_MERCHANT ],
    },
  ];
  tabs$: Observable<Tab[]>;

  constructor(private store: Store<CitiesState>,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const cityId: string = this.route.snapshot.params.id;
    this.store.dispatch(new SetCurrentCityAction({ id: cityId }));
    this.tabs$ = this.store.pipe(select(getIdentity),
      filterNull(),
      map(identity => this.items.filter(i => {
        for (const permission of i.permissions) {
          if (identity.permissions.includes(permission.replace('%(city_id)s', cityId))) {
            return true;
          }
        }
        return false;
      })));
  }
}
