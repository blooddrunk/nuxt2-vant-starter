export default ({ $axios, app }) => {
  app.router.afterEach(() => {
    $axios.cancelAll();
  });
};
