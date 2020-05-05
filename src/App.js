import React, { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import './static/base.css';
import history from './utils/history';
import Constants from './utils/constants';
import Routes from './utils/routes';
import apiCall from './utils/api-call';
import { Route, Switch } from 'react-router-dom';
import { createAuth0Lock } from './index';
import store from './store';
import { setAuthKey, setAuthUser, setPartner } from './store/auth/actions';
import Loader from './components/Loader';
import Index, { ContentTypes } from './screens/Index';
import Account from './screens/Account';
import SuperUser from './screens/SuperUser';
import Login from './screens/Login';
import Logout from './screens/Logout';
import PageNotFound from './screens/PageNotFound';

const auth0StorageKey = 'authData';

export const isLoggedIn = () => {
  // @TODO Handle expired_at (false if expired)
  return !!localStorage.getItem(auth0StorageKey);
};

export const login = async (options) => {
  options = Object.assign({}, {
    from: null,
    logo: null,
    onSuccess: null,
  }, (options || {}));

  const lock = createAuth0Lock(options.logo);

  lock.on('authenticated', async (res) => {
    localStorage.setItem(auth0StorageKey, JSON.stringify({
      key: res.idToken,
      user: res.idTokenPayload,
      expires_at: (res.expiresIn * 1000) + new Date().getTime(),
    }));
    await store.dispatch(setAuthKey(res.idToken));
    await store.dispatch(setAuthUser(res.idTokenPayload));
    if (options.onSuccess) {
      await options.onSuccess();
    }
    lock.hide();
    history.push(options.from || Constants.APP_URL);
  });

  lock.show();
};

export const logout = async () => {
  const lock = createAuth0Lock();
  await lock.logout();
  localStorage.removeItem(auth0StorageKey);
};

export const getLogo = async () => {
  const partner = store.getState().authReducer.partner;
  return new Promise((resolve) => {
    let logo = Constants.DEFAULT_APP_LOGO_URL;
    if (partner) {
      return apiCall('GET', `${Constants.API_URL}/logo?subdomain=${partner}`, { noAuth: true })
        .then((res) => res.logo);
    }
    return resolve(logo);
  });
};

const App = () => {
  const authUser = useSelector(state => state.authReducer.authUser);
  const partner = useSelector(state => state.authReducer.partner);

  const init = useCallback(() => {
    if (!partner) {
      let parts = window.location.hostname.split('.');
      if (parts.length > 1) {
        store.dispatch(setPartner(parts[0]));
      } else {
        // @TODO Remove (testing purposes)
        parts = history.location.search.split(/[\?|\&]subdomain\=/i);
        if (parts.length > 1) {
          const end = parts[1].indexOf('&');
          store.dispatch(setPartner(end === -1 ? parts[1] : parts[1].substr(0, end)));
        }
      }
    }
    if (!authUser) {
      let authData;
      try {
        authData = JSON.parse(localStorage.getItem(auth0StorageKey));
      } catch (e) {}
      if (authData) {
        // @TODO Handle expired_at (force logout/refresh if expired)
        if (authData.key && authData.user) {
          store.dispatch(setAuthKey(authData.key));
          store.dispatch(setAuthUser(authData.user));
        } else {
          logout();
        }
      }
    }
  }, [partner, authUser]);

  useEffect(init, []);

  return (
    <Switch>
      <Route exact path={Routes.Home} component={Index} />
      <Route
        path={Routes.CreateClient}
        render={p => <Index {...p} content={ContentTypes.CreateClient} />}
      />
      <Route
        path={Routes.ManageClient}
        render={p => <Index {...p} content={ContentTypes.ManageClient} />}
      />
      <Route
        path={Routes.CreateProject}
        render={p => <Index {...p} content={ContentTypes.CreateProject} />}
      />
      <Route
        path={Routes.ManageProject}
        render={p => <Index {...p} content={ContentTypes.ManageProject} />}
      />
      <Route
        path={Routes.CreateReport}
        render={p => <Index {...p} content={ContentTypes.CreateReport} />}
      />
      <Route
        path={Routes.ManageReport}
        render={p => <Index {...p} content={ContentTypes.ManageReport} />}
      />
      <Route path={Routes.Account} component={Account} />
      <Route path={Routes.SuperUser} component={SuperUser} />
      <Route path={Routes.Login} component={Login} />
      <Route path={Routes.LoginCallback} component={Loader} />
      <Route path={Routes.Logout} component={Logout} />
      <Route path="*" component={PageNotFound} />
    </Switch>
  );
};

export default App;
