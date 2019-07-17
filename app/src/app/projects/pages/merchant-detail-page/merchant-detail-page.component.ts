import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Loadable } from '../../../loadable';
import { encodeURIObject, filterNull } from '../../../util';
import { AppMerchant } from '../../projects';
import { GetMerchantAction } from '../../projects.actions';
import { getMerchantDetails, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-merchant-detail-page',
  templateUrl: './merchant-detail-page.component.html',
  styleUrls: [ './merchant-detail-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantDetailPageComponent implements OnInit {
  merchant$: Observable<Loadable<AppMerchant>>;
  mapsUrl$: Observable<string>;
  openingHoursExpanded = false;
  expandIcon = 'arrow-dropdown';

  constructor(private store: Store<ProjectsState>,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    const merchantId = parseInt(this.route.snapshot.params.id, 10);
    this.store.dispatch(new GetMerchantAction({ id: merchantId }));
    this.merchant$ = this.store.pipe(select(getMerchantDetails));
    this.mapsUrl$ = this.merchant$.pipe(map(m => m.data), filterNull(), map(m => {
      const params: any = {
        api: 1,
        destination: m.formatted_address,
      };
      if (m.place_id) {
        params.destination_place_id = m.place_id;
      }
      return `https://www.google.com/maps/dir/?${encodeURIObject(params)}`;
    }));
  }

  toggleOpeningHours() {
    this.openingHoursExpanded = !this.openingHoursExpanded;
    this.expandIcon = this.openingHoursExpanded ? 'arrow-dropup' : 'arrow-dropdown';
  }

}
