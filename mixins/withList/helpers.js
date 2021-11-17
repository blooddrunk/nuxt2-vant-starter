import { merge } from 'lodash-es';

import { trimValues } from '@/utils/form';

export const getRequestConfig = (config, { filter, pagination, transformData }) => {
  config.method = config.method || 'get';

  let payload = {
    ...pagination,
    ...trimValues(filter),
  };
  if (typeof config.parsePayload === 'function') {
    payload = config.parsePayload(payload, {
      filter,
      pagination,
    });
    delete config.parsePayload;
  }

  if (config.method.toLowerCase() === 'get') {
    payload = { params: payload };
  } else {
    payload = { data: payload };
  }

  config = merge(
    {
      transformData,
      ...payload,
    },
    config
  );

  return config;
};

export const normalizeResponse = (response) => {
  const error = new Error(
    `[fetchList] expects response to be an array or object with both 'items' and 'total' key, check your api and data transformer`
  );

  if (!response) {
    throw error;
  }

  let items, total;

  if (Array.isArray(response)) {
    items = response;
    total = items.length;
  } else {
    ({ items, total } = response);
  }

  if (!items) {
    throw error;
  }

  return {
    ...response,
    items,
    total,
  };
};
