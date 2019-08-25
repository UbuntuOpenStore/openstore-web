<template>
    <div>
        <div class="p-strip">
            <h1 v-translate>Ubuntu Touch Apps</h1>
        </div>

        <div class="row filters">
            <form class="p-form p-form--inline" @submit.prevent>
                <div class="p-form__group">
                    <label for="search" class="p-form__label" v-translate>Search</label>
                    <input type="text" id="search" class="p-form__control" :value="query.search" @input="query.search = $event.target.value" />
                </div>

                <div class="p-form__group">
                    <label for="category" class="p-form__label" v-translate>Category</label>
                    <select id="category" class="p-form__control" v-model="query.category">
                        <option value="" v-translate>All Categories</option>
                        <option
                            v-for="category in categories"
                            :value="category.category"
                            :key="category.category"
                        >
                            {{category.translation}}
                        </option>
                    </select>
                    <!--TODO make this a fancy dropdown with our icons-->
                </div>

                <div class="p-form__group">
                    <label for="type" class="p-form__label" v-translate>Type</label>
                    <select id="type" class="p-form__control" v-model="query.type">
                        <option value="" v-translate>All Types</option>
                        <option value="app" v-translate>Apps</option>
                        <option value="webapp" v-translate>Web Apps</option>
                        <option value="scope" v-translate>Scopes</option>
                    </select>
                </div>

                <div class="p-form__group">
                    <label for="sort-by" class="p-form__label" v-translate>Sort By</label>
                    <select id="sort-by" class="p-form__control" v-model="query.sort">
                        <option value="relevance" v-translate>Relevance</option>
                        <option value="name" v-translate>Title (A-Z)</option>
                        <option value="-name" v-translate>Title (Z-A)</option>
                        <option value="-published_date" v-translate>Newest</option>
                        <option value="published_date" v-translate>Oldest</option>
                        <option value="-updated_date" v-translate>Latest Update</option>
                        <option value="updated_date" v-translate>Oldest Update</option>
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

        <h2 v-if="error" class="center text-red" v-translate>
            There was an error trying to load the app list, please refresh and try again.
        </h2>

        <div v-if="loading" class="center">
            <i class="fa fa-spinner fa-spin fa-2x"></i>
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

                    <div class="p-matrix__content">
                        <h3 class="p-matrix__title">
                            <router-link class="p-matrix__link" :to="{name: 'app', params: {id: app.id}}">{{app.name}}</router-link>
                        </h3>

                        <p class="p-matrix__desc" v-if="app.nsfw" v-translate>
                            NSFW content
                        </p>
                        <p class="p-matrix__desc" v-else>
                            {{app.tagline}}
                        </p>
                    </div>
                </li>
            </ul>

            <h3 v-if="apps.length === 0 && !error" class="center">
                <span v-translate>No apps found.</span>
                <span v-if="query.search" v-translate>Try searching for something else</span>
            </h3>
        </div>

        <!-- TODO https://css-tricks.com/creating-a-reusable-pagination-component-in-vue/ -->
        <div class="row center" v-if="paging.total >= 1">
            <ul class="pagination">
                <li :class="{disabled: page <= 0}" class="u-hide--small" :title="firstPageTitle">
                    <a @click="setPage(0)">
                        <i class="fa fa-angle-double-left"></i>
                    </a>
                </li>

                <li :class="{disabled: page <= 0}" :title="backPageTitle">
                    <a @click="setPage(page - 1)">
                        <i class="fa fa-angle-left"></i>
                    </a>
                </li>

                <li v-for="(p, index) in paging.pages" :class="{active: page == p, 'u-hide--small': index > 2}" :key="p">
                    <a @click="setPage(p)">{{p + 1}}</a>
                </li>

                <li :class="{disabled: page >= paging.total}" :title="nextPageTitle">
                    <a @click="setPage(page + 1)">
                        <i class="fa fa-angle-right"></i>
                    </a>
                </li>

                <li :class="{disabled: page >= paging.total}" class="u-hide--small" :title="lastPageTitle">
                    <a @click="setPage(paging.total)">
                        <i class="fa fa-angle-double-right"></i>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import {mapState} from 'vuex';
