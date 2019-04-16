import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, take, withLatestFrom } from 'rxjs/operators';
import { Loadable } from '../../../loadable';
import { MerchantList } from '../../projects';
import { GetMerchantsAction, GetMoreMerchantsAction } from '../../projects.actions';
import { getCurrentProjectId, getMerchants, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-merchant-list-page',
  templateUrl: './merchant-list-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MerchantListPageComponent implements OnInit {
  projectId$: Observable<number>;
  merchants$: Observable<Loadable<MerchantList>>;

  constructor(private store: Store<ProjectsState>) {
  }

  ngOnInit() {
    this.projectId$ = this.store.pipe(select(getCurrentProjectId), filter(p => p !== null)) as Observable<number>;
    this.projectId$.pipe(take(1)).subscribe(projectId => {
    });
    this.store.dispatch(new GetMerchantsAction());
    this.merchants$ = this.store.pipe(select(getMerchants));
  }

  loadMore() {
    this.store.dispatch(new GetMoreMerchantsAction());
  }

}
