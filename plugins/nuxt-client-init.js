import Vue from 'vue';

import { getPlaceholderForNonValue } from '@/utils/misc';

export default async ({ $config }, inject) => {
  Vue.prototype.$getPlaceholder = getPlaceholderForNonValue;

  inject('apiRoot', $config.apiRoot);
  inject('apiPrefix', $config.apiPrefix);
  inject('routerRoot', $config.routerRoot);
};
