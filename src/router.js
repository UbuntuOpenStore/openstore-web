import Vue from 'vue';
import Router from 'vue-router';
import Browse from '@/views/Browse.vue';
import Package from '@/views/Package.vue';
import About from '@/views/About.vue';
import Submit from '@/views/Submit.vue';
import Login from '@/views/Login.vue';
import Manage from '@/views/Manage.vue';
import ManagePackage from '@/views/ManagePackage.vue';
import ManageRevisions from '@/views/ManageRevisions.vue';
import Stats from '@/views/Stats.vue';
import Feeds from '@/views/Feeds.vue';
import NotFound from '@/views/NotFound.vue';

Vue.use(Router);

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'browse',
            component: Browse,
        }, {
            path: '/app/:id',
            name: 'app',
            component: Package,
        }, {
            path: '/about',
            name: 'about',
            component: About,
        }, {
            path: '/submit',
            name: 'submit',
            component: Submit,
        }, {
            path: '/login',
            name: 'login',
            component: Login,
        }, {
            path: '/manage',
            name: 'manage',
            component: Manage,
        }, {
            path: '/manage/:id',
            name: 'manage_package',
            component: ManagePackage,
        }, {
            path: '/manage/:id/revision',
            name: 'manage_revisions',
            component: ManageRevisions,
        }, {
            path: '/stats',
            name: 'stats',
            component: Stats,
        }, {
            path: '/feeds',
            name: 'feeds',
            component: Feeds,
        }, {
            path: '*',
            name: 'not_found',
            component: NotFound,
        },
    ],
});
