import 'font-awesome/css/font-awesome.min.css';

import Vue from 'vue';
import VueHead from 'vue-head';
import moment from 'vue-moment';
import VueNotifications from 'vue-notifications';
import VueLazyLoad from 'vue-lazyload';
import Gettext from 'vue-gettext';
/* eslint-disable import/extensions */
import VueImg from 'v-img';
import miniToastr from 'mini-toastr';

import App from './App';
import router from './router';
import translations from './translations.json';

miniToastr.init();
function toast({
    title, message, type, timeout, cb,
}) {
    return miniToastr[type](message, title, timeout, cb);
}

Vue.config.productionTip = false;
Vue.use(VueHead, {
    separator: '-',
    complement: 'OpenStore',
});
Vue.use(moment);
Vue.use(VueNotifications, {
    success: toast,
    error: toast,
    info: toast,
    warn: toast,
});
Vue.use(VueLazyLoad);
Vue.use(VueImg);
Vue.use(Gettext, {
    availableLanguages: {
        en_US: 'English',
    },
    translations: translations,
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: (h) => h(App),
});
