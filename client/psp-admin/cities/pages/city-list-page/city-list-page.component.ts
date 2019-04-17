import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { City } from '../../cities';
import { CitiesService } from '../../cities.service';

@Component({
  selector: 'psp-city-list-page-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'city-list-page.component.html',
})
export class CityListPageComponent implements OnInit {
  cities$: Observable<City[]>;

  constructor(private citiesService: CitiesService) {
  }

  ngOnInit() {
    this.cities$ = this.citiesService.getCities();
  }
}
