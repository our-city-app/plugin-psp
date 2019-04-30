import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Loadable } from '../../../loadable';
import { Project, ProjectDetails } from '../../projects';

const MAX_PERCENT = 89;  // height % of the colored trophy when there's 0 progress. 0 % -> fully colored
@Component({
  selector: 'app-project-card',
  templateUrl: 'project-card.component.html',
  styleUrls: [ './project-card.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardComponent implements OnChanges {
  @Input() project: Project;
  @Input() projectDetails: Loadable<ProjectDetails>;
  @Output() projectClicked = new EventEmitter<Project>();

  projectProgress = 0;
  personalCount = 0;
  totalCount = 0;
  uiPercent = `${MAX_PERCENT}%`;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.projectDetails) {
      this.recalulate();
    }
  }

  private recalulate() {
    let percent = 0;
    let personalCount = 0;
    let totalCount = 0;
    if (this.projectDetails && this.projectDetails.data) {
      totalCount = this.projectDetails.data.statistics.total;
      const currentActions = Math.min(this.projectDetails.data.action_count, this.projectDetails.data.statistics.total);
      percent = Math.floor(100 * currentActions / this.projectDetails.data.action_count);
      if (this.projectDetails.data.statistics.personal) {
        personalCount = this.projectDetails.data.statistics.personal.total;
      }
    }
    this.projectProgress = percent;
    const uiPercent = Math.round(MAX_PERCENT - (percent / 100) * MAX_PERCENT);
    this.uiPercent = `${uiPercent}%`;
    this.personalCount = personalCount;
    this.totalCount = totalCount;
  }
}
