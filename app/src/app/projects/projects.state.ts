import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DEFAULT_LIST_LOADABLE, DEFAULT_LOADABLE, Loadable } from '../loadable';
import { City, AppMerchant, AppMerchantList, Project, ProjectDetails } from './projects';

export interface ProjectsState {
  currentProjectId: number | null;
  projects: Loadable<Project[]>;
  projectDetails: Loadable<ProjectDetails>;
  merchants: Loadable<AppMerchantList>;
  city: Loadable<City>;
  merchantDetails: Loadable<AppMerchant>;
}

const getFeatureState = createFeatureSelector<ProjectsState>('projects');

export const initialProjectsState: ProjectsState = {
  currentProjectId: null,
  projects: DEFAULT_LIST_LOADABLE,
  projectDetails: DEFAULT_LOADABLE,
  merchants: DEFAULT_LOADABLE,
  city: DEFAULT_LOADABLE,
  merchantDetails: DEFAULT_LOADABLE,
};

export const getCurrentProjectId = createSelector(getFeatureState, s => s.currentProjectId);
export const getCurrentProject = createSelector(getFeatureState, s => s.projectDetails);
export const getProjects = createSelector(getFeatureState, s => s.projects);
export const getMerchants = createSelector(getFeatureState, s => s.merchants);
export const getMerchantDetails = createSelector(getFeatureState, s => s.merchantDetails);
export const getCity = createSelector(getFeatureState, s => s.city);


