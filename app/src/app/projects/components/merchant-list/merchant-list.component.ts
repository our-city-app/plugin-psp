import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Loadable } from '../../../loadable';
import { AppMerchant, AppMerchantList } from '../../projects';

@Component({
  selector: 'merchant-list',
  templateUrl: './merchant-list.component.html',
  styleUrls: [ './merchant-list.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantListComponent implements OnChanges {
  @ViewChild(IonInfiniteScroll, { static: true }) infiniteScroll: IonInfiniteScroll;
  @Input() merchants: Loadable<AppMerchantList>;
  @Output() loadMore = new EventEmitter();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.merchants) {
      if (this.merchants.success) {
        this.infiniteScroll.complete();
      }
    }
  }

  trackById = (index: number, item: AppMerchant) => item.id;
}
