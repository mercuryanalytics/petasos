const APP_HOST = window.location.host;

const APP_URL = (() => {
  return `${APP_HOST.indexOf('localhost') === 0 ? 'http' : 'https'}://${APP_HOST}`;
})();

const API_HOST = (() => {
  if (APP_HOST.indexOf('aurelianb.com') > -1) {
    return 'https://api.aurelianb.com';
  }
  return 'https://mercury-analytics-api.herokuapp.com';
})();

const API_URL = (() => {
  return `${API_HOST}/api/v1`;
})();

const Constants = {
  APP_URL: APP_URL,
  API_URL: API_URL,
  DEFAULT_APP_LOGO_URL: `${API_HOST}/images/mercury-analytics-logo.png`,
  DEFAULT_CLIENT_LOGO_URL: `${API_HOST}/images/mercury-analytics-logo.png`,
};

export default Constants;
