import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { OpeningHourPeriod } from '../../../../../app/src/app/projects/projects';


const enum DAY {
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY
}

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
export class OpeningHoursComponent {
  DAYS = [
    { label: 'psp.monday', value: DAY.MONDAY },
    { label: 'psp.tuesday', value: DAY.TUESDAY },
    { label: 'psp.wednesday', value: DAY.WEDNESDAY },
    { label: 'psp.thursday', value: DAY.THURSDAY },
    { label: 'psp.friday', value: DAY.FRIDAY },
    { label: 'psp.saturday', value: DAY.SATURDAY },
    { label: 'psp.sunday', value: DAY.SUNDAY },
  ];
  HOUR_SLOTS = this.getHourSlots();
  @Input() openingHours: OpeningHourPeriod[];
  @Output() changed = new EventEmitter<OpeningHourPeriod[]>();

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
    this.openingHours.push({ open: { day: DAY.MONDAY, time: '0000' }, close: { day: DAY.MONDAY, time: '0000' } });
    this.setChanged();
  }

  deleteOpeningHour(openingHour: OpeningHourPeriod) {
    this.openingHours = this.openingHours.filter(h => h !== openingHour);
    this.setChanged();
  }
}
