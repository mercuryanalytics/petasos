import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './index.module.css';
import auth0 from 'auth0-js';
import Loader from '../common/Loader';
import Button from '../common/Button';
import { MdDone } from 'react-icons/md';
import Login, { LoginViewTypes } from './Login';
import ChangePassword from './ChangePassword';

export const AuthViewTypes = {
  Login: 'login',
  ChangePassword: 'change-password',
};

export const auth0ErrorMessageKey = 'authErrorMessage';
export const auth0StorageKey = 'authData';
export const auth0PendingSocialLoginKey = 'pendingSocialLogin';
export const auth0ReturnUrlKey = 'authReturnUrl';

export const isLoggedIn = () => {
  try {
    let authData = JSON.parse(localStorage.getItem(auth0StorageKey));
    return +authData.expiresAt > new Date().getTime();
  } catch (e) {
    return false;
  }
};

export const logout = (options) => {
  localStorage.removeItem(auth0StorageKey);
  if (isLoggedIn()) {
    if (options.onSuccess) {
      options.onSuccess();
    }
  }
  window.location.replace(options.redirectTo || options.config.loginUrl);
};

export const initFromStorage = (options) => {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(auth0StorageKey));
  } catch (e) {}
  if (data) {
    if (
      (!data.expiresAt || !data.key || !data.user) ||
      (+data.expiresAt <= new Date().getTime())
    ) {
      logout({ config: options.config });
    } else if (options.onSuccess) {
      options.onSuccess(data.key, data.user, !!data.isSocialLogin);
    }
  }
};

