import { join } from 'node:path';
import { defineConfig } from '@umijs/max';

import proxy from './proxy';
import routes from './routes';

const { UMI_ENV = 'dev' } =
  process.env;

export default defineConfig({
  alias: {
    '@root': join(__dirname, '..'),
  },
  access: {},

  routes,

  hash: true,

  esbuildMinifyIIFE: true,

  publicPath: '/',

  fastRefresh: true,

  title: 'AGEST Desk',

  proxy:
    proxy[
      UMI_ENV as keyof typeof proxy
    ],

  model: {},

  initialState: {},

  locale: {
    default: 'en-US',
    antd: false,
    baseNavigator: false,
  },
});
