import Vue from 'vue';
import Router from 'vue-router';
import Browse from '@/components/Browse';
import Package from '@/components/Package';
import About from '@/components/About';
import Submit from '@/components/Submit';
import Login from '@/components/Login';
import Manage from '@/components/Manage';
import ManagePackage from '@/components/ManagePackage';
import ManageRevisions from '@/components/ManageRevisions';
import Stats from '@/components/Stats';
import NotFound from '@/components/NotFound';

Vue.use(Router);

export default new Router({
    mode: 'history',
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
            path: '/stats/',
            name: 'stats',
            component: Stats,
        }, {
            path: '*',
            name: 'not_found',
            component: NotFound,
        },
    ],
});
