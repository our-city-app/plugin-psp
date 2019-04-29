import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Loadable } from '../../../loadable';
import { Project } from '../../projects';
import { AddParticipationAction, GetProjectsAction } from '../../projects.actions';
import { getProjects, ProjectsState } from '../../projects.state';

@Component({
  selector: 'app-projects-page',
  templateUrl: './projects-page.component.html',
  styleUrls: [ './projects-page.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsPageComponent implements OnInit {
  projects$: Observable<Loadable<Project[]>>;
  scannedQr: string | null = null;

  constructor(private store: Store<ProjectsState>,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.store.dispatch(new GetProjectsAction());
    this.projects$ = this.store.pipe(select(getProjects));
    this.scannedQr = this.route.snapshot.params.qr;
    // Remove query params
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  projectClicked(project: Project) {
    if (this.scannedQr) {
      this.store.dispatch(new AddParticipationAction({ projectId: project.id, qrContent: this.scannedQr }));
    }
    this.router.navigate([ project.id ], { relativeTo: this.route });
  }

  exit() {
    rogerthat.app.exit();
  }
}
