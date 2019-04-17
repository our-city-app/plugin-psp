import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { City } from '../../cities';

@Component({
  selector: 'psp-city-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'city-detail.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class CityDetailComponent {
  @Input() city: City;
  @Output() saved = new EventEmitter<City>();

  submit() {
    this.saved.emit(this.city);
  }
}
