import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import authConfig from '../auth-config';
import { changePassword } from '../store/auth/actions';
import { getLogo } from '../App';
import Auth, { AuthViewTypes } from '../components/Auth';
import parse from 'url-parse';

const ChangePassword = () => {
  const dispatch = useDispatch();

  const handlePasswordChange = useCallback(async (password, password_confirmation) => {
    const token = parse(window.location.href, true).query.token;
    return dispatch(changePassword(token, password, password_confirmation));
  });

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
