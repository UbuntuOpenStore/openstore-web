import Vue from 'vue';
import Vuex from 'vuex';

import api from '@/api';
import utils from '@/utils';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        isAuthenticated: false,
        user: null,
        categories: [],
        back: {name: 'browse'},
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            state.isAuthenticated = !!user;
        },
        setCategories(state, categories) {
            state.categories = categories;
        },
        setBack(state, back) {
            state.back = back;
        },
    },
    actions: {
        async getUser({state, commit}) {
            if (!state.user) {
                try {
                    let user = await api.auth.me();
                    commit('setUser', user);
                }
                catch (err) {
                    commit('setUser', null);
                }
            }
        },
        async getCategories({commit}, lang) {
            try {
                let categories = await api.categories(lang);
                commit('setCategories', categories);
            }
            catch (err) {
                utils.captureException(err);
            }
        },
    },
});
