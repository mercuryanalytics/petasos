import React from 'react';
import Constants from '../utils/constants';
import Routes from '../utils/routes';
import { useAuth0 } from '../react-auth0-spa';
import { clearCache } from '../store';
import { Redirect } from 'react-router-dom';
import Loader from '../components/Loader';

const Logout = () => {
  const { loading, isAuthenticated, logout } = useAuth0();

  if (!loading) {
    if (isAuthenticated) {
      clearCache();
      logout({
        returnTo: `${Constants.APP_URL}${Routes.LogoutCallback}`,
      });
    } else {
      return <Redirect to={Routes.Login} />;
    }
  }

  return <Loader />;
};

export default Logout;
