import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getUsers(clientId) {
  const queryString = clientId ? `?client_id=${clientId}` : '';
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/users${queryString}`)
      .then(res => dispatch(getUsersSuccess(res)))
      .catch(err => dispatch(getUsersFailure(err)));
  };
}

export const getUsersSuccess = (users) => ({
  type: 'GET_USERS_SUCCESS',
  payload: users,
});

export const getUsersFailure = (error) => ({
  type: 'GET_USERS_FAILURE',
  payload: error,
});

export function getUser(id) {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/users/${id}`)
      .then(res => dispatch(getUserSuccess(res)))
      .catch(err => dispatch(getUserFailure(err, id)));
  };
}

export const getUserSuccess = (user) => {
  return {
    type: 'GET_USER_SUCCESS',
    payload: user,
  }
};

export const getUserFailure = (error, userId) => {
  return {
    type: 'GET_USER_FAILURE',
    payload: error,
  }
};

export function createUser(data, noAuth) {
  const queryString = noAuth ? `?no_auth=1` : '';
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/users${queryString}`, { body: JSON.stringify(data) })
      .then(res => dispatch(createUserSuccess(res)))
      .catch(err => dispatch(createUserFailure(err)));
  };
}

export const createUserSuccess = (user) => {
  return {
    type: 'CREATE_USER_SUCCESS',
    payload: user,
  }
};

export const createUserFailure = (error) => {
  return {
    type: 'CREATE_USER_FAILURE',
    payload: error,
  }
};

export function updateUser(id, data) {
  return dispatch => {
    return apiCall('PATCH', `${Constants.API_URL}/users/${id}`, { body: JSON.stringify(data) })
      .then(res => dispatch(updateUserSuccess(res)))
      .catch(err => dispatch(updateUserFailure(err, id)));
  };
}

export const updateUserSuccess = (user) => {
  return {
    type: 'UPDATE_USER_SUCCESS',
    payload: user,
  }
};

export const updateUserFailure = (error, userId) => {
  return {
    type: 'UPDATE_USER_FAILURE',
    payload: error,
  }
};

export function deleteUser(id, clientId) {
  const queryString = clientId ? `?client_id=${clientId}` : '';
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/users/${id}${queryString}`)
      .then(res => dispatch(deleteUserSuccess(id)))
      .catch(err => dispatch(deleteUserFailure(err, id)));
  };
}

export const deleteUserSuccess = (userId) => {
  return {
    type: 'DELETE_USER_SUCCESS',
    userId: userId,
  }
};

export const deleteUserFailure = (error, userId) => {
  return {
    type: 'DELETE_USER_FAILURE',
    payload: error,
    userId: userId,
  }
};

export function getResearchers() {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/users/researchers`)
      .then(res => dispatch(getResearchersSuccess(res)))
      .catch(err => dispatch(getResearchersFailure(err)));
  };
}

export const getResearchersSuccess = (users) => ({
  type: 'GET_RESEARCHERS_SUCCESS',
  payload: users,
});

export const getResearchersFailure = (error) => ({
  type: 'GET_RESEARCHERS_FAILURE',
  payload: error,
});

export function getScopes() {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/scopes`)
      .then(res => dispatch(getScopesSuccess(res)))
      .catch(err => dispatch(getScopesFailure(err)));
  };
}

export const getScopesSuccess = (scopes) => ({
  type: 'GET_SCOPES_SUCCESS',
  payload: scopes,
});

export const getScopesFailure = (error) => ({
  type: 'GET_SCOPES_FAILURE',
  payload: error,
});

export function getUserAuthorizations(id) {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/users/${id}/authorized`)
      .then(res => dispatch(getUserAuthorizationsSuccess(res, id)))
      .catch(err => dispatch(getUserAuthorizationsFailure(err, id)));
  };
}

export const getUserAuthorizationsSuccess = (authorizations, userId) => ({
  type: 'GET_USER_AUTHORIZATIONS_SUCCESS',
  payload: authorizations,
  userId: userId,
});

export const getUserAuthorizationsFailure = (error, userId) => ({
  type: 'GET_USER_AUTHORIZATIONS_FAILURE',
  payload: error,
  userId: userId,
});

export function getAuthorizedUsers(contextId, { clientId, projectId, reportId }) {
  let resPath = 'clients', resId = clientId;
  if (!!projectId) {
    resPath = 'projects';
    resId = projectId;
  } else if (!!reportId) {
    resPath = 'reports';
    resId = reportId;
  }
  const queryString = `?client_id=${contextId}`;
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/${resPath}/${resId}/authorized${queryString}`)
      .then(res => dispatch(getAuthorizedUsersSuccess(res, contextId, clientId, projectId, reportId)))
      .catch(err => dispatch(getAuthorizedUsersFailure(err)));
  };
}

export const getAuthorizedUsersSuccess = (data, contextId, clientId, projectId, reportId) => ({
  type: 'GET_AUTHORIZED_USERS_SUCCESS',
  payload: data,
  contextId: contextId,
  clientId: clientId,
  projectId: projectId,
  reportId: reportId,
});

export const getAuthorizedUsersFailure = (error) => ({
  type: 'GET_AUTHORIZED_USERS_FAILURE',
  payload: error,
});

export function authorizeUser(id, contextId, res, states) {
  let clientId, projectId, reportId;
  let resPath = 'clients', resId = clientId;
  states = states || {};
  if (res) {
    if (res.isGlobal) {
      return dispatch => {
        return apiCall('POST', `${Constants.API_URL}/users/${id}/scopes`, { body: JSON.stringify(states) })
          .then(res => dispatch(authorizeUserSuccess(res, id, contextId, clientId, projectId, reportId, states, true)))
          .catch(err => dispatch(authorizeUserFailure(err)));
      };
    }
    if (res.projectId) {
      resPath = 'projects';
      resId = res.projectId;
    } else if (res.reportId) {
      resPath = 'reports';
      resId = res.reportId;
    } else if (res.clientId) {
      resPath = 'clients';
      resId = res.clientId;
    }
  }
  const data = Object.assign({}, {
    user_id: id,
    client_id: contextId,
  }, states);
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/${resPath}/${resId}/authorize`, { body: JSON.stringify(data) })
      .then(res => dispatch(authorizeUserSuccess(res, id, contextId, clientId, projectId, reportId, states, false)))
      .catch(err => dispatch(authorizeUserFailure(err)));
  };
}

export const authorizeUserSuccess = (data, userId, contextId, clientId, projectId, reportId, states, isGlobal) => ({
  type: 'AUTHORIZE_USER_SUCCESS',
  payload: data,
  userId: userId,
  contextId: contextId,
  clientId: clientId,
  projectId: projectId,
  reportId: reportId,
  states: states,
  isGlobal: isGlobal,
});

export const authorizeUserFailure = (error) => ({
  type: 'AUTHORIZE_USER_FAILURE',
  payload: error,
});
