import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DEFAULT_LIST_LOADABLE, DEFAULT_LOADABLE, Loadable } from '../loadable';
import { MerchantList, ProjectDetails } from './projects';

export interface ProjectsState {
  currentProject: number | null,
  projects: Loadable<ProjectDetails[]>;
  merchants: Loadable<MerchantList>
}

const getFeatureState = createFeatureSelector<ProjectsState>('projects');

export const initialProjectsState: ProjectsState = {
  currentProject: null,
  projects: DEFAULT_LIST_LOADABLE,
  merchants: DEFAULT_LOADABLE,
};

export const getCurrentProjectId = createSelector(getFeatureState, s => s.currentProject);
export const getCurrentProject = createSelector(getFeatureState, getCurrentProjectId, (s, currentProjectId) => {
  return {
    ...s.projects,
    data: s.projects.data && s.projects.data.find(p => p.id === currentProjectId) || null,
  };
});
export const getProjects = createSelector(getFeatureState, s => s.projects);
export const getMerchants = createSelector(getFeatureState, s => s.merchants);


