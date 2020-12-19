import { hasValue, queryState, handleActionFailure } from '../index';
import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getUsers(clientId, force) {
  const queryString = hasValue(clientId) ? `?client_id=${clientId}` : '';
  return dispatch => (
    force || !apiCall.isCalled(
      !queryString ? [`${Constants.API_URL}/users`] :
      [`${Constants.API_URL}/users${queryString}`]
    )
      ? apiCall('GET', `${Constants.API_URL}/users${queryString}`)
      : queryState(state => ({
        target: state.usersReducer.users,
        filters: [{ run: hasValue(clientId),
          filter: item => Array.isArray(item.client_ids) && item.client_ids.indexOf(clientId) > -1 }],
      }))
  ).then(
    res => dispatch(getUsersSuccess(res)),
    err => handleActionFailure(err, dispatch(getUsersFailure(err))),
  );
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
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/users`,
      `${Constants.API_URL}/users/${id}`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/users/${id}`)
      : queryState(state => ({
        target: state.usersReducer.users,
        filters: [{ run: true, filter: item => item.id === id }],
        index: 0,
      }))
  ).then(
    res => dispatch(getUserSuccess(res)),
    err => handleActionFailure(err, dispatch(getUserFailure(err))),
  );
}

export const getUserSuccess = (user) => {
  return {
    type: 'GET_USER_SUCCESS',
    payload: user,
  }
};

export const getUserFailure = (error) => {
  return {
    type: 'GET_USER_FAILURE',
    payload: error,
  }
};

export function createUser(data, clientId, noAuth) {
  const queryString = noAuth ? `?no_auth=1` : '';
  const params = hasValue(clientId) ? { client_id: clientId } : {};
  const body = JSON.stringify(Object.assign({}, { user: data }, params));
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/users${queryString}`, { body })
      .then(
        res => {
          apiCall.forget(/\/authorized\?client_id=[0-9]+/);
          return dispatch(createUserSuccess(res));
        },
        err => handleActionFailure(err, dispatch(createUserFailure(err))),
      );
  };
}

export function copyPermissions(id, data) {
  const body = JSON.stringify(data);
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/users/${id}/copy`, { body })
        .then(
            res => {
              return dispatch(copyPermissionsSuccess(res))
            },
            err => handleActionFailure(err, dispatch(createUserFailure(err)))
        )
  }
}

export const copyPermissionsSuccess = (res) => {
  return {
    type: 'COPY_PERMISSIONS_SUCCESS',
    payload: res
  }
}

export const copyPermissionsFailur = (error) => {
  return {
    type: 'COPY_PERMISSIONS_FAILURE',
    payload: error
  }
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
  const body = JSON.stringify({ user: data });
  return dispatch => {
    return apiCall('PATCH', `${Constants.API_URL}/users/${id}`, { body })
      .then(
        res => dispatch(updateUserSuccess(res)),
        err => handleActionFailure(err, dispatch(updateUserFailure(err))),
      );
  };
}

export const updateUserSuccess = (user) => {
  return {
    type: 'UPDATE_USER_SUCCESS',
    payload: user,
  }
};

export const updateUserFailure = (error) => {
  return {
    type: 'UPDATE_USER_FAILURE',
    payload: error,
  }
};

