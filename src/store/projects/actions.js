import { hasValue, queryState, handleActionFailure } from '../index';
import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getProjects(clientId) {
  const queryString = hasValue(clientId) ? `?client_id=${clientId}` : '';
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/projects`,
      `${Constants.API_URL}/projects${queryString}`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/projects${queryString}`)
      : queryState(state => ({
        target: state.projectsReducer.projects,
        filters: [{ run: hasValue(clientId), filter: item => item.domain_id === clientId }],
      }))
  ).then(
    res => dispatch(getProjectsSuccess(res)),
    err => handleActionFailure(err, dispatch(getProjectsFailure(err))),
  );
}

export const getProjectsSuccess = (projects) => ({
  type: 'GET_PROJECTS_SUCCESS',
  payload: projects,
});

export const getProjectsFailure = (error) => ({
  type: 'GET_PROJECTS_FAILURE',
  payload: error,
});

export function getOrphanProjects() {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/projects/orphans`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/projects/orphans`)
      : queryState(state => ({
        target: state.projectsReducer.orphans,
      }))
  ).then(
    res => dispatch(getOrphanProjectsSuccess(res)),
    err => handleActionFailure(err, dispatch(getOrphanProjectsFailure(err))),
  );
}

export const getOrphanProjectsSuccess = (projects) => ({
  type: 'GET_ORPHAN_PROJECTS_SUCCESS',
  payload: projects,
});

export const getOrphanProjectsFailure = (error) => ({
  type: 'GET_ORPHAN_PROJECTS_FAILURE',
  payload: error,
});

export function getProject(id, clientId) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/projects`,
      `${Constants.API_URL}/projects/${id}`,
    ].concat(hasValue(clientId) ? [
      `${Constants.API_URL}/reports?client_id=${clientId}`,
    ] : []))
      ? apiCall('GET', `${Constants.API_URL}/projects/${id}`)
      : queryState(state => ({
        target: state.projectsReducer.projects,
        filters: [{ run: true, filter: item => item.id === id }],
        index: 0,
      }))
  ).then(
    res => dispatch(getProjectSuccess(res)),
    err => handleActionFailure(err, dispatch(getProjectFailure(err))),
  );
}

export const getProjectSuccess = (project) => {
  return {
    type: 'GET_PROJECT_SUCCESS',
    payload: project,
  }
};

export const getProjectFailure = (error) => {
  return {
    type: 'GET_PROJECT_FAILURE',
    payload: error,
  }
};

export function createProject(data) {
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/projects`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(createProjectSuccess(res)),
        err => handleActionFailure(err, dispatch(createProjectFailure(err))),
      );
  };
}

export const createProjectSuccess = (project) => {
  return {
    type: 'CREATE_PROJECT_SUCCESS',
    payload: project,
  }
};

export const createProjectFailure = (error) => {
  return {
    type: 'CREATE_PROJECT_FAILURE',
    payload: error,
  }
};

export function updateProject(id, data) {
  return dispatch => {
    return apiCall('PATCH', `${Constants.API_URL}/projects/${id}`, { body: JSON.stringify(data) })
      .then(
        res => dispatch(updateProjectSuccess(res)),
        err => handleActionFailure(err, dispatch(updateProjectFailure(err))),
      );
  };
}

export const updateProjectSuccess = (project) => {
  return {
    type: 'UPDATE_PROJECT_SUCCESS',
    payload: project,
  }
};

export const updateProjectFailure = (error) => {
  return {
    type: 'UPDATE_PROJECT_FAILURE',
    payload: error,
  }
};

export function deleteProject(id) {
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/projects/${id}`)
      .then(
        res => dispatch(deleteProjectSuccess(id)),
        err => dispatch(deleteProjectFailure(err, id)),
        err => handleActionFailure(err, dispatch(deleteProjectFailure(err, id))),
      );
  };
}

export const deleteProjectSuccess = (projectId) => {
  return {
    type: 'DELETE_PROJECT_SUCCESS',
    projectId: projectId,
  }
};

export const deleteProjectFailure = (error, projectId) => {
  return {
    type: 'DELETE_PROJECT_FAILURE',
    payload: error,
    projectId: projectId,
  }
};
