export default {
  beforeCreate() {
    Object.defineProperty(this, '$_id', {
      configurable: true,
      get: () => this._uid,
    });
  },
};
