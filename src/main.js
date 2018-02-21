import 'font-awesome/css/font-awesome.min.css';

import Vue from 'vue';
import VueHead from 'vue-head';
import moment from 'vue-moment';
import Sortable from 'sortablejs';
import App from './App';
import router from './router';

Vue.config.productionTip = false;
Vue.use(VueHead, {
    separator: '-',
    complement: 'OpenStore',
});
Vue.use(moment);

Vue.directive('sortable', {
    inserted: (el, binding) => {
        this.sortable = new Sortable(el, binding.value || {});
    },
});

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    render: (h) => {
        return h(App);
    },
});
