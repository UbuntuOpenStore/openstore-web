<template>
  <div>
    <div class="p-strip">
      <h1 v-translate>Ubuntu Touch Apps</h1>
    </div>

    <div class="row filters">
      <form class="p-form p-form--inline" @submit.prevent>
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

        <div class="p-form__group">
          <label for="category" class="p-form__label" v-translate>Category</label>
          <select id="category" class="p-form__control" v-model="query.category">
            <option value v-translate>All Categories</option>
            <option
              v-for="category in categories"
              :value="category.category"
              :key="category.category"
            >{{category.translation}}</option>
          </select>
          <!--TODO make this a fancy dropdown with our icons-->
        </div>

        <div class="p-form__group">
          <label for="type" class="p-form__label" v-translate>Type</label>
          <select id="type" class="p-form__control" v-model="query.type">
            <option value v-translate>All Types</option>
            <option value="app" v-translate>Apps</option>
            <option value="webapp" v-translate>Web Apps</option>
          </select>
        </div>

        <div class="p-form__group">
          <label for="sort-by" class="p-form__label" v-translate>Sort By</label>
          <select id="sort-by" class="p-form__control" v-model="query.sort">
            <option value="relevance" v-translate>Relevance</option>
            <option value="-calculated_rating" v-translate>Most Popular</option>
            <option value="calculated_rating" v-translate>Least Popular</option>
            <option value="name" v-translate>Title (A-Z)</option>
            <option value="-name" v-translate>Title (Z-A)</option>
            <option value="-published_date" v-translate>Newest</option>
            <option value="published_date" v-translate>Oldest</option>
            <option value="-updated_date" v-translate>Latest Update</option>
            <option value="updated_date" v-translate>Oldest Update</option>
          </select>
        </div>

        <div class="p-form__group">
          <label for="channel" class="p-form__label" v-translate>Channel</label>
          <select id="channel" class="p-form__control" v-model="query.channel">
            <option value="" v-translate>All Channels</option>
            <option value="xenial" v-translate>Xenial</option>
            <option value="focal" v-translate>Focal</option>
          </select>
        </div>
      </form>
    </div>

    <!-- TODO implement these
    <div class="p-form__group">
      <label for="license" class="p-form__label">License</label>
      <input type="text" id="license" class="p-form__control" />
    </div>

    <div class="p-form__group">
      <label for="framework" class="p-form__label">Framework</label>
      <input type="text" id="framework" class="p-form__control" />
    </div>
    -->

    <h2
      v-if="error"
      class="center text-red"
      v-translate
    >There was an error trying to load the app list, please refresh and try again.</h2>

    <div v-if="loading" class="center loading">
      <svgicon class="spin" icon="spinner" width="3em" height="3em" color="#007aa6" />
    </div>

    <div class="row" v-if="!loading">
      <ul class="p-matrix u-clearfix">
        <li v-for="app in apps" class="p-matrix__item" :key="app.id">
          <types class="types" :types="app.types"></types>

          <img
            class="p-matrix__img"
            :src="app.icon"
            :alt="app.name"
            @click="$router.push({name: 'app', params: {id: app.id}})"
          />
          <most-rated :ratings="app.ratings" />

          <div class="p-matrix__content">
            <h3 class="p-matrix__title">
              <router-link
                class="p-matrix__link"
                :to="{name: 'app', params: {id: app.id}}"
              >{{app.name}}</router-link>
            </h3>

            <p class="p-matrix__desc" v-if="app.nsfw" v-translate>NSFW content</p>
            <p class="p-matrix__desc" v-else>{{app.tagline}}</p>
          </div>
        </li>
      </ul>

      <h3 v-if="apps.length === 0 && !error" class="center">
        <span v-translate>No apps found.</span>
        <span v-if="query.search" v-translate>Try searching for something else</span>
      </h3>
    </div>

    <pagination v-model="page" :total="totalPages" />
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import debounce from 'debounce';
import isEqual from 'lodash.isequal';

import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';
import Types from '@/components/Types';
import MostRated from '@/components/MostRated';
import Pagination from '@/components/Pagination';

const DEFAULT_SORT = '-published_date';
const DEFAULT_TYPE = '';
const DEFAULT_CATEGORY = '';
const DEFAULT_CHANNEL = '';

