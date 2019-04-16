import { onLoadableError, onLoadableLoad, onLoadableSuccess } from '../loadable';
import { updateItem } from '../util';
import { ProjectsActions, ProjectsActionTypes } from './projects.actions';
import { initialProjectsState, ProjectsState } from './projects.state';

export function projectsReducer(state = initialProjectsState, action: ProjectsActions): ProjectsState {
  switch (action.type) {
    case ProjectsActionTypes.SET_PROJECT:
      return { ...state, currentProject: action.payload.id };
    case ProjectsActionTypes.GET_PROJECTS:
      return { ...state, projects: onLoadableLoad() };
    case ProjectsActionTypes.GET_PROJECTS_COMPLETE:
      return { ...state, projects: onLoadableSuccess(action.payload) };
    case ProjectsActionTypes.GET_PROJECTS_FAILED:
      return { ...state, projects: onLoadableError(action.payload) };
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
          results: [ ...state.merchants.data!.results, ...action.payload.results ],
        }),
      };
    case ProjectsActionTypes.GET_MORE_MERCHANTS_FAILED:
      return { ...state, merchants: onLoadableError(action.payload) };
    case ProjectsActionTypes.ADD_PARTICIPATION_COMPLETE:
      return {
        ...state,
        currentProject: action.payload.id,
        projects: {
          ...state.projects,
          data: updateItem(state.projects.data || [], action.payload, 'id'),
        },
      };
  }
  return state;
}
