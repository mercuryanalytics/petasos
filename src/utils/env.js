const host = window.location.host;
const url = `${host.indexOf('localhost') === 0 ? 'http' : 'https'}://${host}`;

export const EnvTypes = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
};

export default {
  type: host.indexOf('localhost') !== 0 ? EnvTypes.PRODUCTION : EnvTypes.DEVELOPMENT,
  publicUrl: url,
};
