export default () => ({
  props: {
    value: [String, Number],
  },

  computed: {
    innerValue: {
      get() {
        return this.value;
      },

      set(val) {
        this.$emit('input', val);
      },
    },
  },
});
