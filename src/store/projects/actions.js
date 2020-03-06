import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

let pending = {};

export function getProjects(clientId) {
  const queryString = clientId ? `?client_id=${clientId}` : '';
  return dispatch => {
    apiCall('GET', `${Constants.API_URL}/projects${queryString}`)
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

export function getProject(id) {
  return dispatch => {
    if (!pending[id]) {
      pending[id] = true;
      apiCall('GET', `${Constants.API_URL}/projects/${id}`)
        .then(res => dispatch(getProjectSuccess(res)))
        .catch(err => dispatch(getProjectFailure(err, id)));
    }
  };
}

export const getProjectSuccess = (project) => {
  pending[project.id] = false;
  return {
    type: 'GET_PROJECT_SUCCESS',
    payload: project,
  }
};

export const getProjectFailure = (error, projectId) => {
  pending[projectId] = false;
  return {
    type: 'GET_PROJECT_FAILURE',
    payload: error,
  }
};
