import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { delay, switchMap, take } from 'rxjs/operators';
import { DialogService, PromptDialogResult } from '../../../../../../framework/client/dialog';
import { filterNull } from '../../../../../../framework/client/ngrx';
import { QRBatch } from '../../cities';
import { CitiesService } from '../../cities.service';
import { CitiesState, getCurrentCityId } from '../../cities.state';

@Component({
  selector: 'psp-city-qr-batches-page',
  templateUrl: 'city-qr-batches-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CityQrBatchesPageComponent implements OnInit {
  qrBatches$ = new Subject<QRBatch[]>();
  cityId$: Observable<string>;

  constructor(private store: Store<CitiesState>,
              private citiesService: CitiesService,
              private dialogService: DialogService,
              private translate: TranslateService) {
  }

  ngOnInit() {
    this.cityId$ = this.store.pipe(select(getCurrentCityId), filterNull());
    this.getBatches();
  }

  downloadBatch(batch: QRBatch) {
    this.citiesService.downloadQrBatch(batch.id).subscribe(result => {
      window.open(result.download_url, '_blank');
    });
  }

  addButtonClicked() {
    this.dialogService.openPrompt({
      title: this.translate.instant('psp.generate_qr_codes'),
      message: this.translate.instant('psp.generate_how_many_qr_codes'),
      ok: this.translate.instant('psp.ok'),
      cancel: this.translate.instant('psp.cancel'),
      inputType: 'number',
      initialValue: '200',
      required: true,
    }).afterClosed().subscribe((result: PromptDialogResult) => {
      if (result.submitted) {
        this.cityId$.pipe(
          take(1),
          switchMap(cityId => this.citiesService.createQrCodes(cityId, parseInt(result.value))),
          // Arbitrary delay to allow datastore indexes to update
          delay(500),
        ).subscribe(() => this.getBatches());
      }
    });
  }

  getBatches() {
    this.cityId$.pipe(
      take(1),
      switchMap(cityId => this.citiesService.getQrBatches(cityId)),
    ).subscribe(result => this.qrBatches$.next(result));
  }
}

