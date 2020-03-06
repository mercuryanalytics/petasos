const env = process.env.NODE_ENV;

console.log('constants.js', JSON.stringify(process));

const prod = {
  APP_URL: 'https://mercury-analytics-frontend.herokuapp.com',
  API_URL: 'https://mercury-analytics-api.herokuapp.com/api/v1',
};

const dev = {
  APP_URL: 'https://mercury-analytics-frontend.herokuapp.com',
  API_URL: 'https://mercury-analytics-api.herokuapp.com/api/v1',
};

const Constants = env !== 'development' ? prod : dev;

export default Constants;
