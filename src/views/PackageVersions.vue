<template>
  <div class="row package-view">
    <!-- TODO make some shared components between this and Package.vue -->

    <div class="back" v-if="app">
      <router-link :to="{ name: 'app', params: { id: app.id } }">
        <svgicon icon="back" width="0.75em" height="0.75em" color="#007aa6" />
      </router-link>
      <router-link :to="{ name: 'app', params: { id: app.id } }" v-translate>Back</router-link>
    </div>

    <div class="row">
      <h2
        v-if="missing"
        class="center"
        v-translate
      >The app you are looking for has been removed or does not exist</h2>

      <h2
        v-if="error"
        class="center text-red"
        v-translate
      >There was an error trying to find this app, please refresh and try again.</h2>

      <div v-if="loading" class="center loading">
        <svgicon class="spin" icon="spinner" width="3em" height="3em" color="#007aa6" />
      </div>

      <div class="col-6" v-if="app">
        <div class="row">
          <img class="u-float-left icon" :src="app.icon" />
          <types class="u-float-right types" :types="app.types"></types>

          <h1>{{app.name}}</h1>
          <h2>{{app.tagline}}</h2>
          <router-link
            :to="{name: 'browse', query: {search: 'publisher:' + app.publisher}}"
            v-if="app.publisher"
          >{{app.publisher}}</router-link>
        </div>

        <div class="row">
          <div class="center">
            <rating-row :ratings="app.ratings" />
          </div>
        </div>

        <div class="row">
          <ul class="p-list">
            <li class="p-list__item" v-for="(data, version) in revisions" :key="version">
              v{{version}}

              <ul class="p-inline-list--middot ml">
                <li class="p-inline-list__item" v-for="key in Object.keys(data).sort()" :key="key">
                  <a :href="data[key].download_url">
                    {{data[key].channel | titleCase}} - {{data[key].architecture || 'armhf'}}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';
import Types from '@/components/Types.vue';
import RatingRow from '@/components/RatingRow.vue';

export default {
  name: 'PackageVersions',
  components: { Types, RatingRow },
  head: {
    title() {
      return { inner: this.app ? this.app.name : '' };
    },
    meta() {
      let data = {};
      if (this.app) {
        data = {
          title: `${this.app.name} - OpenStore`,
          description: this.app.tagline,
          image: this.app.icon,
        };
      }

      return opengraph(data);
    },
  },
  data() {
    return {
      app: null,
      missing: false,
      error: false,
      loading: false,
    };
  },
  created() {
    this.refresh();
  },
  methods: {
    async refresh() {
      this.loading = true;

      try {
        this.app = await api.apps.get(this.$route.params.id);

        this.$emit('updateHead');
      }
      catch (err) {
        this.loading = false;

        if (err.response && err.response.status) {
          this.missing = true;
        }
        else {
          this.error = true;
        }

        utils.captureException(err);
      }

      this.loading = false;
    },
  },
  computed: {
    revisions() {
      const revisions = this.app ? Array.from(this.app.revisions).reverse() : [];

      return revisions.filter((revisionData) => revisionData.download_url).reduce((acc, current) => {
        const versionData = acc[current.version] ? acc[current.version] : {};
        const key = `${current.architecture}-${current.channel}`;

        return { ...acc, [current.version]: { ...versionData, [key]: current } };
      }, {});
    },
  },
};
</script>
