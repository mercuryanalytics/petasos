import Constants from './utils/constants';
import Routes from './utils/routes';
import { FcGoogle } from 'react-icons/fc';
import { FaWindows } from 'react-icons/fa';

const authConfig = {
  domain: 'dev-relu.auth0.com',
  clientId: 'ze875woECaoiRt7Vp2561p4uf57zp9e1',
  loginUrl: `${Constants.APP_URL}${Routes.Login}`,
  callbackUrl: `${Constants.APP_URL}${Routes.LoginCallback}`,
  socialConnectors: [
    {
      type: 'google-oauth2',
      label: 'Google',
      logo: FcGoogle,
    },
    {
      type: 'microsoft',
      label: 'Microsoft',
      logo: FaWindows,
    },
  ],
};

export default authConfig;
