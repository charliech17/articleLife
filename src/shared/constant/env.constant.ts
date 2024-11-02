export const NODE_ENV = 'NODE_ENV';
export const DEV = 'dev';
export const PROD = 'prod';
export const ENV_DEV = `.env.${DEV}`;
export const ENV_PROD = `.env.${PROD}`;
export const ANGULAR_ENV_PREFIX = 'NG_';

// 應與 .env 檔案中的變數名稱相同，且使用 "NG_" 前綴
export enum ENVS {
  NG_API_URL = 'NG_API_URL',
}
