<template>
  <div class="reviews row">
    <h4 v-if="reviews && reviews.reviews">
      <span v-translate>Reviews</span>:
    </h4>

    <div class="card-wrapper" v-for="review in reviews.reviews" :key="review.id">
      <div class="p-card">
          <h4 class="p-card__title">
            <svgicon :icon="review.rating.toLowerCase()" width="1em" height="1em" original />

            {{review.author}}
          </h4>
          <p class="p-card__content">{{review.body}}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Reviews',
  props: ['app', 'reviews'],
};
</script>

<style scoped>
.card-wrapper {
  width: 50%;
  padding-right: 1em;
  display: inline-block;
}

.p-card {
  height: 10em;
  overflow-y: scroll;
  overflow-x: hidden;
}

.p-card__title {
  overflow-x: hidden;
  word-break: break-all;
}
</style>
