import { DEV, ENV_DEV, ENV_PROD, NODE_ENV, PROD } from '../src/shared/constant/env.constant';

exports.envConfigs = {
  environment: process.env[NODE_ENV] || DEV,
  envFile: process.env[NODE_ENV] === PROD ? ENV_PROD : ENV_DEV,
};
