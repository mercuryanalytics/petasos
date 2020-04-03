import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getProjects(clientId) {
  const queryString = clientId ? `?client_id=${clientId}` : '';
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/projects${queryString}`)
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

export function getOrphanProjects() {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/projects/orphans`)
      .then(res => dispatch(getOrphanProjectsSuccess(res)))
      .catch(err => dispatch(getOrphanProjectsFailure(err)));
  };
}

export const getOrphanProjectsSuccess = (projects) => ({
  type: 'GET_ORPHAN_PROJECTS_SUCCESS',
  payload: projects,
});

export const getOrphanProjectsFailure = (error) => ({
  type: 'GET_ORPHAN_PROJECTS_FAILURE',
  payload: error,
});

export function getProject(id) {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/projects/${id}`)
      .then(res => dispatch(getProjectSuccess(res)))
      .catch(err => dispatch(getProjectFailure(err, id)));
  };
}

export const getProjectSuccess = (project) => {
  return {
    type: 'GET_PROJECT_SUCCESS',
    payload: project,
  }
};

export const getProjectFailure = (error, projectId) => {
  return {
    type: 'GET_PROJECT_FAILURE',
    payload: error,
  }
};

export function createProject(data) {
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/projects`, { body: JSON.stringify(data) })
      .then(res => dispatch(createProjectSuccess(res)))
      .catch(err => dispatch(createProjectFailure(err)));
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
      .then(res => dispatch(updateProjectSuccess(res)))
      .catch(err => dispatch(updateProjectFailure(err, id)));
  };
}

export const updateProjectSuccess = (project) => {
  return {
    type: 'UPDATE_PROJECT_SUCCESS',
    payload: project,
  }
};

export const updateProjectFailure = (error, projectId) => {
  return {
    type: 'UPDATE_PROJECT_FAILURE',
    payload: error,
  }
};

export function deleteProject(id) {
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/projects/${id}`)
      .then(res => dispatch(deleteProjectSuccess(id)))
      .catch(err => dispatch(deleteProjectFailure(err, id)));
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
