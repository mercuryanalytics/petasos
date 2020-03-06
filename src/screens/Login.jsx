import React from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import { useAuth0 } from '../react-auth0-spa';
import { Redirect } from 'react-router-dom';
import Loader from '../components/Loader';

const Login = () => {
  const history = useHistory();
  const { loading, isAuthenticated, loginWithRedirect } = useAuth0();

  if (!loading) {
    if (!isAuthenticated) {
      loginWithRedirect({
        appState: {
          targetUrl: history.location.hash.substr(1),
        },
      });
    } else {
      return <Redirect to={Routes.Home} />;
    }
  }

  return <Loader />;
};

export default Login;
