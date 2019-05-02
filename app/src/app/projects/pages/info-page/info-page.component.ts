import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Loadable } from '../../../loadable';
import { City } from '../../projects';
import { GetCityAction } from '../../projects.actions';
import { getCity, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-projects-page',
  templateUrl: './info-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class InfoPageComponent {
  city$: Observable<Loadable<City>>;

  constructor(private store: Store<ProjectsState>) {
    this.store.dispatch(new GetCityAction({ id: rogerthat.system.appId }));
    this.city$ = this.store.pipe(select(getCity));
  }
}
