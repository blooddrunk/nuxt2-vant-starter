import { join } from 'path';

const APP_NAME = '统一支付';

export default {
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: APP_NAME,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, minimum-scale==1, maximum-scale=1' },
      { hid: 'description', name: 'description', content: '' },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: `${process.env.ROUTER_ROOT}/favicon.ico`.replace(/\/\//g, '/'),
      },
    ],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['@/assets/css/main.css', 'animate.css'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '@/plugins/polyfill',
    '@/plugins/nuxt-client-init',
    '@/plugins/filters',
    '@/plugins/directives',
    '@/plugins/axios',
    '@/plugins/router-after-each',
    '@/plugins/font-awesome',
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: [
    '@/components',
    // { path: '@/components/base/chart', pathPrefix: false, prefix: 'base' },
    // { path: '@/components/base/form', pathPrefix: false, prefix: 'base' },
  ],

  router: {
    base: process.env.ROUTER_ROOT,

    extendRoutes(routes, resolve) {
      routes.push({
        name: 'fallback',
        path: '*',
        component: resolve(__dirname, 'pages/index.vue'),
      });
    },

    middleware: [],
  },

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://composition-api.nuxtjs.org/
    '@nuxtjs/composition-api/module',
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
  ],

  eslint: {
    files: ['.', '!node_modules'],
  },

  tailwindcss: {
    exposeConfig: true,
  },

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
  ],

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    proxy: true,
  },

  proxy: [
    [
      '^/hn/',
      {
        target: 'http://hn.algolia.com/api/v1',
        pathRewrite: {
          '^/hn': '',
        },
      },
    ],

    [
      (pathname) => pathname.match('^/(security|stb)/'),
      {
        target: 'http://172.21.30.67:20080', // 开发环境
        // target: 'http://172.21.30.150:20080', // 测试环境
      },
    ],
  ],

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    babel: {
      plugins: [
        ['@babel/plugin-proposal-private-methods', { loose: true }],
        [
          [
            'import',
            {
              libraryName: 'vant',
              libraryDirectory: 'es',
              style: true,
            },
            'vant',
          ],
        ],
      ],
    },

    extend(config) {
      // alias
      config.resolve.alias.styles = join(config.resolve.alias.assets, 'scss');
    },

    transpile: [],
  },

  // buildDir: 'stb-web',

  env: {},

  publicRuntimeConfig: {
    appName: APP_NAME,
    routerRoot: process.env.ROUTER_ROOT,
    apiRoot: process.env.API_ROOT,
    apiPrefix: process.env.API_PREFIX,
  },

  privateRuntimeConfig: {},

  loading: { color: '#38b2ac' },

  loadingIndicator: {
    name: 'cube-grid',
    color: '#f7ead1',
    background: 'hsl(220, 16%, 46%, 0.75)',
  },

  server: {
    port: 6400,
    host: '0.0.0.0',
  },

  vue: {
    config: {
      devtools: true,
    },
  },

  messages: {
    error_404: '404 NOT FOUND',
    back_to_home: '返回首页',
    nuxtjs: APP_NAME,
  },
};
