<template>
  <div class="row center" v-if="total >= 1">
    <ul class="pagination">
      <li :class="{disabled: value <= 0}" class="u-hide--small" :title="firstPageTitle">
        <a @click="setPage(0)">
          <svgicon icon="double-back" width="0.75em" height="0.75em" color="#007aa6" />
        </a>
      </li>

      <li :class="{disabled: value <= 0}" :title="backPageTitle">
        <a @click="setPage(value - 1)">
          <svgicon icon="back" width="0.75em" height="0.75em" color="#007aa6" />
        </a>
      </li>

      <li
        v-for="(p, index) in pages"
        :class="{active: value === p, 'u-hide--small': index > 2}"
        :key="p"
      >
        <a @click="setPage(p)">{{p + 1}}</a>
      </li>

      <li :class="{disabled: value >= total}" :title="nextPageTitle">
        <a @click="setPage(value + 1)">
          <svgicon icon="next" width="0.75em" height="0.75em" color="#007aa6" />
        </a>
      </li>

      <li :class="{disabled: value >= total}" class="u-hide--small" :title="lastPageTitle">
        <a @click="setPage(total)">
          <svgicon icon="double-next" width="0.75em" height="0.75em" color="#007aa6" />
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Pagination',
  props: ['total', 'value'],
  data() {
    return {
      firstPageTitle: this.$gettext('Jump to the first page'),
      backPageTitle: this.$gettext('Go back a page'),
      nextPageTitle: this.$gettext('Go to the next page'),
      lastPageTitle: this.$gettext('Jump to the last page'),
    };
  },
  methods: {
    setPage(page) {
      let actualPage = page;
      if (actualPage < 0) {
        actualPage = 0;
      }
      else if (actualPage > this.total) {
        actualPage = this.total;
      }

      if (this.value !== actualPage) {
        this.$emit('input', actualPage);
      }
    },
  },
  computed: {
    pages() {
      let first = this.value - 2;
      let last = this.value + 2;

      if (first < 0) {
        last += Math.abs(first);
        first = 0;
      }

      if (last > this.total) {
        first -= last - this.total;
        if (first < 0) {
          first = 0;
        }

        last = this.total;
      }

      const pages = [];
      for (let i = first; i <= last; i++) {
        pages.push(i);
      }

      return pages;
    },
  },
};
</script>

<style scoped>
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
</style>
