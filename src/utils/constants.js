const env = process.env.NODE_ENV;

const prod = {
  APP_URL: 'https://mercury-analytics-frontend.herokuapp.com',
  API_URL: 'https://mercury-analytics-api.herokuapp.com/api/v1',
};

const dev = {
  APP_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3002',
};

const Constants = env !== 'development' ? prod : dev;

export default Constants;
