<template>
  <div class="most-rated" v-if="rating">
    <svgicon :icon="rating" width="1em" height="1em" original></svgicon>
  </div>
</template>

<script>
export default {
  name: 'MostRated',
  props: ['ratings'],
  computed: {
    rating() {
      const positive = this.ratings.HAPPY + this.ratings.THUMBS_UP;
      const negative = this.ratings.BUGGY + this.ratings.THUMBS_DOWN;
      const neutral = this.ratings.NEUTRAL;

      if (positive + negative + neutral === 0) {
        return '';
      }

      /*
        NEUTRAL: if neutral > positive && neutral > negative
        or positive > negative && positive < (negative + 20%):
      */
      if (neutral > Math.max(negative, positive) || ((positive >= negative) && (positive < (negative * 1.2)))) {
        return 'neutral-full';
      }

      if (negative > positive) {
        if (this.ratings.BUGGY > this.ratings.THUMBS_DOWN) {
          return 'buggy-full';
        }

        return 'thumbs_down-full';
      }

      if (this.ratings.HAPPY > this.ratings.THUMBS_UP) {
        return 'happy-full';
      }

      return 'thumbs_up-full';
    },
  },
};
</script>

<style scoped>
.most-rated {
  border-radius: 4px;
  border: #111111 1px solid;
  background-color: #ffffff;

  line-height: 1;
  padding: 0.1em 0.1em 0 0.1em;
}
</style>
