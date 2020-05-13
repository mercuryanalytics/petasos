import React from 'react';
import Routes from '../utils/routes';
import { isLoggedIn, logout } from '../App';
import { clearCache } from '../store';
import { Redirect } from 'react-router-dom';
import Loader from '../components/common/Loader';

const Logout = () => {

  if (isLoggedIn()) {
    clearCache();
    logout();
  } else {
    return <Redirect to={Routes.Login} />;
  }

  return <Loader />;
};

export default Logout;
