import Constants from './utils/constants';
import Routes from './utils/routes';
import { FcGoogle } from 'react-icons/fc';
import { FaWindows } from 'react-icons/fa';

const authConfig = {
  domain: 'dev-oxtggqjp.auth0.com',
  clientId: 'gGZDDRXWMgdEzA5RaWzT8yR0ysvOce0B',
  loginUrl: `${Constants.APP_URL}${Routes.Login}`,
  callbackUrl: `${Constants.APP_URL}${Routes.LoginCallback}`,
  // audience: 'http://localhost:3000',
  socialConnectors: [
    {
      type: 'google-oauth2',
      label: 'Google',
      logo: FcGoogle,
    },
    {
      type: 'windowslive',
      label: 'Microsoft',
      logo: FaWindows,
    },
  ],
};

export default authConfig;
