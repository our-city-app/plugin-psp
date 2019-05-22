import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Loadable } from '../../../../../app/src/app/loadable';
import { City } from '../../cities';
import { GetCityAction, SaveCityAction } from '../../cities.actions';
import { CitiesState, getCity } from '../../cities.state';

@Component({
  selector: 'psp-city-detail-page-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'city-detail-page.component.html',
})
export class CityDetailPageComponent implements OnInit {
  city$: Observable<Loadable<City>>;

  constructor(private store: Store<CitiesState>) {
  }

  ngOnInit(): void {
    this.store.dispatch(new GetCityAction());
    this.city$ = this.store.pipe(select(getCity));
  }

  saveCity(city: City) {
    this.store.dispatch(new SaveCityAction(city));
  }

}
