import Vue from 'vue';

export default (...args) => Vue.extend({ mixins: args });
