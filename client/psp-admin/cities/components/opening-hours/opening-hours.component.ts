import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { OpeningHourPeriod } from '../../../../../app/src/app/projects/projects';


@Component({
  selector: 'psp-opening-hours',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'opening-hours.component.html',
  styles: [ `.opening-hour-list {
    display: flex;
    align-items: center;
  }

  .opening-hour-list .mat-form-field {
    margin: 0 16px;
  }` ],
})

export class OpeningHoursComponent implements OnChanges {
  DAYS = [
    { label: 'psp.monday', value: 1 },
    { label: 'psp.tuesday', value: 2 },
    { label: 'psp.wednesday', value: 3 },
    { label: 'psp.thursday', value: 4 },
    { label: 'psp.friday', value: 5 },
    { label: 'psp.saturday', value: 6 },
    { label: 'psp.sunday', value: 0 },
  ];
  HOUR_SLOTS = this.getHourSlots();
  checkedOptions: { [ key: number ]: boolean };
  @Input() openingHours: OpeningHourPeriod[];
  @Output() changed = new EventEmitter<OpeningHourPeriod[]>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.openingHours) {
      this.checkedOptions = { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
      for (const day of this.openingHours) {
        this.checkedOptions[ day.open.day ] = true;
      }
    }
  }

  private getHourSlots() {
    const slots: { label: string, value: string }[] = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 4; j++) {
        const hourStr = `${i}`.padStart(2, '0');
        const minuteStr = `${j * 15}`.padStart(2, '0');
        slots.push({ value: `${hourStr}${minuteStr}`, label: `${hourStr}:${minuteStr}` });
      }
    }
    return slots;
  }

  setCloseTime(openingHour: OpeningHourPeriod) {
    openingHour.close = { day: openingHour.open.day, time: '0000' };
    this.setChanged();
  }

  setChanged() {
    this.changed.emit(this.openingHours);
  }

  addHours() {
    this.openingHours.push({ open: { day: 0, time: '0000' }, close: { day: 0, time: '0000' } });
    this.setChanged();
  }

  deleteOpeningHour(openingHour: OpeningHourPeriod) {
    this.openingHours = this.openingHours.filter(h => h !== openingHour);
    this.setChanged();
  }
}
