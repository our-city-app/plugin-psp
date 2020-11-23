import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/typings';
import { select, Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Loadable } from '../../../loadable';
import { ActivateMerchant, Merchant, OpeningHourPeriod, UploadedFile } from '../../cities';
import { GetPlaceDetailsAction, SearchPlacesAction } from '../../cities.actions';
import { CitiesService } from '../../cities.service';
import { CitiesState, getPlaceDetails, getPlaces } from '../../cities.state';
import PlaceResult = google.maps.places.PlaceResult;

@Component({
  selector: 'psp-edit-merchant',
  templateUrl: './edit-merchant.component.html',
  styleUrls: [ './edit-merchant.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMerchantComponent implements OnInit, OnDestroy {
  @Input() set merchant(value: Merchant) {
    this._merchant = { ...value };
  }

  get merchant() {
    return this._merchant;
  }

  @Input() status: Loadable<ActivateMerchant>;
  @Input() uploadPictureStatus: Loadable<UploadedFile>;
  @Output() saved = new EventEmitter<Merchant>();
  @Output() deletePicture = new EventEmitter<number>();
  @Output() fileChosen = new EventEmitter<File>();

  currentPosition: Position;
  positionDenied = false;

  places$: Observable<Loadable<google.maps.places.PlaceResult[]>>;

  private destroyed$ = new Subject();
  private _merchant: Merchant;

  constructor(private citiesService: CitiesService,
              private store: Store<CitiesState>,
              private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.places$ = this.store.pipe(select(getPlaces));
    this.store.pipe(select(getPlaceDetails), takeUntil(this.destroyed$)).subscribe(place => {
      if (place.data) {
        const openingHours = (place.data.opening_hours ? place.data.opening_hours.periods : []) as OpeningHourPeriod[];
        this.merchant = {
          ...this.merchant,
          formatted_address: place.data.formatted_address || this.merchant.formatted_address,
          formatted_phone_number: place.data.formatted_phone_number || null,
          website: place.data.website || null,
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

  nameChanged(event: string | PlaceResult) {
    let location = '';
    if (this.currentPosition) {
      location = `${this.currentPosition.coords.latitude},${this.currentPosition.coords.longitude}`;
    } else if (!this.positionDenied) {
      this.getCurrentLocation();
    }
    if (typeof event === 'string') {
      this.store.dispatch(new SearchPlacesAction({ query: this.merchant.name as string, location }));
    } else {
      // In this case an option from the autocomplete was selected, and we don't it to be an object
      this.merchant = { ...this.merchant, name: event.name };
    }
  }

  setPlace($event: MatAutocompleteSelectedEvent) {
    const value: PlaceResult = $event.option.value;
    this.store.dispatch(new GetPlaceDetailsAction({ placeId: value.place_id as string }));
    const location: google.maps.LatLngLiteral | null = value.geometry && (value.geometry.location as any) || null;
    this.merchant = {
      ...this.merchant,
      place_id: value.place_id || null,
      name: value.name,
      formatted_address: value.formatted_address || value.vicinity || null,
      location: location ? { lat: location.lat, lon: location.lng } : null,
    };
  }

  setOpeningHours(openingHours: OpeningHourPeriod[]) {
    this.merchant = { ...this.merchant, opening_hours: openingHours };
  }

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(position => {
      this.currentPosition = position;
    }, () => {
      this.positionDenied = true;
    }, { maximumAge: 60000 });
  }

  fileChanged($event: Event) {
    const target = $event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.fileChosen.emit(target.files[0]);
      target.value = '';
    }
  }
}
