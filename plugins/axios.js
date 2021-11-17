import { isCancel } from 'axios';
import { merge, isPlainObject } from 'lodash-es';
import consola from 'consola';

import axiosCancel from '@/utils/axios';
import { jsonToUrlParams } from '@/utils/form';

const setupDebugInterceptor = (axios) => {
  axios.onError((error) => {
    if (isCancel(error)) {
      consola.warn(error);
    } else {
      consola.error(error);
    }
  });

  axios.onResponse((res) => {
    consola.success(
      `[${res.status} ${res.statusText ? res.statusText : ''}]`,
      `[${res.config.method.toUpperCase()}]`,
      res.config.url
    );

    if (process.browser) {
      consola.info(res);
    } else {
      consola.log(JSON.stringify(res.data, undefined, 2));
    }

    return res;
  });
};

const defaultDataTransformer = ({ data = [] } = {}) => data;

const forceLogout = ({ app, redirect, store, route }, message = '会话已过期，请重新登录') => {
  if (!store.state.auth.hasForcedOut) {
    app.$notify.warning({
      title: '提醒',
      message,
    });
    store.commit('auth/forceLogout', true);
    redirect('/sign-in', {
      from: route.name,
      ...route.query,
    });
  }

  return message;
};

const forceChangePassword = ({ app, store }) => {
  if (!store.state.auth.shouldChangePassword) {
    const message = '您的密码尚未修改，请修改密码';
    app.$notify.warning({
      title: '提醒',
      message,
    });
    store.commit('auth/forceChangePassword', true);
    return message;
  }
};

const validateResponse = (response, { app, route, redirect, store }) => {
  if (!isPlainObject(response)) {
    return response;
  }

  const { code = 0, message = '未知错误', ...rest } = response;
  let modifiedMessage = '';
  switch (`${code}`) {
    case '200':
      return rest;
    case '401':
      modifiedMessage = forceLogout({ app, route, redirect, store });
      break;
    case '423':
      modifiedMessage = forceChangePassword({ app, store });
      break;
    default: {
      break;
    }
  }

  const error = new Error(modifiedMessage || message);
  error.statusCode = Number.parseInt(code);
  error.handled = modifiedMessage;
  throw error;
};

const handleErrorStatus = ({ status, data = {} }, { app, route, redirect, store }) => {
  const { code, message } = data;

  const statusCode = code || status;
  switch (`${statusCode}`) {
    case '401':
      return forceLogout({ app, route, redirect, store });
    case '403':
      return message || '没有权限';
    case '423':
      return forceChangePassword({ app, store });
    default:
      // return message || `服务异常: ${status}`;
      return '';
  }
};

export default (ctx) => {
  const { $axios, isDev, store } = ctx;

  axiosCancel($axios, {
    debug: isDev,
    logger: consola.info,
  });

  if (isDev) {
    setupDebugInterceptor($axios);
  }

  $axios.onRequest(({ __urlEncoded = false, ...config }) => {
    const presetConfig = {
      headers: {
        token: store.getters['auth/token'],
      },
      xsrfCookieName: 'X-XSRF-TOKEN',
    };

    if (__urlEncoded) {
      presetConfig.headers['content-type'] = 'application/x-www-form-urlencoded';
      if (isPlainObject(config.data)) {
        config.data = jsonToUrlParams(config.data);
      }
    }

    config = merge({ method: 'get' }, config, presetConfig);

    // FIXME: this will cause bug if url starts with http:// or https://
    config.url = config.url.replace(/[/]{2,}/g, '/');

    return config;
  });

  $axios.onResponse((response) => {
    const {
      config: { __needValidation = true, transformData = true },
    } = response;

    if (__needValidation) {
      try {
        response.data = validateResponse(response.data, ctx);

        if (typeof transformData === 'function') {
          response.data = transformData(response.data);
        } else if (transformData === true) {
          response.data = defaultDataTransformer(response.data);
        }
      } catch (error) {
        error.config = response.config;
        throw error;
      }
    }
  });

  $axios.onError((error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      error.handled = handleErrorStatus(error.response, ctx);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      const message = '网络异常，请尝试重新登录';
      error.handled = message;
      forceLogout(ctx, message);
    }

    if (error.handled && typeof error.handled === 'string') {
      error.message = error.handled;
    }
    return Promise.reject(error);
  });
};
