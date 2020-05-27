import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import styles from './index.module.css';
import auth0 from 'auth0-js';
import Loader from '../common/Loader';
import Login, { LoginViewTypes } from './Login';
import ChangePassword from './ChangePassword';

export const AuthViewTypes = {
  Login: 'login',
  ChangePassword: 'change-password',
};

export const auth0StorageKey = 'authData';
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
  if (isLoggedIn()) {
    localStorage.removeItem(auth0StorageKey);
    if (options.onSuccess) {
      options.onSuccess();
    }
  }
  window.location.href = options.redirectTo || options.config.loginUrl;
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
      options.onSuccess(data.key, data.user);
    }
  }
};

const Auth = props => {
  const history = useHistory();
  const {
    config, viewType, redirectTo, logoSrc,
    onSuccess, passwordResetHandler, passwordChangeHandler,
  } = props;
  const callbackUrl = config ? config.callbackUrl : null;
  const [logo, setLogo] = useState(null);
  const [loginViewType, setLoginViewType] = useState(LoginViewTypes.Login);
  const [loginError, setLoginError] = useState(null);
  const [passwordResetError, setPasswordResetError] = useState(null);
  const [passwordChangeError, setPasswordChangeError] = useState(null);
  const hasError = loginError || passwordResetError || passwordChangeError;
  const isConnected = isLoggedIn();
  const isCallback = (
    viewType === AuthViewTypes.Login &&
    callbackUrl &&
    callbackUrl.indexOf(history.location.pathname) > -1
  );

  const getWebAuth = useCallback(() => {
    return new auth0.WebAuth({
      domain: config.domain,
      clientID: config.clientId,
      responseType: 'token id_token',
      responseMode: 'fragment',
      redirectUri: callbackUrl,
    });
  }, [config, callbackUrl]);

  const clearErrors = useCallback(() => {
    setLoginError(null);
    setPasswordResetError(null);
    setPasswordChangeError(null);
  });

  const handleLoginCallback = useCallback(() => {
    const webAuth = getWebAuth();
    webAuth.parseHash({ hash: history.location.hash }, (err, res) => {
      const redirectTo = localStorage.getItem(auth0ReturnUrlKey);
      localStorage.removeItem(auth0ReturnUrlKey);
      if (err) {
        console.log(err);
        // window.location.href = config.loginUrl;
        return;
      }
      webAuth.client.userInfo(res.accessToken, async (err, user) => {
        if (err) {
          console.log(err);
          // window.location.href = config.loginUrl;
          return;
        }
        localStorage.setItem(auth0StorageKey, JSON.stringify({
          accessToken: res.accessToken,
          key: res.idToken,
          user: user,
          expiresAt: (res.expiresIn * 1000) + new Date().getTime(),
        }));
        if (onSuccess) {
          await onSuccess(res.idToken, user);
        }
        if (redirectTo) {
          if (redirectTo.indexOf('http') === 0) {
            window.location.href = redirectTo;
          } else {
            history.push(redirectTo);
          }
        }
      });
    });
  }, [history, config, onSuccess]);

  useEffect(() => {
    if (isCallback) {
      handleLoginCallback();
    }
  }, [isCallback]);

  const initLogo = useCallback(async (source) => {
    let logoUrl = null;
    if (typeof source === 'function') {
      logoUrl = await source();
    } else if (source) {
      logoUrl = String(source);
    }
    setLogo(logoUrl);
  });

  useEffect(() => {
    initLogo(logoSrc);
  }, [logoSrc]);

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
  }, [redirectTo]);

  const handleSocialLogin = useCallback((connector) => {
    clearErrors();
    getWebAuth().popup.authorize({
      connection: connector.type,
    }, function(err, authResult) {
      console.log(err, authResult)
    });
  });

  const handlePasswordReset = useCallback(async (user) => {
    clearErrors();
    if (passwordResetHandler) {
      // @TODO Handle complete
      passwordResetHandler(user);
    }
  }, [passwordResetHandler]);

  const handlePasswordChange = useCallback(async (password) => {
    clearErrors();
    if (passwordChangeHandler) {
      // @TODO Handle complete
      passwordChangeHandler(password);
    }
  }, [passwordChangeHandler]);

  const handleViewChange = useCallback((type) => {
    clearErrors();
    setLoginViewType(type);
  });

  const renderTitle = useCallback(() => {
    let value = '';
    if (viewType === AuthViewTypes.Login) {
      value = loginViewType !== LoginViewTypes.Reset ?
        'Auth0 Login' :
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
                <img className={styles.logo} src={logo} />
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
          {hasError && (
            <div className={styles.errors}>
              <span>{(loginError || passwordResetError || passwordChangeError).description}</span>
            </div>
          )}
          {(viewType === AuthViewTypes.Login && (
            <Login
              socialConnectors={config.socialConnectors}
              loginError={loginError}
              passwordResetError={passwordResetError}
              onViewChange={handleViewChange}
              onLogin={handleLogin}
              onSocialLogin={handleSocialLogin}
              onPasswordReset={handlePasswordReset}
            />
          )) ||
          (viewType === AuthViewTypes.ChangePassword && (
            <ChangePassword
              error={passwordChangeError}
              onPasswordChange={handlePasswordChange}
            />
          ))}
        </div>
      </div>
    </div>
  ) : (
    <Loader size={5} />
  );
};

export default Auth;
