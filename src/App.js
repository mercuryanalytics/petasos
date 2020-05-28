import React, { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import './static/global.css';
import Constants from './utils/constants';
import Routes from './utils/routes';
import apiCall from './utils/api-call';
import { Route, Switch } from 'react-router-dom';
import store from './store';
import authConfig from './auth-config';
import { initFromStorage } from './components/Auth';
import { setAuthKey, setAuthUser, setPartner } from './store/auth/actions';
import Index, { ContentTypes } from './screens/Index';
import Account from './screens/Account';
import SuperUser from './screens/SuperUser';
import Login from './screens/Login';
import Logout from './screens/Logout';
import ChangePassword from './screens/ChangePassword';
import PageNotFound from './screens/PageNotFound';

export const getLogo = async () => {
  const partner = store.getState().authReducer.partner;
  console.log('partner', partner) // @TODO Remove
  if (partner) {
    return apiCall('GET', `${Constants.API_URL}/logo?subdomain=${partner}`, { noAuth: true })
      .then((res) => res.logo);
  }
  return new Promise(resolve => resolve(Constants.DEFAULT_APP_LOGO_URL));
};

const App = () => {
  const dispatch = store.dispatch;
  const partner = useSelector(state => state.authReducer.partner);
  const authUser = useSelector(state => state.authReducer.authUser);

  const init = useCallback(() => {
    if (!partner) {
      let parts = window.location.hostname.split('.'), subdomain;
      if (parts.length > 1) {
        subdomain = parts[0];
      }
      if (subdomain) {
        subdomain = subdomain.toLowerCase();
        if (subdomain !== 'www') {
          dispatch(setPartner(subdomain));
        }
      }
    }
    if (!authUser) {
      initFromStorage({
        config: authConfig,
        onSuccess: async (authKey, authUser) => {
          await dispatch(setAuthKey(authKey));
          await dispatch(setAuthUser(authUser));
        },
      });
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
      <Route path={Routes.LoginCallback} component={Login} />
      <Route path={Routes.Logout} component={Logout} />
      <Route path={Routes.ChangePassword} component={ChangePassword} />
      <Route path="*" component={PageNotFound} />
    </Switch>
  );
};

export default App;
