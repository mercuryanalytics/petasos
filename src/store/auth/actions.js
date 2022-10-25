import { handleActionFailure } from '../index';
import apiCall from '../../utils/api-call';
import Constants from '../../utils/constants';

export const setUser = (user) => ({
  type: 'SET_USER',
  payload: user,
});

export const setIsSocialLogin = (status) => ({
  type: 'SET_IS_SOCIAL_LOGIN',
  payload: status,
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

export function verifyPasswordToken(token) {
  const body = JSON.stringify({
    token: token
  });
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/verify-password-token`, { body, noAuth: true })
        .then(
            res => dispatch(verifyPasswordTokenSuccess(res)),
            err => handleActionFailure(err, dispatch(verifyPasswordTokenFailure(err))),
        );
  };
}

export const verifyPasswordTokenSuccess = (data) => {
  return {
    type: 'VERIFY_PASSWORD_TOKEN_SUCCESS',
    payload: data,
  };
};

export const verifyPasswordTokenFailure = (error) => {
  return {
    type: 'VERIFY_PASSWORD_TOKEN_FAILURE',
    payload: error,
  };
};

export function resendPasswordToken(token, email) {
  const body = JSON.stringify({
    token: token,
    email: email
  });
  return dispatch => {
    return apiCall('POST', `${Constants.API_URL}/resend-password-token`, { body, noAuth: true })
        .then(
            res => dispatch(resendPasswordTokenSuccess(res)),
            err => handleActionFailure(err, dispatch(resendPasswordTokenFailure(err))),
        );
  };
}

export const resendPasswordTokenSuccess = (data) => {
  return {
    type: 'RESEND_PASSWORD_TOKEN_SUCCESS',
    payload: data,
  };
};

export const resendPasswordTokenFailure = (error) => {
  return {
    type: 'RESEND_PASSWORD_TOKEN_FAILURE',
    payload: error,
  };
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
