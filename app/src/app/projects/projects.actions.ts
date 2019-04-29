import { HttpErrorResponse } from '@angular/common/http';
import { AlertOptions, LoadingOptions } from '@ionic/core';
import { Action } from '@ngrx/store';
import { MerchantList, Project, ProjectDetails } from './projects';

export const enum ProjectsActionTypes {
  GET_PROJECT_DETAILS = '[projects] Get project details',
  GET_PROJECT_DETAILS_COMPLETE = '[projects] Get project details complete',
  GET_PROJECT_DETAILS_FAILED = '[projects] Get project details failed',
  GET_PROJECTS = '[projects] Get projects',
  GET_PROJECTS_COMPLETE = '[projects] Get projects complete',
  GET_PROJECTS_FAILED = '[projects] Get projects failed',
  ADD_PARTICIPATION = '[projects] Add participation',
  ADD_PARTICIPATION_COMPLETE = '[projects] Add participation complete',
  ADD_PARTICIPATION_FAILED = '[projects] Add participation failed',
  GET_MERCHANTS = '[projects] Get merchants',
  GET_MERCHANTS_COMPLETE = '[projects] Get merchants complete',
  GET_MERCHANTS_FAILED = '[projects] Get merchants failed',
  GET_MORE_MERCHANTS = '[projects] Get more merchants',
  GET_MORE_MERCHANTS_COMPLETE = '[projects] Get more merchants complete',
  GET_MORE_MERCHANTS_FAILED = '[projects] Get more merchants failed',
  SHOW_DIALOG = '[projects] Show dialog',
  DISMISS_DIALOG = '[projects] Dismiss dialog',
}

export class GetProjectDetailsAction implements Action {
  readonly type = ProjectsActionTypes.GET_PROJECT_DETAILS;

  constructor(public payload: { id: number }) {
  }
}

export class GetProjectDetailsCompleteAction implements Action {
  readonly type = ProjectsActionTypes.GET_PROJECT_DETAILS_COMPLETE;

  constructor(public payload: ProjectDetails) {
  }
}

export class GetProjectDetailsFailedAction implements Action {
  readonly type = ProjectsActionTypes.GET_PROJECT_DETAILS_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class GetProjectsAction implements Action {
  readonly type = ProjectsActionTypes.GET_PROJECTS;
}

export class GetProjectsCompleteAction implements Action {
  readonly type = ProjectsActionTypes.GET_PROJECTS_COMPLETE;

  constructor(public payload: Project[]) {
  }
}

export class GetProjectsFailedAction implements Action {
  readonly type = ProjectsActionTypes.GET_PROJECTS_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class AddParticipationAction implements Action {
  readonly type = ProjectsActionTypes.ADD_PARTICIPATION;

  constructor(public payload: {projectId: number, qrContent: string }) {
  }
}

export class AddParticipationCompleteAction implements Action {
  readonly type = ProjectsActionTypes.ADD_PARTICIPATION_COMPLETE;

  constructor(public payload: ProjectDetails) {
  }
}

export class AddParticipationFailedAction implements Action {
  readonly type = ProjectsActionTypes.ADD_PARTICIPATION_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class GetMerchantsAction implements Action {
  readonly type = ProjectsActionTypes.GET_MERCHANTS;
}

export class GetMerchantsCompleteAction implements Action {
  readonly type = ProjectsActionTypes.GET_MERCHANTS_COMPLETE;

  constructor(public payload: MerchantList) {
  }
}

export class GetMerchantsFailedAction implements Action {
  readonly type = ProjectsActionTypes.GET_MERCHANTS_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class GetMoreMerchantsAction implements Action {
  readonly type = ProjectsActionTypes.GET_MORE_MERCHANTS;
}

export class GetMoreMerchantsCompleteAction implements Action {
  readonly type = ProjectsActionTypes.GET_MORE_MERCHANTS_COMPLETE;

  constructor(public payload: MerchantList) {
  }
}

export class GetMoreMerchantsFailedAction implements Action {
  readonly type = ProjectsActionTypes.GET_MORE_MERCHANTS_FAILED;

  constructor(public payload: HttpErrorResponse) {
  }
}

export class ShowDialogAction implements Action {
  readonly type = ProjectsActionTypes.SHOW_DIALOG;

  constructor(public data: { type: 'dialog', options: AlertOptions } | { type: 'loading', options: LoadingOptions }) {
  }
}

export class DismissDialogAction implements Action {
  readonly type = ProjectsActionTypes.DISMISS_DIALOG;

  constructor(public dialogType: 'dialog' | 'loading') {
  }
}

export type ProjectsActions = GetProjectDetailsAction
  | GetProjectDetailsCompleteAction
  | GetProjectDetailsFailedAction
  | GetProjectsAction
  | GetProjectsCompleteAction
  | GetProjectsFailedAction
  | AddParticipationAction
  | AddParticipationCompleteAction
  | AddParticipationFailedAction
  | GetMerchantsAction
  | GetMerchantsCompleteAction
  | GetMerchantsFailedAction
  | GetMoreMerchantsAction
  | GetMoreMerchantsCompleteAction
  | GetMoreMerchantsFailedAction
  | ShowDialogAction
  | DismissDialogAction;

