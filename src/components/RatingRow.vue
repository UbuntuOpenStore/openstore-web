<template>
  <span class="rating-row">
    <span v-for="(count, rating) in ratings" :key="rating" :class="{muted: count === 0}" class="rating">
      <svgicon :icon="rating.toLowerCase()" width="1.5em" height="1.5em" original />
      <span class="count">{{count}}</span>
    </span>
  </span>
</template>

<script>
export default {
  name: 'MostRated',
  props: ['ratings'],
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
