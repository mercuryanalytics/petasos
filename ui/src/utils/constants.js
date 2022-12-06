import Env, { EnvTypes } from './env';

const EnvTypeToUrlsMap = {
  [EnvTypes.PRODUCTION]: {
    APP_URL: Env.publicUrl,
    API_HOST: 'https://api.researchresultswebsite.com',
    API_URL: 'https://api.researchresultswebsite.com/api/v1',
  },
  [EnvTypes.DEVELOPMENT]: {
    APP_URL: Env.publicUrl,
    API_HOST: 'https://petasos-api.test',
    API_URL: 'https://petasos-api.test/api/v1',
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
