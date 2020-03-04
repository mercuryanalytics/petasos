import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getProjects(clientId) {
  return dispatch => {
    apiCall('GET', `${Constants.API_URL}/projects`)
      .then(res => dispatch(getProjectsSuccess(res)))
      .catch(err => dispatch(getProjectsFailure(err)));
  };
}

export const getProjectsSuccess = (projects) => ({
  type: 'GET_PROJECTS_SUCCESS',
  payload: projects,
});

export const getProjectsFailure = (error) => ({
  type: 'GET_PROJECTS_FAILURE',
  payload: error,
});

export const getProject = (clientId, id) => ({
  type: 'GET_PROJECT',
  payload: {},
});

export const getProjectSuccess = (project) => ({
  type: 'GET_PROJECT_SUCCESS',
  payload: project,
});

export const getProjectFailure = (error) => ({
  type: 'GET_PROJECT_FAILURE',
  payload: error,
});