export default {
  name: 'Browse',
  components: {
    Types,
    MostRated,
    Pagination,
  },
  head: {
    title() {
      return { inner: this.$gettext('Browse Apps') };
    },
    meta() {
      return opengraph();
    },
  },
  data() {
    return {
      query: {
        limit: 30,
        skip: 0,
        search: '',
        sort: DEFAULT_SORT,
        type: DEFAULT_TYPE,
        category: DEFAULT_CATEGORY,
        channel: DEFAULT_CHANNEL,
      },
      page: 0,
      totalPages: 0,
      apps: [],
      loading: false,
      error: false,
      created: false,
    };
  },
  created() {
    this.getQueryParams();
    this.$store.commit('setBack', {
      name: this.$router.currentRoute.name,
      params: this.$router.currentRoute.params,
      query: this.$router.currentRoute.query,
    });
    this.debounceRefresh();

    Vue.nextTick().then(() => {
      this.created = true;
    });
  },
  methods: {
    getQueryParams() {
      let changed = false;

      let page = 0;
      if (this.$route.query.page && parseInt(this.$route.query.page, 10)) {
        page = this.$route.query.page - 1;
        if (page < 0) {
          page = 0;
        }
      }

      if (page != this.page) {
        this.page = page;
        this.query.skip = this.page * this.query.limit;
        changed = true;
      }

      if (this.$route.query.sort != this.query.sort) {
        const sort = this.$route.query.sort ?
          this.$route.query.sort :
          DEFAULT_SORT;

        if (sort != this.query.sort) {
          this.query.sort = sort;
          changed = true;
        }
      }

      if (this.$route.query.type != this.query.type) {
        const type = this.$route.query.type ?
          this.$route.query.type :
          DEFAULT_TYPE;

        if (type != this.query.type) {
          this.query.type = type;
          changed = true;
        }
      }

      if (this.$route.query.category != this.query.category) {
        let category = this.$route.query.category;
        if (!category) {
          category = DEFAULT_CATEGORY;
        }

        if (category != this.query.category) {
          this.query.category = category;
          changed = true;
        }
      }

      if (this.$route.query.channel != this.query.channel) {
        let channel = this.$route.query.channel;
        if (!channel) {
          channel = DEFAULT_CHANNEL;
        }

        if (channel != this.query.channel) {
          this.query.channel = channel;
          changed = true;
        }
      }

      if (this.$route.query.search != this.query.search) {
        const search = this.$route.query.search ? this.$route.query.search : '';
        if (search != this.query.search) {
          this.query.search = search;
          this.query.sort = this.query.sort ? this.query.sort : 'relevance';
          changed = true;
        }
      }

      return changed;
    },
    setQueryParams() {
      const queryParams = {};
      if (this.page !== 0) {
        // Make this a string because the router stores the query params as a string
        queryParams.page = `${this.page + 1}`;
      }

      if (this.query.sort != DEFAULT_SORT) {
        queryParams.sort = this.query.sort;
      }

      if (this.query.type != DEFAULT_TYPE) {
        queryParams.type = this.query.type;
      }

      if (this.query.category != DEFAULT_CATEGORY) {
        queryParams.category = this.query.category;
      }

      if (this.query.search) {
        queryParams.search = this.query.search;
      }

      if (this.query.channel != DEFAULT_CHANNEL) {
        queryParams.channel = this.query.channel;
      }

      if (!isEqual(queryParams, this.$router.currentRoute.query)) {
        this.$router.push({ name: 'browse', query: queryParams });

        this.$store.commit('setBack', {
          name: this.$router.currentRoute.name,
          params: this.$router.currentRoute.params,
          query: this.$router.currentRoute.query,
        });
      }
    },
    refresh() {
      this.loading = true;

      const query = { ...this.query };
      // TODO this is a little wonky, find a better user experience
      if (query.search.substring(0, 7) == 'author:') {
        query.author = query.search.replace('author:', '');
        delete query.search;
      }

      api.apps
        .search(query)
        .then((data) => {
          this.apps = data.packages;

          this.totalPages = Math.ceil(data.count / this.query.limit) - 1;
          this.loading = false;
          this.error = false;
        })
        .catch((err) => {
          this.loading = false;
          this.error = true;

          utils.captureException(err);
        });
    },
    debounceRefresh: debounce(function() {
      this.setQueryParams();
      this.refresh();
    }, 300),
    resetPage() {
      this.page = 0;
      this.query.skip = 0;
    },
  },
  computed: mapState(['categories']),
  watch: {
    page() {
      this.query.skip = this.page * this.query.limit;
      this.debounceRefresh();
    },
    'query.sort': function() {
      this.debounceRefresh();
    },
    'query.type': function() {
      this.resetPage();
      this.debounceRefresh();
    },
    'query.category': function() {
      this.resetPage();
      this.debounceRefresh();
    },
    'query.channel': function() {
      this.resetPage();
      this.debounceRefresh();
    },
    'query.search': function() {
      this.resetPage();
      if (this.created) {
        if (this.query.search) {
          this.query.sort = 'relevance';
        }
        else {
          this.query.sort = DEFAULT_SORT;
        }
      }

      this.debounceRefresh();
    },
    $route(to, from) {
      const changed = this.getQueryParams();

      if (to.name != from.name || changed) {
        this.debounceRefresh();
      }

      if (to.name != from.name) {
        this.$emit('updateHead');
      }
    },
    categories() {
      let category = this.category;
      const match = this.categories.find((c) => c.category == this.category);
      if (!match) {
        category = DEFAULT_CATEGORY;
      }

      if (this.category != category) {
        this.category = category;

        this.setQueryParams();
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

.center {
  text-align: center;
}

#category {
  width: 220px;
}

#channel {
  width: 145px;
}

#type {
  width: 120px;
}

#sort-by {
  width: 160px;
}

.p-form__group {
  display: block;
}

.p-matrix__img {
  border-radius: 8px;
  width: 60px;
  height: 60px;
  max-width: 60px;
  max-height: 60px;
  min-width: 60px;
  min-height: 60px;
}

.p-matrix__item {
  position: relative;
}

.types {
  position: absolute;
  top: 0;
  right: 0.2em;
}

.most-rated {
  margin-top: 0;
  position: absolute;
  left: 45px;
  top: 12px;
}

@media (min-width: 620px) {
  .most-rated {
    left: calc(1rem + 45px);
  }

  .p-matrix__item:nth-child(3n+1) .most-rated {
    left: 45px;
  }
}

.filters {
  margin-top: 2px;
}

.filters .p-form__group {
  margin-top: 2px;
}

.filters .p-form__control {
  margin-top: 2px;
}

.more-button {
  padding-top: 0.65em;
  padding-bottom: 0.65em;
  width: 65px;
}

@media screen and (max-width: 768px) {
  #category {
    width: 100%;
  }

  #channel {
    width: 100%;
  }

  #type {
    width: 100%;
  }

  #sort-by {
    width: 100%;
  }
}
</style>