export function deleteUser(id, clientId) {
  const queryString = hasValue(clientId) ? `?client_id=${clientId}` : '';
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/users/${id}${queryString}`)
      .then(
        res => dispatch(deleteUserSuccess(id)),
        err => handleActionFailure(err, dispatch(deleteUserFailure(err, id))),
      );
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
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/users/researchers`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/users/researchers`)
      : queryState(state => ({
        target: state.usersReducer.researchers,
      }))
  ).then(
    res => dispatch(getResearchersSuccess(res)),
    err => handleActionFailure(err, dispatch(getResearchersFailure(err))),
  );
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
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/scopes`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/scopes`)
      : queryState(state => ({
        target: state.usersReducer.scopes,
      }))
  ).then(
    res => dispatch(getScopesSuccess(res)),
    err => handleActionFailure(err, dispatch(getScopesFailure(err))),
  );
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
  return dispatch => (
    apiCall('GET', `${Constants.API_URL}/users/${id}/authorized`)
  ).then(
    res => dispatch(getUserAuthorizationsSuccess(res, id)),
    err => handleActionFailure(err, dispatch(getUserAuthorizationsFailure(err, id))),
  );
}

export const getUserAuthorizationsSuccess = (authorizations, userId) => ({
  type: 'GET_USER_AUTHORIZATIONS_SUCCESS',
  payload: authorizations,
  userId: userId,
});

export const resetUserAuthorizations = (userId) => ({
  type: 'RESET_USER_AUTHORIZATIONS',
  payload: {},
  userId: userId,
});

export const getUserAuthorizationsFailure = (error, userId) => ({
  type: 'GET_USER_AUTHORIZATIONS_FAILURE',
  payload: error,
  userId: userId,
});

export function getMyAuthorizations(id) {
  return dispatch => (
    !apiCall.isCalled([
      `${Constants.API_URL}/users/me`,
    ])
      ? apiCall('GET', `${Constants.API_URL}/users/me`)
      : queryState(state => ({
        target: state.usersReducer.authorizations,
        key: id,
      }))
  ).then(
    res => dispatch(getMyAuthorizationsSuccess(res, id)),
    err => handleActionFailure(err, dispatch(getMyAuthorizationsFailure(err, id))),
  );
}

export const getMyAuthorizationsSuccess = (authorizations, userId) => ({
  type: 'GET_MY_AUTHORIZATIONS_SUCCESS',
  payload: authorizations,
  userId: userId,
});

export const getMyAuthorizationsFailure = (error, userId) => ({
  type: 'GET_MY_AUTHORIZATIONS_FAILURE',
  payload: error,
  userId: userId,
});

export function getAuthorizedUsers(contextId, res) {
  const queryString = `?client_id=${contextId}`;
  let resPath, resId;
  if (hasValue(res.reportId)) {
    resPath = 'reports';
    resId = res.reportId;
  } else if (hasValue(res.projectId)) {
    resPath = 'projects';
    resId = res.projectId;
  } else if (hasValue(res.clientId)) {
    resPath = 'clients';
    resId = res.clientId;
  }
  return dispatch => (
    apiCall('GET', `${Constants.API_URL}/${resPath}/${resId}/authorized${queryString}`)
  ).then(
    res => dispatch(getAuthorizedUsersSuccess(res, contextId, resPath, resId)),
    err => handleActionFailure(err, dispatch(getAuthorizedUsersFailure(err))),
  );
}

export const getAuthorizedUsersSuccess = (data, contextId, resPath, resId) => ({
  type: 'GET_AUTHORIZED_USERS_SUCCESS',
  payload: data,
  contextId: contextId,
  resPath: resPath,
  resId: resId,
});

export const getAuthorizedUsersFailure = (error) => ({
  type: 'GET_AUTHORIZED_USERS_FAILURE',
  payload: error,
});

export function getAllAuthorizedUsers(res) {
  let resPath, resId;
  if (hasValue(res.reportId)) {
    resPath = 'reports';
    resId = res.reportId;
  } else if (hasValue(res.projectId)) {
    resPath = 'projects';
    resId = res.projectId;
  } else if (hasValue(res.clientId)) {
    resPath = 'clients';
    resId = res.clientId;
  }
  return dispatch => (
    apiCall('GET', `${Constants.API_URL}/${resPath}/${resId}/authorized`)
  ).then(
    res => dispatch(getAllAuthorizedUsersSuccess(res, resPath, resId)),
    err => handleActionFailure(err, dispatch(getAllAuthorizedUsersFailure(err))),
  );
}

export const getAllAuthorizedUsersSuccess = (data, resPath, resId) => ({
  type: 'GET_ALL_AUTHORIZED_USERS_SUCCESS',
  payload: data,
  resPath: resPath,
  resId: resId,
});

export const getAllAuthorizedUsersFailure = (error) => ({
  type: 'GET_ALL_AUTHORIZED_USERS_FAILURE',
  payload: error,
});

export function authorizeUser(id, contextId, res, states, context = null) {
  const refresh = async (dispatch) => {
    apiCall.forget(`${Constants.API_URL}/users/${id}/authorized`);
    await dispatch(getUserAuthorizations(id)).then(() => {}, () => {});
  };
  let resPath, resId;
  states = states || {};
  if (res) {
    if (res.isGlobal) {
      return dispatch => {
        return apiCall('POST', `${Constants.API_URL}/users/${id}/scopes`, { body: JSON.stringify(states) })
          .then(
            async (res) => {
              await refresh(dispatch);
              dispatch(authorizeUserSuccess(res, id, contextId, null, null, states, true));
            },
            err => handleActionFailure(err, dispatch(authorizeUserFailure(err))),
          );
      };
    }
    if (hasValue(res.reportId)) {
      resPath = 'reports';
      resId = res.reportId;
    } else if (hasValue(res.projectId)) {
      resPath = 'projects';
      resId = res.projectId;
    } else if (hasValue(res.clientId)) {
      resPath = 'clients';
      resId = res.clientId;
    }
  }
  const data = Object.assign({}, {
    user_id: id,
    client_id: contextId,
  }, states);
  return dispatch => {
    let url = context === 'project' || context === 'report' ?
        `${Constants.API_URL}/${resPath}/${resId}/authorize?access=1` :
        `${Constants.API_URL}/${resPath}/${resId}/authorize`
    if (context === 'admin') {
      url = `${Constants.API_URL}/${resPath}/${resId}/authorize?from_admin=1`;
    }

    return apiCall('POST', url, { body: JSON.stringify(data) })
      .then(
        async (res) => {
          await refresh(dispatch);
          return dispatch(authorizeUserSuccess(res, id, contextId, resPath, resId, states, false));
        },
        err => handleActionFailure(err, dispatch(authorizeUserFailure(err))),
      );
  };
}

export const authorizeUserSuccess = (data, userId, contextId, resPath, resId, states, isGlobal) => ({
  type: 'AUTHORIZE_USER_SUCCESS',
  payload: data,
  userId: userId,
  contextId: contextId,
  resPath: resPath,
  resId: resId,
  states: states,
  isGlobal: isGlobal,
});

export const authorizeUserFailure = (error) => ({
  type: 'AUTHORIZE_USER_FAILURE',
  payload: error,
});

export function refreshAuthorizations(type, id, userId, contextId) {
  return dispatch => {
    apiCall.forget(/\/users\/[0-9]+\/authorized/);
    return Promise.all([
      dispatch(getAuthorizedUsers(contextId, { [`${type}Id`]: id })).then(() => {}, () => {}),
      dispatch(getUserAuthorizations(userId)).then(() => {}, () => {}),
    ]);
  };
}
