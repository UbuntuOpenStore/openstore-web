<template>
  <div class="row">
    <div class="p-strip">
      <h1 v-translate>RSS Feeds</h1>

      <h2>
        <a href="/rss/new.xml" v-translate>New Apps</a>
      </h2>

      <h2>
        <a href="/rss/updates.xml" v-translate>Updated Apps</a>
      </h2>
    </div>
  </div>
</template>

<script>
import opengraph from '@/opengraph';

export default {
  name: 'Feeds',
  head: {
    title() {
      return { inner: this.$gettext('Feeds') };
    },
    meta() {
      return opengraph({
        title: `${this.$gettext('Feeds')} - OpenStore`,
      });
    },
  },
};
</script>

<style scoped>
</style>
