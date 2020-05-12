import Env, { EnvTypes } from './env';

const EnvTypeToUrlsMap = {
  [EnvTypes.PRODUCTION]: {
    APP_URL: '',
    API_HOST: '',
    API_URL: '',
  },
  [EnvTypes.DEVELOPMENT]: {
    APP_URL: Env.publicUrl,
    API_HOST: 'https://mercury-analytics-api.herokuapp.com',
    API_URL: 'https://mercury-analytics-api.herokuapp.com/api/v1',
  },
  [EnvTypes.STAGING_HEROKU]: {
    APP_URL: Env.publicUrl,
    API_HOST: 'https://mercury-analytics-api.herokuapp.com',
    API_URL: 'https://mercury-analytics-api.herokuapp.com/api/v1',
  },
  [EnvTypes.STAGING_AWS]: {
    APP_URL: Env.publicUrl,
    API_HOST: 'https://api.aurelianb.com',
    API_URL: 'https://api.aurelianb.com/api/v1',
  },
};

const Urls = EnvTypeToUrlsMap[Env.type];

if (!Urls) {
  throw new Error('Invalid application environment');
}

const Constants = {
  APP_URL: Urls.APP_URL,
  API_URL: Urls.API_URL,
  DEFAULT_APP_LOGO_URL: `${Urls.API_HOST}/images/mercury-analytics-logo.png`,
  DEFAULT_CLIENT_LOGO_URL: `${Urls.API_HOST}/images/mercury-analytics-logo.png`,
};

export default Constants;
