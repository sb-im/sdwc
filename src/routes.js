export default [
    {
        path: '/',
        title: '登录',
        component: require('./page/login.vue').default
    },
    {
        path: '/login',
        title: '登录',
        component: require('./page/login.vue').default
    },
    {
        path: '/app',
        title: '仪表盘',
        component: require('./dashboard.vue').default
    }
];
