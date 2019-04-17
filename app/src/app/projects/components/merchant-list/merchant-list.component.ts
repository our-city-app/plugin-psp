import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Loadable } from '../../../loadable';
import { Merchant, MerchantList } from '../../projects';

@Component({
  selector: 'merchant-list',
  templateUrl: './merchant-list.component.html',
  styleUrls: [ './merchant-list.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MerchantListComponent implements OnChanges {
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @Input() merchants: Loadable<MerchantList>;
  @Output() loadMore = new EventEmitter();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.merchants) {
      if (this.merchants.success) {
        this.infiniteScroll.complete();
      }
    }
  }

  trackById = (index: number, item: Merchant) => item.id;
}