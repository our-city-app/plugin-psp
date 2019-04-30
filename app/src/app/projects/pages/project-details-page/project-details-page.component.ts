import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Loadable } from '../../../loadable';
import { ProjectDetails } from '../../projects';
import { GetProjectDetailsAction } from '../../projects.actions';
import { getCurrentProject, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-project-details-page',
  templateUrl: 'project-details-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsPageComponent implements OnInit {
  project$: Observable<Loadable<ProjectDetails>>;

  constructor(private store: Store<ProjectsState>,
              private route: ActivatedRoute) {
    const projectId = parseInt(this.route.snapshot.params.id, 10);
    this.store.dispatch(new GetProjectDetailsAction({ id: projectId }));
  }

  ngOnInit() {
    this.project$ = this.store.pipe(select(getCurrentProject));
  }
}
