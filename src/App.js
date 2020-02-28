import React from 'react';
import './static/base.css';
import history from './utils/history';
import Constants from './utils/constants';
import Routes from './utils/routes';
import authConfig from './auth_config.json';
import { Route, Switch } from 'react-router-dom';
import { Auth0Provider } from './react-auth0-spa';
import Loader from './components/Loader';
import Index from './screens/Index';
import Login from './screens/Login';
import Logout from './screens/Logout';
import PageNotFound from './screens/PageNotFound';

const onAuth0RedirectCallback = appState => {
  if (appState) {
    history.push(appState.targetUrl || Constants.APP_URL);
  }
};

const App = () => {
  return (
    <Auth0Provider
      domain={authConfig.domain}
      client_id={authConfig.clientId}
      redirect_uri={`${Constants.APP_URL}${Routes.LoginCallback}`}
      onRedirectCallback={onAuth0RedirectCallback}
    >
      <Switch>
        <Route exact path={'/home'} component={Index} />
        <Route exact path={'/api/v1/projects'} render={() => ''} />
        <Route exact path={Routes.Home} component={Index} />
        <Route path={Routes.Login} component={Login} />
        <Route path={Routes.LoginCallback} component={Loader} />
        <Route path={Routes.Logout} component={Logout} />
        <Route path="*" component={PageNotFound} />
      </Switch>
    </Auth0Provider>
  );
};

export default App;
