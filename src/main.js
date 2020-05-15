import 'font-awesome/css/font-awesome.min.css';

import Vue from 'vue';
import VueHead from 'vue-head';
import VueLazyLoad from 'vue-lazyload';
import Gettext from 'vue-gettext';
/* eslint-disable import/extensions */
import VueImg from 'v-img';
import VueSVGIcon from 'vue-svgicon';
import miniToastr from 'mini-toastr';
import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';
import { format } from 'date-fns';

import App from './App';
import router from './router';
import translations from './translations.json';
import store from './store';
import './compiled-icons';

const version = process.env.VUE_APP_VERSION || 'dev';
/* eslint-disable-next-line no-console */
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

Vue.config.productionTip = false;
Vue.use(VueHead, {
  separator: '-',
  complement: 'OpenStore',
});
Vue.use(VueLazyLoad);
Vue.use(VueImg);
Vue.use(VueSVGIcon);
Vue.use(Gettext, {
  availableLanguages: {
    en_US: 'English',
    ar: 'Arabic',
    ast: 'Asturian',
    ca: 'Catalan',
    zh_Hant: 'Chinese (Traditional)',
    cs: 'Czech',
    nl: 'Dutch',
    en_GB: 'English (UK)',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    nb_NO: 'Norwegian Bokmål',
    pl: 'Polish',
    pt_PT: 'Portuguese',
    ru: 'Russian',
    sr: 'Serbian',
    es: 'Spanish',
    sv: 'Swedish',
    tr: 'Turkish',
  },
  translations,
  silent: true,
});

// Monkey patch the v-translate directive to strip out extra spaces
const originalBind = Vue.options.directives.translate.bind;
Vue.options.directives.translate.bind = (el, binding, vnode) => {
  /* eslint-disable-next-line no-param-reassign */
  el.innerHTML = el.innerHTML.replace(/ {2}/g, '');
  originalBind(el, binding, vnode);
};

const originalUpdate = Vue.options.directives.translate.update;
Vue.options.directives.translate.update = (el, binding, vnode) => {
  /* eslint-disable-next-line no-param-reassign */
  el.innerHTML = el.innerHTML.replace(/ {2}/g, '');
  originalUpdate(el, binding, vnode);
};

Vue.filter('date', (dateStr) => {
  return format(new Date(dateStr), 'MMMM do yyyy');
});

Vue.filter('datetime', (dateStr) => {
  return format(new Date(dateStr), 'yyyy-MM-dd H:mm');
});

Vue.filter('titleCase', (value) => {
  return value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: (h) => h(App),
});
