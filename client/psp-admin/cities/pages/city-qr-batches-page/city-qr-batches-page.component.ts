import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { DialogService, PromptDialogResult } from '../../../../../../framework/client/dialog';
import { QRBatch } from '../../cities';
import { CitiesService } from '../../cities.service';

@Component({
  selector: 'psp-city-qr-batches-page',
  templateUrl: 'city-qr-batches-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CityQrBatchesPageComponent implements OnInit {
  qrBatches$ = new Subject<QRBatch[]>();
  cityId: string;

  constructor(private citiesService: CitiesService,
              private dialogService: DialogService,
              private translate: TranslateService,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.cityId = this.route.snapshot.params.id;
    this.getBatches();
  }

  downloadBatch(batch: QRBatch) {
    this.citiesService.downloadQrBatch(batch.id).subscribe(result => {
      window.open(result.download_url, '_blank');
    });
  }

  addButtonClicked() {
    this.dialogService.openPrompt({
      title: this.translate.instant('psp.enter_amount'),
      message: this.translate.instant('psp.generate_how_many_qr_codes'),
      ok: this.translate.instant('psp.ok'),
      cancel: this.translate.instant('psp.cancel'),
      inputType: 'number',
      initialValue: '200',
      required: true,
    }).afterClosed().subscribe((result: PromptDialogResult) => {
      if (result.submitted) {
        // Arbitrary delay to allow datastore indexes to update
        this.citiesService.createQrCodes(this.cityId, parseInt(result.value)).pipe(delay(500)).subscribe(() => this.getBatches());
      }
    });
  }

  getBatches() {
    this.citiesService.getQrBatches(this.cityId).subscribe(result => this.qrBatches$.next(result));
  }
}

