import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SecondarySidebarItem, SidebarTitle } from '../../../../../../framework/client/nav/sidebar/interfaces';
import { filterNull } from '../../../../../../framework/client/ngrx';
import { Loadable } from '../../../../../app/src/app/loadable';
import { City } from '../../cities';
import { GetCityAction, SetCurrentCityAction } from '../../cities.actions';
import { CitiesState, getCity } from '../../cities.state';

@Component({
  selector: 'psp-city-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <secondary-sidenav [sidebarItems]="items" [sidebarTitle]="title$ | async"></secondary-sidenav>`,
})
export class CityPageComponent implements OnInit {
  items: SecondarySidebarItem[] = [
    {
      label: 'psp.details',
      icon: 'dashboard',
      route: 'details',
    },
    {
      label: 'psp.qr_codes',
      icon: 'photo',
      route: 'qr-codes',
    },
    {
      label: 'psp.merchants',
      icon: 'business',
      route: 'merchants',
    },
    {
      label: 'psp.activate_qr',
      icon: 'add_location',
      route: 'activate-qr',
    },
  ];
  city$: Observable<Loadable<City>>;
  title$: Observable<SidebarTitle>;

  constructor(private store: Store<CitiesState>,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const cityId: string = this.route.snapshot.params.id;
    this.store.dispatch(new SetCurrentCityAction({ id: cityId }));
    this.store.dispatch(new GetCityAction());
    this.city$ = this.store.pipe(select(getCity));
    this.title$ = this.city$.pipe(
      map(c => c.data),
      filterNull(),
      map(city => ({
        icon: city.avatar_url ? null : 'business',
        imageUrl: city.avatar_url,
        isTranslation: false,
        label: city.name,
      } as SidebarTitle)));
  }
}
