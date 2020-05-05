import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import Constants from './utils/constants';
import Routes from './utils/routes';
import history from './utils/history';
import { Provider } from 'react-redux';
import store from './store';
import authConfig from './auth_config.json';
import Auth0Lock from 'auth0-lock';
import App from './App';

export const createAuth0Lock = (logo) => {
  const themeOptions = logo ? {
    theme: { logo },
  } : {};
  return new Auth0Lock(authConfig.clientId, authConfig.domain, {
    auth: {
        redirect: false,
        redirectUrl: `${Constants.APP_URL}${Routes.LoginCallback}`,
        responseType: 'token id_token',
    },
    allowSignUp: false,
    ...themeOptions,
  });
};

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root'),
);
