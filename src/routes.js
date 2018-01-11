export default [
    {
        path: '/login',
        title: '登录',
        component: require('./page/login.vue').default,
        icon: 'polymer'
    },
    {
        path: '/app',
        title: '应用设置',
        component: require('./dashboard.vue').default,
        icon: 'settings'
    }
];
