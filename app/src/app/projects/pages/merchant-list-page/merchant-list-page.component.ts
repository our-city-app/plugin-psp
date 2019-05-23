import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Loadable } from '../../../loadable';
import { AppMerchantList } from '../../projects';
import { GetMerchantsAction, GetMoreMerchantsAction } from '../../projects.actions';
import { getMerchants, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-merchant-list-page',
  templateUrl: './merchant-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MerchantListPageComponent implements OnInit {
  merchants$: Observable<Loadable<AppMerchantList>>;

  constructor(private store: Store<ProjectsState>) {
  }

  ngOnInit() {
    this.store.dispatch(new GetMerchantsAction());
    this.merchants$ = this.store.pipe(select(getMerchants));
  }

  loadMore() {
    this.store.dispatch(new GetMoreMerchantsAction());
  }

}
