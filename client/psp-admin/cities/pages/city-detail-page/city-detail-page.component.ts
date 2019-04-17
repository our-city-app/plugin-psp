import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { City } from '../../cities';
import { CitiesService } from '../../cities.service';

@Component({
  selector: 'psp-city-detail-page-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'city-detail-page.component.html',
})
export class CityDetailPageComponent implements OnInit {
  city$: Observable<City>;

  constructor(private citiesService: CitiesService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    const cityId: string = this.route.snapshot.params.id;
    this.city$ = this.citiesService.getCity(cityId);
  }

  saveCity(city: City) {
    this.citiesService.saveCity(city).subscribe();
  }

}
