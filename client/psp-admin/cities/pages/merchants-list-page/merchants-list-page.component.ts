import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Loadable } from '../../../loadable';
import { MerchantList } from '../../cities';
import { GetMerchantsAction, GetMoreMerchantsAction } from '../../cities.actions';
import { CitiesState, getMerchants } from '../../cities.state';

@Component({
  selector: 'psp-merchants-list-page',
  templateUrl: './merchants-list-page.component.html',
  styleUrls: [ './merchants-list-page.component.scss' ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantsListPageComponent implements OnInit {
  merchants$: Observable<Loadable<MerchantList>>;

  constructor(private store: Store<CitiesState>) {
  }

  ngOnInit() {
    this.store.dispatch(new GetMerchantsAction());
    this.merchants$ = this.store.pipe(select(getMerchants));
  }

  loadMore() {
    this.store.dispatch(new GetMoreMerchantsAction());
  }
}
