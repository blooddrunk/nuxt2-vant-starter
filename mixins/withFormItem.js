import { omit } from 'lodash-es';

export default () => ({
  props: {
    vid: {
      type: String,
      default: undefined,
    },

    rules: {
      type: [Object, String],
      default: '',
    },

    mode: {
      type: String,
      default: undefined,
    },

    fieldClass: {
      type: String,
      default: 'tw-w-full',
    },
  },

  computed: {
    formComponentProps() {
      return omit(this.$attrs, ['label', 'labelWidth']);
    },
  },
});
