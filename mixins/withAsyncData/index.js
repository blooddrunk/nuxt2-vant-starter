import { isCancel } from 'axios';

import withRequestManager from '@/mixins/withRequestManager.js';
import mixins from '@/utils/mixins.js';
import { getDisplayName } from '@/utils/vm';
import { getDefaultFieldConfig, normalizeFields } from './helpers';

const mixinFactory = (fields = [], { namespace = 'asyncData' } = {}) => {
  if (!Array.isArray(fields)) {
    console.error('[withAsyncData] ', 'field config should be an array');
    return;
  }

  return {
    name: 'with-async-data',

    data: () => ({
      [namespace]: normalizeFields(fields),
    }),

    methods: {
      async fetchAsyncData(fieldName, { __alertError = true, ...config } = {}, label = '') {
        if (!Object.prototype.hasOwnProperty.call(this[namespace], fieldName)) {
          console.error(`${getDisplayName(this)}[withAsyncData] '${fieldName}' not defined in asyncData`);
          return;
        }

        const field = this[namespace][fieldName];

        field.loading = true;
        try {
          const { data } = await this.$axios(this.enhanceRequest(fieldName, config));

          field.loading = false;
          field.data = data || field.initialData;

          this.removeRequest(fieldName);
          return field;
        } catch (error) {
          this.removeRequest(fieldName);

          if (!isCancel(error)) {
            field.loading = false;
            field.error = error;
            field.data = field.initialData;

            if (__alertError) {
              // TODO: deal with error
              console.error(error);
              if (!error.handled) {
                if (label) {
                  this.$errorReporter(`${label}数据加载失败，请稍后重试`);
                } else {
                  this.$errorReporter(error.message);
                }
              }
            } else {
              throw error;
            }
          }
        }
      },

      resetAsyncData(givenFields) {
        if (!givenFields) {
          this.cancelAllRequests(`All requests in current component canceled`);
          this[namespace] = normalizeFields(fields);
        } else {
          if (!Array.isArray(givenFields)) {
            givenFields = [givenFields];
          }

          givenFields.forEach((field) => {
            const [key, config] = getDefaultFieldConfig(field);
            this.cancelRequest(key, `Request [${key}] canceled`);
            this[namespace][key] = config;
          });
        }
      },
    },
  };
};

export default (params) => mixins(withRequestManager()).extend(mixinFactory(params));
