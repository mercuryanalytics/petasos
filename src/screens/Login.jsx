import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Constants from '../utils/constants';
import Routes from '../utils/routes';
import authConfig from '../auth-config';
import { setAuthKey, setAuthUser, setIsSocialLogin, resetPassword } from '../store/auth/actions';
import { getLogo } from '../App';
import Auth, { AuthViewTypes, isLoggedIn } from '../components/Auth';
import parse from 'url-parse';

const translateError = (err) => {
  return { description: err.errors || 'An error occured.' };
};

const Login = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const partner = useSelector(state => state.authReducer.partner);
  const isCallback = window.location.href.indexOf(Routes.LoginCallback) > -1;

  let from = history.location.hash.substr(1) || '';
  let redirectTo = Routes.Home;
  let state = null;

  if (from) {
    if (from.length > 1 && !isCallback) {
      redirectTo = `${Constants.APP_URL}${from}`;
    }
  } else {
    from = parse(window.location.href, true).query.return_url;
    if (from) {
      state = parse(window.location.href, true).query.state;
      redirectTo = from;
    }
  }

  const leaveIfLoggedIn = useCallback(() => {
    if (isLoggedIn() && !state) {
      history.push(Routes.Home);
    }
  }, [history, state]);

  useEffect(() => {
    leaveIfLoggedIn();
  // eslint-disable-next-line
  }, []);

  const handleLoginSuccess = useCallback(async (key, user, isSocialLogin) => {
    await dispatch(setAuthKey(key));
    await dispatch(setAuthUser(user));
    await dispatch(setIsSocialLogin(isSocialLogin));
  }, [dispatch]);

  const handlePasswordReset = useCallback(async (email) => {
    return dispatch(resetPassword(email, partner)).then(() => {
      return Promise.resolve(true);
    }, (err) => {
      return Promise.reject(translateError(err));
    });
  }, [partner, dispatch]);

  return (
    <Auth
      config={{ ...authConfig }}
      viewType={AuthViewTypes.Login}
      logoSrc={getLogo}
      onSuccess={handleLoginSuccess}
      passwordResetHandler={handlePasswordReset}
      redirectTo={redirectTo}
      state={state}
    />
  );
};

export default Login;
