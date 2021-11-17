import { pick, mapKeys } from 'lodash-es';
import { isCancel } from 'axios';

import withId from '@/mixins/withId.js';
import mixins from '@/utils/mixins.js';
import { getPlaceholderForNonValue } from '@/utils/misc';
import { getSearchSelectOptions, getDisplayNameById } from '@/utils/form';
import { formatWithUnit } from '@/utils/math';
import { getRequestConfig, normalizeResponse } from './helpers';

const mixinFactory = ({
  namespace,
  filter = {},
  items = [],
  total = 0,
  transformData = ({ data = {} } = {}) => ({
    items: data.records,
    total: data.page && data.page.total,
    data,
  }),
  pagination = {
    page: 1,
    rowsPerPage: 20,
  },
  paginationToQuery = {
    page: 'pageNum',
    rowsPerPage: 'perPageNum',
  },
}) => {
  return {
    name: 'with-list',

    data: (vm) => {
      return {
        [namespace]: {
          error: null,
          filter: typeof filter === 'function' ? filter(vm) : filter,
          items,
          loading: false,
          pagination,
          paginationToQuery,
          total,
        },
      };
    },

    computed: {
      hasPagination() {
        return !!this[namespace].pagination;
      },

      computedPagination() {
        return Object.assign(
          {
            page: 1,
          },
          this[namespace].pagination
        );
      },

      paginationForQuery() {
        if (!this.hasPagination) {
          return null;
        }

        const paginationForQuery = pick(this.computedPagination, Object.keys(this[namespace].paginationToQuery));
        return mapKeys(paginationForQuery, (_, key) => this[namespace].paginationToQuery[key]);
      },
    },

    methods: {
      setSortFilterValue({ prop, order }, { key = 'sortBy', propMapping } = {}) {
        if (!prop) {
          return;
        }

        const sortProp = propMapping ? propMapping[prop] : prop;

        if (order === 'ascending') {
          this[namespace].filter[key] = `${sortProp}@asc`;
        } else if (order === 'descending') {
          this[namespace].filter[key] = `${sortProp}@desc`;
        } else {
          this[namespace].filter[key] = '';
        }
      },

      toggleListState(key, index, value) {
        const item = this[namespace].items[index];
        if (item) {
          this.$set(this[namespace].items, index, {
            ...item,
            [key]: value === undefined ? !item[key] : value,
          });
        }
      },

      updatePagination(val) {
        if (this.hasPagination) {
          this[namespace].pagination = {
            ...this.computedPagination,
            ...val,
          };
        }
      },

      resetPagination() {
        this.updatePagination({
          page: 1,
        });
      },

      fetchListAndReset(dataFetcher) {
        if (this.computedPagination.page === 1) {
          dataFetcher.call(this);
        } else {
          this.resetPagination();
        }
      },

      async fetchList({ __alertError = true, ...config } = {}) {
        this[namespace].error = null;
        this[namespace].loading = true;

        config = getRequestConfig(config, {
          filter: this[namespace].filter,
          pagination: this.paginationForQuery,
          transformData,
        });

        try {
          const { data } = await this.$axios({
            ...config,
            cancellable: `fetchList-${this.$_id}`,
          });

          const { items, total } = normalizeResponse(data);

          this[namespace].loading = false;
          this[namespace].items = items;
          if (Number.isInteger(total)) {
            this[namespace].total = total;
          }

          return {
            items,
            total,
            data,
          };
        } catch (error) {
          if (!isCancel(error)) {
            // only reset loading state when request is not cancelled
            this[namespace].loading = false;
            this[namespace].error = error;

            if (__alertError) {
              // TODO: error handling
              console.error(error);
              if (!error.handled) {
                this.$errorReporter(error.message);
              }
            } else {
              throw error;
            }
          }
        }
      },
    },
  };
};

export default (config = {}) => {
  config.namespace = config.namespace || 'list';

  return mixins(withId, {
    provide() {
      return {
        $_list: this[config.namespace],
      };
    },

    beforeDestroy() {
      this.$axios.cancel(
        `fetchList-${this.$_id}`,
        `[withList] [fetchList] request cancelled due to component destruction`
      );
    },

    methods: {
      getPlaceholder(row, column, value) {
        return getPlaceholderForNonValue(value);
      },

      getDisplayNameById(...args) {
        return getDisplayNameById(...args);
      },

      getSearchSelectOptions(...args) {
        return getSearchSelectOptions(...args);
      },

      formatNumberWithUnit(...args) {
        return formatWithUnit(...args);
      },

      async handleListAction({ confirmText, successText, index, handler, onSuccess, onFailure } = {}) {
        try {
          if (confirmText) {
            await this.$confirm(confirmText, '提示', {
              type: 'warning',
            });
          }

          this.toggleListState('loading', index, true);
          try {
            const response = await handler();

            successText && this.$message.success(successText);
            onSuccess && onSuccess(response);
          } catch (error) {
            this.$message.error(error.message);
            onFailure && onFailure(error);
          } finally {
            this.toggleListState('loading', index, false);
          }
        } catch (error) {
          // cancelled
        }
      },
    },
  }).extend(mixinFactory(config));
};
