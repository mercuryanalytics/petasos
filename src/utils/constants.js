let Constants, env = process.env.NODE_ENV;

const prod = {
  APP_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3000',
};

const dev = {
  APP_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3000',
};

export default Constants = env !== 'development' ? prod : dev;;
