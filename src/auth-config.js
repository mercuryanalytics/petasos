import Constants from './utils/constants';
import Routes from './utils/routes';
import { FcGoogle } from 'react-icons/fc';
import { FaWindows } from 'react-icons/fa';

const authConfig = {
  domain: 'dev-oxtggqjp.auth0.com',
  clientId: 'fpp4BTYmrW5gOKT04zAR5Y4W3Uu4kC2P',
  loginUrl: `${Constants.APP_URL}${Routes.Login}`,
  callbackUrl: `${Constants.APP_URL}${Routes.LoginCallback}`,
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
