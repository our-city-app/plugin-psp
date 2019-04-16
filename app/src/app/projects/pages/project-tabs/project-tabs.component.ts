import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SetProjectAction } from '../../projects.actions';
import { ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-project-tabs',
  templateUrl: './project-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProjectTabsComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private store: Store<ProjectsState>) {
  }

  ngOnInit() {
    const projectId: number = parseInt(this.route.snapshot.params.id);
    this.store.dispatch(new SetProjectAction({ id: projectId }));
  }

}
