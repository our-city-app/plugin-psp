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
  templateUrl: './info-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoPageComponent {
}
