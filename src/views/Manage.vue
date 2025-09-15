<template>
  <div class="row">
    <div v-if="user">
      <h1 class="center">
        <translate :translate-params="{name: user.name}">Welcome %{name}!</translate>
      </h1>

      <div class="u-float-right buttons">
        <router-link :to="{name: 'submit'}" class="p-button--positive">
          <span v-translate>Submit App</span>
        </router-link>

        <button class="p-button--neutral u-float-right" @click="showApikey = !showApikey">
          <span v-translate>API Key</span>
        </button>

        <p class="apikey" v-if="showApikey">
          <span v-translate>Keep your api key private!</span>
          <br />
          <span>{{user.apikey}}</span>
        </p>
      </div>

      <form class="p-form p-form--inline" v-on:submit.prevent>
        <div class="p-form__group">
          <label for="search" class="p-form__label" v-translate>Search</label>
          <input
            type="text"
            id="search"
            class="p-form__control"
            :value="query.search"
            @input="query.search = $event.target.value"
          />
        </div>
      </form>

      <p>
        Going forward, all new OpenStore features will be only available through
        <a href="https://next.open-store.io/manage">the new website</a>.
        Please use it to manage your apps.
      </p>

      <h2
        v-if="error"
        class="center text-red"
        v-translate
      >There was an error trying to load the app list, please refresh and try again.</h2>

      <div v-if="loading" class="center loading">
        <svgicon class="spin" icon="spinner" width="3em" height="3em" color="#007aa6" />
      </div>

      <div class="row" v-if="!loading">
        <table>
          <thead>
            <tr>
              <!-- TODO sorting -->
              <th class="icon-cell" v-translate>Icon</th>
              <th class="u-hide--small" v-translate>Name</th>
              <th class="u-show--small u-hide" v-translate>App</th>
              <th v-if="user.role === 'admin'" v-translate>Publisher</th>
              <th class="u-hide--small" v-translate>Status</th>
              <th class="u-hide--small" v-translate>Version</th>
              <th class="u-hide--small" v-translate>Downloads</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in apps" :key="app.id">
              <td class="icon-cell">
                <router-link :to="{name: 'manage_package', params: {id: app.id}}">
                  <img :src="app.icon" :alt="app.name" class="icon" />
                </router-link>
              </td>
              <td class="u-hide--small">
                <router-link :to="{name: 'manage_package', params: {id: app.id}}">{{app.name}}</router-link>
              </td>
              <td class="u-show--small u-hide">
                <router-link
                  :to="{name: 'manage_package', params: {id: app.id}}"
                >{{app.name}} v{{app.version}}</router-link>
                <br />
                <span v-translate>Downloads</span>
                : {{app.totalDownloads || 'None'}}
              </td>
              <td v-if="user.role === 'admin'">{{app.publisher}}</td>
              <td class="u-hide--small">
                <span v-if="app.published" class="text-green" v-translate>Published</span>
                <span v-else class="text-lightgrey" v-translate>Not published</span>
              </td>
              <td class="u-hide--small">{{app.version}}</td>
              <td class="u-hide--small">
                <span class="mr" v-translate>Total:</span>
                <span v-if="app.totalDownloads > 0">{{app.totalDownloads | number}}</span>
                <span v-if="app.totalDownloads === 0" v-translate>None</span>

                <div v-if="app.version">
                  <span class="mr">v{{app.version}}:</span>
                  <span v-if="app.latestDownloads > 0">{{app.latestDownloads | number}}</span>
                  <span v-if="app.latestDownloads === 0" v-translate>None</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <h3 v-if="apps.length === 0 && !error" class="center">
          <span v-translate>No apps found.</span>
          <span v-if="query.search" v-translate>Try searching for something else</span>
        </h3>
      </div>

      <pagination v-model="page" :total="totalPages" />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import debounce from 'debounce';

import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';
import Pagination from '@/components/Pagination';

export default {
  name: 'Manage',
  components: {
    Pagination,
  },
  head: {
    title() {
      return { inner: this.$gettext('Manage Apps') };
    },
    meta() {
      return opengraph({
        title: `${this.$gettext('Manage')} - OpenStore`,
      });
    },
  },
  data() {
    return {
      query: {
        limit: 30,
        skip: 0,
        search: '',
        sort: 'relevance',
      },
      page: 0,
      totalPages: 0,
      apps: [],
      loading: false,
      error: false,
      showApikey: false,
    };
  },
  created() {
    if (this.isAuthenticated) {
      this.debounceRefresh();
    }
  },
  methods: {
    refresh() {
      this.loading = true;
      api.manage
        .search(this.query, this.user.apikey)
        .then((data) => {
          this.apps = data.packages;

          this.totalPages = Math.ceil(data.count / this.query.limit) - 1;
          this.loading = false;
        })
        .catch((err) => {
          this.loading = false;
          this.error = true;

          utils.captureException(err);
        });
    },
    debounceRefresh: debounce(function() {
      this.refresh();
    }, 300),
  },
  computed: mapState(['user', 'isAuthenticated']),
  watch: {
    page() {
      this.query.skip = this.page * this.query.limit;
      this.debounceRefresh();
    },
    'query.search': function() {
      this.debounceRefresh();
    },
    isAuthenticated(newValue) {
      if (newValue) {
        this.debounceRefresh();
      }
    },
  },
};
</script>

<style scoped>
h1 {
  margin-top: 2px;
}

.icon-cell {
  min-width: 4em;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
}

/* TODO share this with the Browse view */
.pagination {
  display: inline-block;
  padding-left: 0;
  margin-left: 0;
}

.pagination li {
  display: inline;
  padding: 0 1em;
}

.pagination li.disabled {
  opacity: 0.5;
}

.pagination li.disabled a {
  cursor: default;
}

.pagination li.active {
  font-weight: bold;
}

.apikey {
  margin-top: 0;
}

td div {
  margin-top: 0;
}

@media screen and (max-width: 768px) {
  .u-show--small {
    display: table-cell !important;
  }

  .buttons {
    width: 100%;
    margin-bottom: 1em;
  }
}
</style>