import debounce from 'debounce';

import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';
import Types from '@/components/Types';

const DEFAULT_SORT = '-published_date';
const DEFAULT_TYPE = '';
const DEFAULT_CATEGORY = '';

export default {
    name: 'Browse',
    components: {
        types: Types,
    },
    head: {
        title: function() {
            return {inner: this.$gettext('Browse Apps')};
        },
        meta: function() {
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
            },
            page: 0,
            paging: {
                total: 0,
                pages: [],
            },
            apps: [],
            loading: false,
            error: false,
            firstPageTitle: this.$gettext('Jump to the first page'),
            backPageTitle: this.$gettext('Go back a page'),
            nextPageTitle: this.$gettext('Go to the next page'),
            lastPageTitle: this.$gettext('Jump to the last page'),
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
                let sort = this.$route.query.sort ? this.$route.query.sort : DEFAULT_SORT;

                if (sort != this.query.sort) {
                    this.query.sort = sort;
                    changed = true;
                }
            }

            if (this.$route.query.type != this.query.type) {
                let type = this.$route.query.type ? this.$route.query.type : DEFAULT_TYPE;

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

            if (this.$route.query.search != this.query.search) {
                let search = this.$route.query.search ? this.$route.query.search : '';
                if (search != this.query.search) {
                    this.query.search = search;
                    this.query.sort = 'relevance';
                    changed = true;
                }
            }

            return changed;
        },
        setQueryParams() {
            let params = {};
            if (this.page !== 0) {
                params.page = this.page + 1;
            }

            if (this.query.sort != DEFAULT_SORT) {
                params.sort = this.query.sort;
            }

            if (this.query.type != DEFAULT_TYPE) {
                params.type = this.query.type;
            }

            if (this.query.category != DEFAULT_CATEGORY) {
                params.category = this.query.category;
            }

            if (this.query.search) {
                params.search = this.query.search;
            }

            this.$router.push({name: 'browse', query: params});

            this.$store.commit('setBack', {
                name: this.$router.currentRoute.name,
                params: this.$router.currentRoute.params,
                query: this.$router.currentRoute.query,
            });
        },
        refresh() {
            this.loading = true;

            let query = Object.assign({}, this.query);
            // TODO this is a little wonky, find a better user experience
            if (query.search.substring(0, 7) == 'author:') {
                query.author = query.search.replace('author:', '');
                delete query.search;
            }

            api.apps.search(query).then((data) => {
                this.apps = data.packages;

                this.paging.total = Math.ceil(data.count / this.query.limit) - 1;
                let first = this.page - 2;
                let last = this.page + 2;

                if (first < 0) {
                    last += Math.abs(first);
                    first = 0;
                }

                if (last > this.paging.total) {
                    first -= (last - this.paging.total);
                    if (first < 0) {
                        first = 0;
                    }

                    last = this.paging.total;
                }

                let pages = [];
                for (let i = first; i <= last; i++) {
                    pages.push(i);
                }

                this.paging.pages = pages;
                this.loading = false;
                this.error = false;
            }).catch((err) => {
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
        setPage(page) {
            if (page < 0) {
                page = 0;
            }
            else if (page > (this.paging.total)) {
                page = this.paging.total;
            }

            if (this.page != page) {
                this.page = page;
                this.query.skip = page * this.query.limit;

                this.debounceRefresh();
            }
        },
    },
    computed: mapState(['categories']),
    watch: {
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
        'query.search': function() {
            this.resetPage();
            if (this.query.search) {
                this.query.sort = 'relevance';
            }
            else {
                this.query.sort = DEFAULT_SORT;
            }

            this.debounceRefresh();
        },
        $route: function(to, from) {
            let changed = this.getQueryParams();

            if (to.name != from.name || changed) {
                this.debounceRefresh();
            }

            if (to.name != from.name) {
                this.$emit('updateHead');
            }
        },
        categories() {
            let category = this.category;
            let match = this.categories.reduce((c) => (c.category == this.category));
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

        #type {
            width: 100%;
        }

        #sort-by {
            width: 100%;
        }
    }
</style>
