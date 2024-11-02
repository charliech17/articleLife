import { PluginBuild } from 'esbuild';
import { ANGULAR_ENV_PREFIX } from '../src/shared/constant/env.constant';

const { envConfigs } = require('./env-configs');
const dotenv = require('dotenv');

const readEnvPlugin = {
  name: 'env-plugin',
  setup(build: PluginBuild) {
    // Read the environment variables from the .env file
    dotenv.config({ path: envConfigs.envFile });
    // Define the environment variables for the build
    build.initialOptions.define = createDefineFromEnv();
  },
};

function createDefineFromEnv() {
  const define: { [key: string]: string } = {};
  for (const k in process.env) {
    if (!k.startsWith(ANGULAR_ENV_PREFIX)) continue;
    define[`process.env.${k}`] = JSON.stringify(process.env[k]);
  }
  return define;
}

module.exports = readEnvPlugin;
