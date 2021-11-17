import Vue from 'vue';

import scroll from './scroll';

const directives = {
  scroll,
};

for (const name in directives) {
  Vue.directive(name, directives[name]);
}
