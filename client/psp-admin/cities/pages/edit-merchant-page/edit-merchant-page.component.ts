import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { filterNull } from '../../../../../../framework/client/ngrx';
import { Merchant } from '../../cities';
import { GetMerchantAction, SaveMerchantAction } from '../../cities.actions';
import { CitiesState, getMerchant } from '../../cities.state';

@Component({
  selector: 'psp-edit-merchant-page',
  templateUrl: './edit-merchant-page.component.html',
  styleUrls: [ './edit-merchant-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMerchantPageComponent implements OnInit {
  merchant$: Observable<Merchant>;
  merchantStatus$: Observable<any>;

  constructor(private route: ActivatedRoute,
              private store: Store<CitiesState>) {
  }

  ngOnInit() {
    const merchantId = parseInt(this.route.snapshot.params.merchantId);
    this.store.dispatch(new GetMerchantAction({ id: merchantId }));
    this.merchantStatus$ = this.store.pipe(select(getMerchant));
    this.merchant$ = this.merchantStatus$.pipe(map(m => m.data), filterNull());
  }

  save(merchant: Merchant) {
    this.store.dispatch(new SaveMerchantAction(merchant));
  }

}
