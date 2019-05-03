import { onLoadableError, onLoadableLoad, onLoadableSuccess } from '../loadable';
import { updateItem } from '../util';
import { ProjectsActions, ProjectsActionTypes } from './projects.actions';
import { initialProjectsState, ProjectsState } from './projects.state';

export function projectsReducer(state = initialProjectsState, action: ProjectsActions): ProjectsState {
  switch (action.type) {
    case ProjectsActionTypes.GET_CITY:
      return {
        ...state,
        city: onLoadableLoad(initialProjectsState.city.data),
      };
    case ProjectsActionTypes.GET_CITY_COMPLETE:
      return { ...state, city: onLoadableSuccess(action.payload) };
    case ProjectsActionTypes.GET_CITY_FAILED:
      return { ...state, city: onLoadableError(action.payload) };
    case ProjectsActionTypes.GET_PROJECT_DETAILS:
      return {
        ...state,
        currentProjectId: action.payload.id,
        projectDetails: onLoadableLoad(initialProjectsState.projectDetails.data),
      };
    case ProjectsActionTypes.GET_PROJECT_DETAILS_COMPLETE:
      return {
        ...state,
        projectDetails: onLoadableSuccess(action.payload),
      };
    case ProjectsActionTypes.GET_PROJECT_DETAILS_FAILED:
      return {
        ...state,
        projectDetails: onLoadableError(action.payload),
      };
    case ProjectsActionTypes.GET_PROJECTS:
      return { ...state, projects: onLoadableLoad(state.projects.data) };
    case ProjectsActionTypes.GET_PROJECTS_COMPLETE:
      return { ...state, projects: onLoadableSuccess(action.payload) };
    case ProjectsActionTypes.GET_PROJECTS_FAILED:
      return { ...state, projects: onLoadableError(action.payload) };
    case ProjectsActionTypes.GET_MERCHANT:
      return { ...state, merchantDetails: onLoadableLoad() };
    case ProjectsActionTypes.GET_MERCHANT_COMPLETE:
      return { ...state, merchantDetails: onLoadableSuccess(action.payload) };
    case ProjectsActionTypes.GET_MERCHANT_FAILED:
      return { ...state, merchantDetails: onLoadableError(action.payload) };
    case ProjectsActionTypes.GET_MERCHANTS:
      return { ...state, merchants: onLoadableLoad() };
    case ProjectsActionTypes.GET_MERCHANTS_COMPLETE:
      return { ...state, merchants: onLoadableSuccess(action.payload) };
    case ProjectsActionTypes.GET_MERCHANTS_FAILED:
      return { ...state, merchants: onLoadableError(action.payload) };
    case ProjectsActionTypes.GET_MORE_MERCHANTS:
      return { ...state, merchants: onLoadableLoad(state.merchants.data) };
    case ProjectsActionTypes.GET_MORE_MERCHANTS_COMPLETE:
      return {
        ...state,
        merchants: onLoadableSuccess({
          ...action.payload,
          results: [ ...(state.merchants.data ? state.merchants.data.results : []), ...action.payload.results ],
        }),
      };
    case ProjectsActionTypes.GET_MORE_MERCHANTS_FAILED:
      return { ...state, merchants: onLoadableError(action.payload) };
    case ProjectsActionTypes.ADD_PARTICIPATION_COMPLETE:
      return {
        ...state,
        currentProjectId: action.payload.id,
        projects: {
          ...state.projects,
          data: updateItem(state.projects.data || [], action.payload, 'id'),
        },
        projectDetails: onLoadableSuccess(action.payload),
      };
  }
  return state;
}
