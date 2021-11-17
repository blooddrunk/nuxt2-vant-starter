import { CancelToken } from 'axios';
import consola from 'consola';

import { RequestManager } from '@/utils/axios.js';
import { getDisplayName } from '@/utils/vm.js';

const isDev = process.env.NODE_ENV === 'development';

// This mixin relies on axios and nuxt-axios module
export default ({ cancelOnDestroy = true } = {}) => ({
  name: 'with-request-manager',

  beforeDestroy() {
    if (cancelOnDestroy && this.$_requestManager) {
      this.cancelAllRequests(
        `${getDisplayName(
          this
        )}[withRequestManager]: cancelling request due to component destruction`
      );

      this.$_requestManager = null;
    }
  },

  methods: {
    enhanceRequest(requestId, requestConfig) {
      if (!requestId) {
        return;
      }

      if (!this.$_requestManager) {
        const config = {
          debug: isDev,
          logger: consola.info,
        };

        this.$_requestManager = new RequestManager(config);
      }

      const source = CancelToken.source();
      this.$_requestManager.add(requestId, source.cancel);

      return {
        ...requestConfig,
        cancelToken: source.token,
      };
    },

    removeRequest(requestId) {
      this.$_requestManager && this.$_requestManager.remove(requestId);
    },

    cancelRequest(requestId, reason) {
      this.$_requestManager && this.$_requestManager.cancel(requestId, reason);
    },

    cancelAllRequests(reason) {
      this.$_requestManager && this.$_requestManager.cancelAll(reason);
    },
  },
});
