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
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

import App from './App';
import router from './router';
import translations from './translations.json';

let version = process.env.VUE_APP_VERSION || 'dev';
console.log(`OpenStore version ${version}`);

if (process.env.VUE_APP_SENTRY) {
    Sentry.init({
        release: `openstore-web@${version}`,
        dsn: process.env.VUE_APP_SENTRY,
        integrations: [new Integrations.Vue({
            Vue,
            attachProps: true,
        })],
    });
}

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
        ar: 'Arabic',
        ca: 'Catalan',
        zh_Hant: 'Chinese (Traditional)',
        cs: 'Czech',
        nl: 'Dutch',
        en_GB: 'English (UK)',
        fr: 'French',
        de: 'German',
        pt_PT: 'Portuguese',
        es: 'Spanish',
        sv: 'Swedish',
    },
    translations: translations,
});

// Monkey patch the v-translate directive to strip out extra spaces
let originalBind = Vue.options.directives.translate.bind;
Vue.options.directives.translate.bind = (el, binding, vnode) => {
    el.innerHTML = el.innerHTML.replace(/ {2}/g, '');
    originalBind(el, binding, vnode);
};

let originalUpdate = Vue.options.directives.translate.update;
Vue.options.directives.translate.update = (el, binding, vnode) => {
    el.innerHTML = el.innerHTML.replace(/ {2}/g, '');
    originalUpdate(el, binding, vnode);
};

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: (h) => h(App),
});
