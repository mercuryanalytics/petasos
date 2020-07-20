import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import authConfig from '../auth-config';
import { changePassword } from '../store/auth/actions';
import { getLogo } from '../App';
import Auth, { AuthViewTypes } from '../components/Auth';
import parse from 'url-parse';

const translateError = (err) => {
  return { description: err.errors || 'An error occured.' };
};

const ChangePassword = () => {
  const dispatch = useDispatch();

  const handlePasswordChange = useCallback(async (password, password_confirmation) => {
    const token = parse(window.location.href, true).query.token;
    return dispatch(changePassword(token, password, password_confirmation)).then(() => {
      return Promise.resolve(true);
    }, (err) => {
      if (err.xhrHttpCode === 422) {
        err = { errors: 'Your token is expired, please generate another one and try again.' };
      }
      return Promise.reject(translateError(err));
    });
  }, [dispatch]);

  return (
    <Auth
      config={{ ...authConfig }}
      viewType={AuthViewTypes.ChangePassword}
      logoSrc={getLogo}
      passwordChangeHandler={handlePasswordChange}
    />
  );
};

export default ChangePassword;
