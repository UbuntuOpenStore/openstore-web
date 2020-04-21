<template>
  <div class="row">
    <div class="p-strip">
      <h1 v-translate>OpenStore Badges</h1>

      <p v-translate>
        Promote your app on the OpenStore! Add these badges to your website,
        code repository, social media, or anywhere on the internet. The badges
        are available in several different languages and in both PNG and SVG
        formats.
      </p>
    </div>

    <badge-select />
  </div>
</template>

<script>
import opengraph from '@/opengraph';

import BadgeSelect from '@/components/BadgeSelect';

export default {
  name: 'Badge',
  components: { BadgeSelect },
  head: {
    title() {
      return { inner: this.$gettext('Badge') };
    },
    meta() {
      return opengraph({
        title: `${this.$gettext('Badge')} - OpenStore`,
      });
    },
  },
};
</script>
