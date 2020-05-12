const host = window.location.host;
const url = `${host.indexOf('localhost') === 0 ? 'http' : 'https'}://${host}`;

export const EnvTypes = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  STAGING_HEROKU: 'staging-heroku',
  STAGING_AWS: 'staging-aws',
};

let Env = {
  type: EnvTypes.DEVELOPMENT,
  publicUrl: url,
};

if (host.indexOf('herokuapp.com') > -1) {
  Env.type = EnvTypes.STAGING_HEROKU;
} else if (host.indexOf('aurelianb.com') > -1) {
  Env.type = EnvTypes.STAGING_AWS;
} else if (host.indexOf('localhost') !== 0) {
  Env.type = EnvTypes.PRODUCTION;
}

export default Env;
