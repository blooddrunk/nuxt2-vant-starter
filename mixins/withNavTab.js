import { mapState } from 'vuex';

import { getRouteOfMenuItem } from '@/utils/menu';

export default (rootRouteName) => ({
  middleware({ redirect, route, store }) {
    const rootRoute = store.getters['ui/menuLookupByRoute'][rootRouteName];
    if (!rootRoute) {
      return;
    }

    const childRoutes = rootRoute.children || [];
    store.commit('ui/setCurrentNavTab', childRoutes);

    if (route.name === rootRouteName) {
      const firstPermittedMenu = store.getters['auth/getFirstPermittedMenuByRoute'](childRoutes);
      const firstNavigableRoute = getRouteOfMenuItem(firstPermittedMenu);

      if (firstNavigableRoute) {
        return redirect({
          ...firstNavigableRoute,
          query: {
            child_of: rootRoute.id,
          },
        });
      }
    }
  },

  computed: {
    ...mapState('ui', ['currentNavTabList']),
  },
});
