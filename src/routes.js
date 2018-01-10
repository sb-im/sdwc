export default [
    {
        path: '/login',
        title: '登录',
        component: require('./Login.vue').default,
        icon: 'polymer'
    },
    {
        path: '/app',
        title: '应用设置',
        component: require('./App.vue').default,
        icon: 'settings'
    }
];
