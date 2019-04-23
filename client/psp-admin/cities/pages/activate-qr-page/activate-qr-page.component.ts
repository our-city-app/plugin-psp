import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';

import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Loadable } from '../../../../../app/src/app/loadable';
import { ActivateMerchant, OpeningHours } from '../../cities';
import { GetPlaceDetailsAction, LinkQRActionAction, SearchPlacesAction } from '../../cities.actions';
import { CitiesService } from '../../cities.service';
import { CitiesState, getNewMerchant, getPlaceDetails, getPlaces } from '../../cities.state';
import PlaceResult = google.maps.places.PlaceResult;


@Component({
  selector: 'psp-activate-qr-page',
  templateUrl: 'activate-qr-page.component.html',
  styleUrls: [ 'activate-qr-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivateQrPageComponent implements OnInit, OnDestroy {
  showScanner = false;
  data: ActivateMerchant = {
    qr_content: null,
    name: null,
    formatted_address: null,
    location: null,
    opening_hours: [],
    place_id: null,
  };
  currentDevice: MediaDeviceInfo | null = null;
  cityId: string;
  currentPosition: Position;
  positionDenied = false;

  places$: Observable<Loadable<google.maps.places.PlaceResult[]>>;
  activateStatus$: Observable<Loadable<ActivateMerchant>>;

  private destroyed$ = new Subject();

  constructor(private citiesService: CitiesService,
              private store: Store<CitiesState>,
              private route: ActivatedRoute,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.cityId = this.route.snapshot.params.id;
    this.places$ = this.store.pipe(select(getPlaces));
    this.activateStatus$ = this.store.pipe(select(getNewMerchant));
    this.store.pipe(select(getPlaceDetails), takeUntil(this.destroyed$)).subscribe(place => {
      if (place.data) {
        const openingHours = place.data.opening_hours ? place.data.opening_hours.periods : [];
        this.data = {
          ...this.data,
          formatted_address: place.data.formatted_address || this.data.formatted_address,
          opening_hours: openingHours,
        };
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  linkQr(form: NgForm) {
    if (form.form.valid) {
      this.store.dispatch(new LinkQRActionAction({ cityId: this.cityId, data: this.data }));
    }
  }

  scanQR() {
    this.showScanner = !this.showScanner;
    this.getCurrentLocation();
  }

  qrScanned(event: string) {
    this.data = { ...this.data, qr_content: event };
    this.showScanner = false;
  }

  setDefaultDevice($event: MediaDeviceInfo[]) {
    this.currentDevice = $event.length ? $event[ 0 ] : null;
  }

  nameChanged(event: string | PlaceResult) {
    let location = '';
    if (this.currentPosition) {
      location = `${this.currentPosition.coords.latitude},${this.currentPosition.coords.longitude}`;
    } else if (!this.positionDenied) {
      this.getCurrentLocation();
    }
    if (typeof event === 'string') {
      this.store.dispatch(new SearchPlacesAction({ query: this.data.name as string, location }));
    } else {
      // In this case an option from the autocomplete was selected, and we don't it to be an object
      this.data = { ...this.data, name: event.name };
    }
  }

  setPlace($event: MatAutocompleteSelectedEvent) {
    const value: PlaceResult = $event.option.value;
    this.store.dispatch(new GetPlaceDetailsAction({ placeId: value.place_id as string }));
    const location: google.maps.LatLngLiteral | null = value.geometry && (value.geometry.location as any) || null;
    this.data = {
      ...this.data,
      place_id: value.place_id || null,
      name: value.name,
      formatted_address: value.formatted_address || value.vicinity || null,
      location,
    };
  }

  setOpeningHours(openingHours: OpeningHours[]) {
    this.data = { ...this.data, opening_hours: openingHours };
  }

  private getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(position => {
      this.currentPosition = position;
    }, () => {
      this.positionDenied = true;
    }, { maximumAge: 60000 });
  }
}