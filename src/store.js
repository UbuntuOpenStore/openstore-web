/* eslint-disable no-param-reassign */

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
    allCategories: [],
    back: { name: 'browse' },
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    },
    setCategories(state, categories) {
      state.categories = categories;
    },
    setAllCategories(state, allCategories) {
      state.allCategories = allCategories;
    },
    setBack(state, back) {
      state.back = back;
    },
  },
  actions: {
    async getUser({ state, commit }) {
      if (!state.user) {
        try {
          const user = await api.auth.me();
          commit('setUser', user);
        }
        catch (err) {
          commit('setUser', null);
        }
      }
    },
    async getCategories({ commit }, lang) {
      try {
        const [categories, allCategories] = await Promise.all([
          api.categories(lang),
          api.categories(lang, true),
        ]);

        commit('setCategories', categories);
        commit('setAllCategories', allCategories);
      }
      catch (err) {
        utils.captureException(err);
      }
    },
  },
});
