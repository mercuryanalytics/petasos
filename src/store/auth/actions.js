import { handleActionFailure } from '../index';
import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export const setUser = (user) => ({
  type: 'SET_USER',
  payload: user,
});

export const setAuthKey = (authKey) => ({
  type: 'SET_AUTH_KEY',
  payload: authKey,
});

export const setAuthUser = (authUser) => ({
  type: 'SET_AUTH_USER',
  payload: authUser,
});

export const setPartner = (partner) => ({
  type: 'SET_PARTNER',
  payload: partner,
});

export function resetPassword(user, partner) {
  let body = { email: user };
  if (partner) {
    body.subdomain = partner;
  }
  body = JSON.stringify(body);
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/reset-password`, { body, noAuth: true })
      .then(
        res => dispatch(resetPasswordSuccess(res)),
        err => handleActionFailure(err, dispatch(resetPasswordFailure(err))),
      );
  };
}

export const resetPasswordSuccess = (data) => {
  return {
    type: 'RESET_PASSWORD_SUCCESS',
    payload: data,
  }
};

export const resetPasswordFailure = (error) => {
  return {
    type: 'RESET_PASSWORD_FAILURE',
    payload: error,
  }
};

export function changePassword(token, password, password_confirmation) {
  const body = JSON.stringify({
    token: token,
    password: password,
    password_confirmation: password_confirmation
  });
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/change-password`, { body, noAuth: true })
      .then(
        res => dispatch(changePasswordSuccess(res)),
        err => handleActionFailure(err, dispatch(changePasswordFailure(err))),
      );
  };
}

export const changePasswordSuccess = (data) => {
  return {
    type: 'CHANGE_PASSWORD_SUCCESS',
    payload: data,
  }
};

export const changePasswordFailure = (error) => {
  return {
    type: 'CHANGE_PASSWORD_FAILURE',
    payload: error,
  }
};
