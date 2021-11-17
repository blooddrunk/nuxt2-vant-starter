// import createPersistedState from 'vuex-persistedstate';

// // 'auth/updateUser'
// export const plugins = [
//   createPersistedState({
//     key: 'anhui_tv_web',
//     paths: ['auth.user', 'ui.sidebarCollapsed'],
//     filter: ({ type }) => ['auth/loginSuccess', 'auth/logoutSuccess', 'ui/toggleSidebar'].includes(type),
//   }),
// ];

export const state = () => ({
  currentMemberType: '',
});

export const mutations = {};

export const actions = {};
