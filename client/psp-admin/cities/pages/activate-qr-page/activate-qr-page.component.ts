import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { select, Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { filterNull } from '../../../../../../framework/client/ngrx';
import { Loadable } from '../../../../../app/src/app/loadable';
import { ActivateMerchant, Merchant } from '../../cities';
import { LinkQRActionAction } from '../../cities.actions';
import { CitiesService } from '../../cities.service';
import { CitiesState, getCurrentCityId, getNewMerchant } from '../../cities.state';
import { EditMerchantComponent } from '../../components/edit-merchant/edit-merchant.component';


@Component({
  selector: 'psp-activate-qr-page',
  templateUrl: 'activate-qr-page.component.html',
  styleUrls: [ 'activate-qr-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivateQrPageComponent implements OnInit {
  @ViewChild(EditMerchantComponent) editMerchantComponent: EditMerchantComponent;
  showScanner = false;
  data: ActivateMerchant = {
    qr_content: null,
    merchant: {
      name: null,
      formatted_address: null,
      formatted_phone_number: null,
      location: null,
      opening_hours: [],
      website: null,
      place_id: null,
    },
  };
  currentDevice: MediaDeviceInfo | null = null;

  cityId$: Observable<string>;
  activateStatus$: Observable<Loadable<Merchant>>;

  constructor(private citiesService: CitiesService,
              private store: Store<CitiesState>) {
  }

  ngOnInit(): void {
    this.activateStatus$ = this.store.pipe(select(getNewMerchant));
    this.cityId$ = this.store.pipe(select(getCurrentCityId), filterNull());
  }


  linkQr(form: NgForm, merchant: Merchant) {
    if (form.form.valid) {
      this.cityId$.pipe(take(1)).subscribe(cityId => this.store.dispatch(new LinkQRActionAction({
        cityId,
        data: { ...this.data, merchant },
      })));
    }
  }

  scanQR() {
    this.showScanner = !this.showScanner;
    this.editMerchantComponent.getCurrentLocation();
  }

  qrScanned(event: string) {
    this.data = { ...this.data, qr_content: event };
    this.showScanner = false;
  }

  setDefaultDevice($event: MediaDeviceInfo[]) {
    this.currentDevice = $event.length ? $event[ 0 ] : null;
  }
}
