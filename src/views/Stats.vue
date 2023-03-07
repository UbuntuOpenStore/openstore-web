<template>
  <div class="row">
    <div class="p-strip">
      <h1 v-translate>Stats</h1>

      <h2
        v-if="error"
        class="center text-red"
        v-translate
      >There was an error trying to load the stats, please refresh and try again.</h2>

      <div v-if="loading" class="center loading">
        <svgicon class="spin" icon="spinner" width="3em" height="3em" color="#007aa6" />
      </div>
    </div>

    <div v-if="!loading" class="p-strip">
      <h2 v-translate>App Types</h2>
      <table>
        <thead>
          <tr>
            <th v-translate>App Type</th>
            <th class="align-right" v-translate>Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(count, name) in filteredTypes" :key="name">
            <td>{{humanTypeLabel[name]}}</td>
            <td class="align-right">{{count | number}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading" class="p-strip">
      <h2>Categories</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th class="align-right">Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(count, name) in categories" :key="name">
            <td>{{name || uncategorized}}</td>
            <td class="align-right">{{count | number}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading" class="p-strip">
      <h2>Frameworks</h2>
      <table>
        <thead>
          <tr>
            <th>Framework</th>
            <th class="align-right">Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(count, name) in frameworks" :key="name">
            <td>{{name}}</td>
            <td class="align-right">{{count | number}}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading" class="p-strip">
      <h2>Architectures</h2>
      <table>
        <thead>
          <tr>
            <th>Architecture</th>
            <th class="align-right">Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(count, name) in architectures" :key="name">
            <td>{{name}}</td>
            <td class="align-right">{{count | number}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';

export default {
  name: 'Stats',
  head: {
    title() {
      return { inner: this.$gettext('Stats') };
    },
    meta() {
      return opengraph({
        title: `${this.$gettext('Stats')} - OpenStore`,
      });
    },
  },
  data() {
    return {
      categories: [],
      types: {},
      frameworks: {},
      architectures: {},
      loading: false,
      error: false,
      uncategorized: this.$gettext('Uncategorized'),
      humanTypeLabel: {
        app: this.$gettext('App'),
        webapp: this.$gettext('Bookmark'),
        'webapp+': this.$gettext('Web App'),
      },
    };
  },
  created() {
    this.loading = true;
    api.apps
      .stats()
      .then((stats) => {
        this.loading = false;

        this.categories = stats.categories;
        this.types = stats.types;
        delete this.types.push;
        this.frameworks = stats.frameworks;
        this.architectures = stats.architectures;
      })
      .catch((err) => {
        this.loading = false;
        this.error = true;

        utils.captureException(err);
      });
  },
  computed: {
    filteredTypes() {
      // Filter out deprecated types
      return Object.keys(this.types).reduce((acc, type) => {
        if (this.humanTypeLabel[type]) {
          return {
            ...acc,
            [type]: this.types[type],
          };
        }

        return acc;
      }, {});
    },
  },
};
</script>

<style scoped>
.align-right {
  text-align: right;
}
</style>
