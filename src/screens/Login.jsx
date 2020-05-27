import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Constants from '../utils/constants';
import Routes from '../utils/routes';
import authConfig from '../auth-config';
import { setAuthKey, setAuthUser, resetPassword } from '../store/auth/actions';
import { getLogo } from '../App';
import Auth, { AuthViewTypes, isLoggedIn } from '../components/Auth';

const Login = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const partner = useSelector(state => state.authReducer.partner);
  const isCallback = window.location.href.indexOf(Routes.LoginCallback) > -1;
  const from = history.location.hash.substr(1) || '';
  const redirectTo = (from.length > 1 && !isCallback) ?
    `${Constants.APP_URL}${from}` :
    Routes.Home;

  const leaveIfLoggedIn = useCallback(() => {
    if (isLoggedIn()) {
      history.push(Routes.Home);
    }
  }, [history]);

  useEffect(() => {
    leaveIfLoggedIn();
  }, []);

  const handleLoginSuccess = useCallback(async (key, user) => {
    await dispatch(setAuthKey(key));
    await dispatch(setAuthUser(user));
  });

  const handlePasswordReset = useCallback(async (email) => {
    return dispatch(resetPassword(email, partner));
  }, [partner]);

  return (
    <Auth
      config={{ ...authConfig }}
      viewType={AuthViewTypes.Login}
      logoSrc={getLogo}
      onSuccess={handleLoginSuccess}
      passwordResetHandler={handlePasswordReset}
      redirectTo={redirectTo}
    />
  );
};

export default Login;
