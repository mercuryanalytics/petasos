import React from 'react';
import Constants from '../utils/constants';
import { clearCache } from '../store';
import authConfig from '../auth-config';
import { logout } from '../components/Auth';

const Logout = () => {
  logout({
    config: authConfig,
    onSuccess: clearCache,
    redirectTo: Constants.APP_URL,
  });
  return '';
};

export default Logout;
