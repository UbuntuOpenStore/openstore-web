import Vue from 'vue';
import Vuex from 'vuex';

import api from '@/api';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        isAuthenticated: false,
        user: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            state.isAuthenticated = !!user;
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
    },
});
