import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { GetProjectsAction } from '../../projects.actions';
import { ProjectsState } from '../../projects.state';

@Component({
  templateUrl: './home-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class HomePageComponent implements OnInit {
  constructor(private store: Store<ProjectsState>) {
  }

  ngOnInit() {
    this.store.dispatch(new GetProjectsAction());
  }

  exit() {
    rogerthat.app.exit();
  }
}
