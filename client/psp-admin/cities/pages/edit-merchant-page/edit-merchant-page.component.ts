import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterNull } from '../../../../../../framework/client/ngrx';
import { Loadable } from '../../../loadable';
import { Merchant } from '../../cities';
import { DeleteFileAction, GetMerchantAction, SaveMerchantAction, UploadFileAction } from '../../cities.actions';
import { CitiesState, getMerchant, getPictureStatus } from '../../cities.state';

@Component({
  selector: 'psp-edit-merchant-page',
  templateUrl: './edit-merchant-page.component.html',
  styleUrls: [ './edit-merchant-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMerchantPageComponent implements OnInit {
  merchant$: Observable<Merchant>;
  merchantStatus$: Observable<Loadable<Merchant>>;
  pictureStatus$: Observable<any>;
  private merchantId: number;

  constructor(private route: ActivatedRoute,
              private store: Store<CitiesState>) {
  }

  ngOnInit() {
    this.merchantId = parseInt(this.route.snapshot.params.merchantId);
    this.store.dispatch(new GetMerchantAction({ id: this.merchantId }));
    this.merchantStatus$ = this.store.pipe(select(getMerchant));
    this.merchant$ = this.merchantStatus$.pipe(map(m => m.data), filterNull());
    this.pictureStatus$ = this.store.pipe(select(getPictureStatus));
  }

  save(merchant: Merchant) {
    this.store.dispatch(new SaveMerchantAction(merchant));
  }

  async uploadFile(file: File) {
    const base64File: string = await this.fileToBase64(file);
    this.store.dispatch(new UploadFileAction({
      merchantId: this.merchantId,
      file: base64File,
    }));
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  deletePicture($event: number) {
    this.store.dispatch(new DeleteFileAction({
      merchantId: this.merchantId,
      id: $event,
    }));
  }
}
