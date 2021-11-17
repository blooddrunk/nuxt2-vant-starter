import cloneDeep, pick, isEmpty from 'lodash-es';


import mixins from '@/utils/mixins.js';
import withId from '@/mixins/withId.js';

export const mixinFactory = (initialData, { namespace, idKey = 'id', inDialog = true, validatorRef = 'form' }) => ({
  name: 'with-form',

  props: {
    edittingItem: Object,
  },

  data: (vm) => {
    if (typeof initialData === 'function') {
      initialData = initialData(vm);
    }

    return {
      [namespace]: {
        data: cloneDeep(initialData),

        // defaultData stores data which serves to reset form
        defaultData: cloneDeep(initialData),

        // initialData is form initial data which serves to clear form
        initialData,
        saving: false,
        loading: false,
        fetchError: null,
        saveError: null,
      },
    };
  },

  computed: {
    formData() {
      return this[namespace].data;
    },

    hasFormData() {
      return !isEmpty(this.formData);
    },

    formId() {
      return this.formData && this.formData[idKey];
    },

    isEditting() {
      return !!this.edittingItem;
    },
  },

  created() {
    if (inDialog && typeof this.visible !== 'undefined') {
      this.$watch('visible', function (val) {
        if (!val) {
          setTimeout(() => {
            this.clearForm();

            const validator = this.$refs[validatorRef];
            if (validator) {
              validator.reset();
            }
          }, 300);
        }
      });
    }
  },

  methods: {
    // used with dialog
    async beforeFormClear(done) {
      const validator = this.$refs[validatorRef];
      if (validator) {
        const dirty = validator.flags.dirty;
        if (dirty) {
          try {
            await this.$confirm('您有更改尚未保存，确认关闭?', '提示', {
              type: 'warning',
            });
            done();
          } catch {
            // cancelled
          }
        } else {
          done();
        }
      } else {
        console.error(`It seems like you forgot to define ref for ValidationObserver`);
        done();
      }
    },

    clearFormError() {
      this[namespace].fetchError = null;
      this[namespace].saveError = null;
    },

    async clearForm() {
      this[namespace].data = cloneDeep(this[namespace].initialData);

      await this.clearFormError();
    },

    async resetForm() {
      this[namespace].data = cloneDeep(this[namespace].defaultData);

      await this.clearFormError();
    },

    updateForm(payload, { setDefault = true, strict = true } = {}) {
      if (strict) {
        payload = pick(payload, Object.keys(this[namespace].data));
      }

      this[namespace].data = {
        ...this[namespace].data,
        ...payload,
      };

      if (setDefault) {
        this[namespace].defaultData = cloneDeep(this[namespace].data);
      }
    },

    async fetchForm(config, { strict = true, presetData = {} } = {}) {
      this[namespace].fetchError = null;
      this[namespace].loading = true;

      try {
        const response = await this.$axios({
          ...config,
          cancellable: `fetchForm-${this.$_id}`,
        });

        let data = response.data;
        if (strict) {
          data = pick(data, Object.keys(this[namespace].data));
        }

        this[namespace].data = {
          ...this[namespace].data,
          ...presetData,
          ...data,
        };

        // fetched successfully, update default data
        this[namespace].defaultData = cloneDeep(this[namespace].data);

        this.$emit('form-fetched', response);

        return response;
      } catch (error) {
        console.error(error);
        this[namespace].fetchError = error;

        this.$message.error(error.message);
      } finally {
        this[namespace].loading = false;
      }
    },

    async saveForm(config) {
      this[namespace].saveError = null;
      this[namespace].saving = true;

      try {
        const response = await this.$axios(config);

        // saved successfully, update default data
        this[namespace].defaultData = cloneDeep(this[namespace].data);

        this.$emit('form-saved', response);

        return response;
      } catch (error) {
        this[namespace].saveError = error;

        // FIXME DO NOT throw maybe?
        throw error;
      } finally {
        this[namespace].saving = false;
      }
    },
  },
});

export default (initialData = {}, config = {}) => {
  config.namespace = config.namespace || 'form';

  return mixins(withId, {
    provide() {
      return {
        $_form: this[config.namespace],
      };
    },

    beforeDestroy() {
      this.$axios.cancel(
        `fetchForm-${this.$_id}`,
        `[${this.computedNamespace}withForm] [fetchForm] request cancelled due to component destruction`
      );
    },
  }).extend(mixinFactory(initialData, config));
};
