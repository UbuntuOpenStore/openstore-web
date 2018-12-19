<template>
    <div class="row">
        <div v-if="user">
            <h1 class="center">Welcome {{user.name}}!</h1>

            <div class="u-float-right buttons">
                <router-link :to="{name: 'submit'}" class="p-button--positive">
                    <i class="fa fa-plus"></i>
                    <span class="ml" v-translate>Submit App</span>
                </router-link>

                <button class="p-button--neutral u-float-right" @click="showApikey = !showApikey">
                    <span v-translate>API Key</span>
                </button>

                <p v-if="showApikey">
                    <span v-translate>Keep your api key private!</span>
                    <br/>
                    {{user.apikey}}
                </p>
            </div>


            <form class="p-form p-form--inline" v-on:submit.prevent>
                <div class="p-form__group">
                    <label for="search" class="p-form__label" v-translate>Search</label>
                    <input type="text" id="search" class="p-form__control" v-model="query.search" />
                </div>
            </form>

            <h2 v-if="error" class="center text-red" v-translate>
                There was an error trying to load the app list, please refresh and try again.
            </h2>

            <div v-if="loading" class="center">
                <i class="fa fa-spinner fa-spin fa-2x"></i>
            </div>

            <div class="row" v-if="!loading">
                <table>
                    <thead>
                        <tr>
                            <!-- TODO sorting -->
                            <th class="icon-cell" v-translate>Icon</th>
                            <th class="u-hide--small" v-translate>Name</th>
                            <th class="u-show--small u-hide" v-translate>App</th>
                            <th v-if="user.role == 'admin'" v-translate>Author</th>
                            <th class="u-hide--small" v-translate>Status</th>
                            <th class="u-hide--small" v-translate>Version</th>
                            <th class="u-hide--small" v-translate>Downloads</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in apps" :key="app.id">
                            <td class="icon-cell">
                                <router-link :to="{name: 'manage_package', params: {id: app.id}}">
                                    <img :src="app.icon" :alt="app.name" class="icon" />
                                </router-link>
                            </td>
                            <td class="u-hide--small">
                                <router-link :to="{name: 'manage_package', params: {id: app.id}}">
                                    {{app.name}}
                                </router-link>
                            </td>
                            <td class="u-show--small u-hide">
                                <router-link :to="{name: 'manage_package', params: {id: app.id}}">
                                    {{app.name}} v{{app.version}}
                                </router-link>
                                <br/>
                                <span v-translate>Downloads</span>: {{app.totalDownloads || 'None'}}
                            </td>
                            <td v-if="user.role == 'admin'">{{app.author}}</td>
                            <td class="u-hide--small">
                                <span v-if="app.published" class="text-green" v-translate>Published</span>
                                <span v-else class="text-lightgrey" v-translate>Not published</span>
                            </td>
                            <td class="u-hide--small">{{app.version}}</td>
                            <td class="u-hide--small">
                                <span v-if="app.totalDownloads > 0">{{app.totalDownloads}}</span>
                                <span v-if="app.totalDownloads == 0" v-translate>None</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <h3 v-if="apps.length === 0 && !error" class="center">
                    <span v-translate>No apps found.</span>
                    <span v-if="query.search" v-translate>Try searching for something else</span>
                </h3>
            </div>

            <div class="row center" v-if="paging.total > 1">
                <!-- TODO make this a shared component -->
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
    </div>
</template>

<script>
import debounce from 'debounce';

import api from '@/api';
import opengraph from '@/opengraph';

export default {
    name: 'Manage',
    head: {
        title: function() {
            return {inner: this.$gettext('Manage Apps')};
        },
        meta: function() {
            return opengraph({
                title: `${this.$gettext('Manage')} - OpenStore`,
            });
        },
    },
    data() {
        return {
            user: null,
            query: {
                limit: 30,
                skip: 0,
                search: '',
                sort: 'relevance',
            },
            page: 0,
            paging: {
                total: 0,
                pages: [],
            },
            apps: [],
            loading: false,
            error: false,
            showApikey: false,
            firstPageTitle: this.$gettext('Jump to the first page'),
            backPageTitle: this.$gettext('Go back a page'),
            nextPageTitle: this.$gettext('Go to the next page'),
            lastPageTitle: this.$gettext('Jump to the last page'),
        };
    },
    created() {
        api.auth.me().then((user) => {
            if (user) {
                this.user = user;
                this.debounceRefresh();
            }
            else {
                this.$router.push({name: 'login'});
            }
        });
    },
    methods: {
        refresh() {
            this.loading = true;
            api.manage.search(this.query, this.user.apikey).then((data) => {
                this.apps = data.packages;

                // TODO share this code with the Browse view
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
            }).catch(() => {
                this.loading = false;
                this.error = true;
            });
        },
        debounceRefresh: debounce(function() {
            this.refresh();
        }, 300),
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
    watch: {
        'query.search': function() {
            this.debounceRefresh();
        },
    },
};
</script>

<style scoped>
    h1 {
        margin-top: 2px;
    }

    .icon-cell {
        min-width: 4em;
    }

    .icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
    }

    /* TODO share this with the Browse view */
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

    @media screen and (max-width: 768px) {
        .u-show--small {
            display: table-cell !important;
        }

        .buttons {
            width: 100%;
            margin-bottom: 1em;
        }
    }
</style>
