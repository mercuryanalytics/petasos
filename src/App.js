import React from 'react';
import './static/base.css';
import { Route, Switch } from 'react-router-dom';
import Index from './screens/Index';
import PageNotFound from './screens/PageNotFound';

const App = () => {
  return (
    <Switch>
      <Route exact path="/" component={Index} />
      <Route path="*" component={PageNotFound} />
    </Switch>
  );
};

export default App;
