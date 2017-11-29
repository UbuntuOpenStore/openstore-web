<template>
    <div class="row">
        <div v-if="user">
            <h1 class="center">Welcome {{user.name}}!</h1>

            <router-link :to="{name: 'submit'}" class="p-button--positive u-float-right">
                <i class="fa fa-plus"></i>
                Submit App
            </router-link>

            <form class="p-form p-form--inline">
                <div class="p-form__group">
                    <label for="search" class="p-form__label">Search</label>
                    <input type="text" id="search" class="p-form__control" @input="updateSearch" :value="query.search" />
                </div>
            </form>

            <h2 v-if="error" class="center text-red">
                There was an error trying to load the app list, please refresh and try again.
            </h2>

            <div v-if="loading" class="center">
                <i class="fa fa-spinner fa-spin fa-2x"></i>
            </div>

            <!-- TODO search -->
            <div class="row" v-if="!loading">
                <!-- TODO mobile friendly -->
                <table>
                    <thead>
                        <tr>
                            <!-- TODO sorting -->
                            <th>Icon</th>
                            <th>Name</th>
                            <th v-if="user.role == 'admin'">Author</th>
                            <th>Status</th>
                            <th>Version</th>
                            <th>Downloads</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="app in apps">
                            <td>
                                <img :src="app.icon" :alt="app.name" class="icon" />
                            </td>
                            <td>{{app.name}}</td>
                            <td v-if="user.role == 'admin'">{{app.author}}</td>
                            <td>
                                <span v-if="app.published" class="text-green">Published</span>
                                <span v-else class="text-lightgrey">Not published</span>
                            </td>
                            <td>{{app.version}}</td>
                            <td>{{app.totalDownloads || 'None'}}</td>
                        </tr>
                    </tbody>
                </table>

                <h3 v-if="apps.length === 0 && !error" class="center">
                    No apps found.
                    <span v-if="query.search">Try searching for something else</span>
                </h3>
            </div>

            <div class="row center" v-if="paging.total > 1">
                <!-- TODO make this a shared component -->
                <ul class="pagination">
                    <li :class="{disabled: page <= 0}" title="Jump to the first page">
                        <a @click="setPage(0)">
                            <i class="fa fa-angle-double-left"></i>
                        </a>
                    </li>

                    <li :class="{disabled: page <= 0}" title="Go back a page">
                        <a @click="setPage(page - 1)">
                            <i class="fa fa-angle-left"></i>
                        </a>
                    </li>

                    <li v-for="p in paging.pages" :class="{active: page == p}">
                        <a @click="setPage(p)">{{p + 1}}</a>
                    </li>

                    <li :class="{disabled: page >= paging.total}" title="Go to the next page">
                        <a @click="setPage(page + 1)">
                            <i class="fa fa-angle-right"></i>
                        </a>
                    </li>

                    <li :class="{disabled: page >= paging.total}" title="Jump to the last page">
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

export default {
    name: 'Manage',
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
        };
    },
    created() {
        api.auth.me().then((user) => {
            if (user) {
                this.user = user;
                this.refresh();
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
        updateSearch: debounce(function(e) {
            this.query.search = e.target.value;
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

                this.refresh();
            }
        },
    },
};
</script>

<style scoped>
    .icon {
        width: 32px;
        height: 32px;
        border-radius: 6px;
    }

    /* TODO share this with the Browse view */
    .pagination {
        display: inline-block;
        padding-left: 0;
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
