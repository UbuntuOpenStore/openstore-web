<template>
  <span class="rating-row">
    <span v-for="name in order" :key="name" :class="{muted: ratings[name] === 0}" class="rating">
      <svgicon :icon="name.toLowerCase()" width="1.5em" height="1.5em" original />
      <span class="count">{{ratings[name]}}</span>
    </span>
  </span>
</template>

<script>
export default {
  name: 'MostRated',
  props: ['ratings'],
  data() {
    return {
      order: [
        'THUMBS_UP',
        'HAPPY',
        'NEUTRAL',
        'THUMBS_DOWN',
        'BUGGY',
      ],
    };
  },
};
</script>

<style scoped>
.rating .count {
  font-size: 1.5em;
}

.rating svg {
  margin-bottom: -0.25em;
  margin-left: 1em;
  margin-right: 0.25em;
}

.rating.muted {
  opacity: 0.5;
}
</style>
