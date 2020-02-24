import React from 'react';
import './static/base.css';
import Routes from './utils/routes';
import { Route, Switch } from 'react-router-dom';
import Index from './screens/Index';
import PageNotFound from './screens/PageNotFound';

const Auth = () => '[AUTH]';
const Logout = () => '[LOGOUT]';

const App = () => {
  return (
    <Switch>
      <Route exact path={Routes.Home} component={Index} />
      <Route exact path={Routes.Auth} component={Auth} />
      <Route exact path={Routes.Logout} component={Logout} />
      <Route path="*" component={PageNotFound} />
    </Switch>
  );
};

export default App;
