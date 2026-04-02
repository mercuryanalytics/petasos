// CRA calls this script instead of opening the dev server URL directly.
// We open the puma-dev URL instead, since auth requires the petasos.test host.
const { execSync } = require('child_process');
execSync('open http://petasos.test');
