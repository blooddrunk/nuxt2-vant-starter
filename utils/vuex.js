import { get } from 'lodash-es';

export const setState = (property) => (store, payload) => (store[property] = payload);
export const toggleState = (property) => (store, payload) =>
  (store[property] = typeof payload === 'undefined' ? !store[property] : payload);
export const pushState = (property) => (store, payload) => store[property].push(payload);

export const getState = (state, namespace) => {
  if (!namespace) {
    return state;
  }

  return get(state, Array.isArray(namespace) ? namespace : namespace.split('/'));
};

/**
 * These helpers serves the situation where value of dynamic namespace
 * needs be evaluated lazily
 */
const createNamespaceMap =
  (actionCreator) =>
  (keys = [], namespaceGetter = (vm) => vm.namespace) => {
    return keys.reduce(function (acc, cur) {
      acc[cur] = actionCreator(cur, namespaceGetter);
      return acc;
    }, {});
  };

export const bindState = createNamespaceMap((key, namespaceGetter) => {
  return function (state) {
    return getState(state, namespaceGetter(this));
  };
});

export const bindGetters = createNamespaceMap((key, namespaceGetter) => {
  return function (_, getters) {
    return getters[`${namespaceGetter(this)}/${key}`];
  };
});

export const bindMutations = createNamespaceMap((key, namespaceGetter) => {
  return function (commit, payload) {
    return commit(`${namespaceGetter(this)}/${key}`, {
      vm: this,
      ...payload,
    });
  };
});

export const bindActions = createNamespaceMap((key, namespaceGetter) => {
  return function (dispatch, payload) {
    return dispatch(`${namespaceGetter(this)}/${key}`, {
      vm: this,
      ...payload,
    });
  };
});
