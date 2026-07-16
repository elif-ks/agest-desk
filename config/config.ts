import { join } from 'node:path';
import { defineConfig } from '@umijs/max';

import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';

const { UMI_ENV = 'dev' } =
  process.env;

export default defineConfig({
  alias: {
    '@root': join(__dirname, '..'),
  },

  routes,

  hash: true,

  publicPath: '/',

  fastRefresh: true,

  title: 'AGEST Desk',

  proxy:
    proxy[
      UMI_ENV as keyof typeof proxy
    ],

  model: {},

  initialState: {},

  layout: {
    locale: false,
    ...defaultSettings,
  },

  locale: {
    default: 'en-US',
    antd: true,
    baseNavigator: false,
  },

  antd: {
    appConfig: {},
    configProvider: {
      variant: 'filled',
      theme: {
        token: {
          fontFamily:
            'Inter, Arial, Helvetica, sans-serif',
          borderRadius: 8,
        },
      },
    },
  },
});