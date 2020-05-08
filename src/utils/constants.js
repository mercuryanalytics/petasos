const APP_HOST = window.location.host;

const APP_URL = (() => {
  return `http://${APP_HOST}`;
})();

const API_HOST = (() => {
  if (APP_HOST.indexOf('aurelianb.com') > -1) {
    return 'http://api.aurelianb.com';
  }
  return 'http://mercury-analytics-api.herokuapp.com';
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
