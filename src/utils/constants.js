import { ENV } from './env';

const prod = {
  APP_URL: 'https://mercury-analytics-frontend.herokuapp.com',
  API_URL: 'https://mercury-analytics-api.herokuapp.com/api/v1',
};

const dev = {
  APP_URL: 'http://localhost:3000',
  API_URL: 'https://mercury-analytics-api.herokuapp.com/api/v1',
};

const Constants = Object.assign({}, (ENV !== 'development' ? prod : dev), {
  DEFAULT_CLIENT_LOGO_URL: 'https://mercury-analytics-api.herokuapp.com/images/mercury-analytics-logo.png',
});

export default Constants;
