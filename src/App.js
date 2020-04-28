import React from 'react';
import { useDispatch } from 'react-redux';
import './static/base.css';
import { useHistory } from 'react-router-dom';
import Constants from './utils/constants';
import Routes from './utils/routes';
import authConfig from './auth_config.json';
import { Route, Switch } from 'react-router-dom';
import { Auth0Provider } from './react-auth0-spa';
import Loader from './components/Loader';
import Index, { ContentTypes } from './screens/Index';
import Account from './screens/Account';
import SuperUser from './screens/SuperUser';
import Login from './screens/Login';
import Logout from './screens/Logout';
import PageNotFound from './screens/PageNotFound';

const App = () => {
  const history = useHistory();

  const onAuth0RedirectCallback = (appState) => {
    if (appState) {
      history.push(appState.targetUrl || Constants.APP_URL);
    }
  };

  return (
    <Auth0Provider
      domain={authConfig.domain}
      client_id={authConfig.clientId}
      redirect_uri={`${Constants.APP_URL}${Routes.LoginCallback}`}
      onRedirectCallback={onAuth0RedirectCallback}
    >
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
    </Auth0Provider>
  );
};

export default App;