const Auth = props => {
  const history = useHistory();
  const {
    config, viewType, redirectTo, logoSrc,
    onSuccess, passwordResetHandler, passwordChangeHandler, state
  } = props;
  const callbackUrl = config ? config.callbackUrl : null;
  const [logo, setLogo] = useState(null);
  const [loginViewType, setLoginViewType] = useState(LoginViewTypes.Login);
  const [passwordResetSuccessMessage, setPasswordResetSuccessMessage] = useState(null);
  const [passwordChangeSuccessMessage, setPasswordChangeSuccessMessage] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [passwordResetError, setPasswordResetError] = useState(null);
  const [passwordChangeError, setPasswordChangeError] = useState(null);
  const hasSuccess = passwordResetSuccessMessage || passwordChangeSuccessMessage;
  const hasError = loginError || passwordResetError || passwordChangeError;
  const isConnected = isLoggedIn();
  const isCallback = (
    viewType === AuthViewTypes.Login &&
    callbackUrl &&
    callbackUrl.indexOf(history.location.pathname) > -1
  );

  const getWebAuth = useCallback(() => {
    let authConfig;
    if (state) {
      authConfig = {
        responseType: 'code',
        state: state,
        redirectUri: redirectTo,
      }
    } else {
      authConfig = {
        responseType: 'token id_token',
        responseMode: 'fragment',
        redirectUri: callbackUrl,
      };
    }
    return new auth0.WebAuth(
      Object.assign({
        domain: config.domain,
        clientID: config.clientId,
      }, authConfig)
    );
  }, [config, callbackUrl, state, redirectTo]);

  const clearErrors = useCallback(() => {
    setLoginError(null);
    setPasswordResetError(null);
    setPasswordChangeError(null);
  }, []);

  const login = useCallback(async (res, isSocialLogin) => {
    const webAuth = getWebAuth();
    const redirectTo = localStorage.getItem(auth0ReturnUrlKey);
    localStorage.removeItem(auth0ReturnUrlKey);
    await webAuth.client.userInfo(res.accessToken, async (err, user) => {
      if (err) {
        console.log(err);
        window.location.replace(config.loginUrl);
        return;
      }
      localStorage.setItem(auth0StorageKey, JSON.stringify({
        accessToken: res.accessToken,
        key: res.idToken,
        user: user,
        expiresAt: (res.expiresIn * 1000) + new Date().getTime(),
        isSocialLogin,
      }));
      if (onSuccess) {
        await onSuccess(res.idToken, user, isSocialLogin);
      }
      if (redirectTo) {
        if (redirectTo.indexOf('http') === 0) {
          window.location.replace(redirectTo);
        } else {
          history.push(redirectTo);
        }
      }
    });
  }, [config, onSuccess, getWebAuth, history]);

  const handleLoginCallback = useCallback(() => {
    const webAuth = getWebAuth();
    const isSocial = localStorage.getItem(auth0PendingSocialLoginKey);
    localStorage.removeItem(auth0PendingSocialLoginKey);
    if (isSocial) {
      webAuth.popup.callback();
      return;
    }
    webAuth.parseHash({ hash: history.location.hash }, (err, res) => {
      if (err) {
        console.log(err);
        window.location.replace(config.loginUrl);
        return;
      }
      login(res);
    });
  }, [history, config, getWebAuth, login]);

  useEffect(() => {
    if (isCallback) {
      handleLoginCallback();
    }
  // eslint-disable-next-line
  }, [isCallback]);

  useEffect(() => {
    if (isConnected && !isCallback && state) {
      getWebAuth().authorize();
    }
  // eslint-disable-next-line
  }, [isCallback, isConnected, state]);

  const initLogo = useCallback(async (source) => {
    let logoUrl = null;
    if (typeof source === 'function') {
      logoUrl = await source();
    } else if (source) {
      logoUrl = String(source);
    }
    setLogo(logoUrl);
  }, [setLogo]);

  useEffect(() => {
    initLogo(logoSrc);
  // eslint-disable-next-line
  }, [logoSrc]);

  useEffect(() => {
    const initialErrorMessage = localStorage.getItem(auth0ErrorMessageKey);
    if (initialErrorMessage) {
      localStorage.removeItem(auth0ErrorMessageKey);
      setLoginError({ description: initialErrorMessage });
    }
  }, []);

  const handleLogin = useCallback((user, password) => {
    clearErrors();
    localStorage.setItem(auth0ReturnUrlKey, redirectTo);
    getWebAuth().login({
      email: user,
      password: password,
      realm: 'Username-Password-Authentication',
    }, (err) => {
      setLoginError(err);
      localStorage.removeItem(auth0ReturnUrlKey);
    });
  }, [redirectTo, clearErrors, getWebAuth, setLoginError]);

  const handleSocialLogin = useCallback((connector) => {
    clearErrors();
    localStorage.setItem(auth0PendingSocialLoginKey, 'yes');
    localStorage.setItem(auth0ReturnUrlKey, redirectTo);
    getWebAuth().popup.authorize({
      connection: connector.type,
    }, (err, res) => {
      if (err) {
        setLoginError(err);
        localStorage.removeItem(auth0PendingSocialLoginKey);
        localStorage.removeItem(auth0ReturnUrlKey);
        console.log(err);
        window.location.replace(config.loginUrl);
        return;
      }
      login(res, true);
    });
  }, [redirectTo, clearErrors, config, getWebAuth, login]);

  const handlePasswordReset = useCallback(async (user) => {
    clearErrors();
    if (passwordResetHandler) {
      passwordResetHandler(user).then(() => {
        setPasswordResetSuccessMessage('An e-mail will be sent to you containing the reset instructions.');
      }, (err) => {
        setPasswordResetError(err);
      });
    }
  }, [passwordResetHandler, clearErrors]);

  const handlePasswordChange = useCallback(async (password, password_confirmation) => {
    clearErrors();
    if (passwordChangeHandler) {
      passwordChangeHandler(password, password_confirmation).then(() => {
        setPasswordChangeSuccessMessage('Password successfully changed.');
      }, (err) => {
        setPasswordChangeError(err);
      });
    }
  }, [passwordChangeHandler, clearErrors]);

  const handleViewChange = useCallback((type) => {
    clearErrors();
    setLoginViewType(type);
  }, [clearErrors]);

  const renderTitle = useCallback(() => {
    let value = '';
    if (viewType === AuthViewTypes.Login) {
      value = loginViewType !== LoginViewTypes.Reset ?
        'Login' :
        'Reset your password';
    } else {
      value = 'Change your password';
    }
    return (
      <span>{value}</span>
    );
  }, [viewType, loginViewType]);

  return (
    !isCallback &&
    (!isConnected || viewType === AuthViewTypes.ChangePassword)
  ) ? (
    <div className={styles.container}>
      <div className={styles.object}>
        <div className={styles.header}>
          {!!logoSrc && (
            <div className={styles.logoContainer}>
              {!!logo ? (
                <img className={styles.logo} src={logo} alt="" />
              ) : (
                <Loader inline size={3} />
              )}
            </div>
          )}
          <div className={styles.title}>
            {renderTitle()}
          </div>
        </div>
        <div className={styles.form}>
          {(hasError && (
            <div className={styles.errors}>
              <span>{(loginError || passwordResetError || passwordChangeError).description}</span>
            </div>
          )) ||
          (hasSuccess && (<>
            <div className={styles.success}>
              <MdDone className={styles.icon} />
              <span>{passwordResetSuccessMessage || passwordChangeSuccessMessage}</span>
            </div>
            <div className={styles.buttons}>
              <Button link={config.loginUrl}>Back to Login</Button>
            </div>
          </>))}
          {!hasSuccess && (
            (viewType === AuthViewTypes.Login && (
              <Login
                socialConnectors={config.socialConnectors}
                loginError={loginError}
                passwordResetError={passwordResetError}
                successMessage={passwordResetSuccessMessage}
                onViewChange={handleViewChange}
                onLogin={handleLogin}
                onSocialLogin={handleSocialLogin}
                onPasswordReset={handlePasswordReset}
              />
            )) ||
            (viewType === AuthViewTypes.ChangePassword && (
              <ChangePassword
                error={passwordChangeError}
                successMessage={passwordChangeSuccessMessage}
                onPasswordChange={handlePasswordChange}
              />
            ))
          )}
        </div>
      </div>
    </div>
  ) : (
    <Loader size={5} />
  );
};

export default Auth;
