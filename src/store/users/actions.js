import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export function getUsers() {
  return dispatch => {
    return apiCall('GET', `${Constants.API_URL}/users`)
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

export function createUser(data) {
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/users`, { body: JSON.stringify(data) })
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

export function deleteUser(id) {
  return dispatch => {
    return apiCall('DELETE', `${Constants.API_URL}/users/${id}`)
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
