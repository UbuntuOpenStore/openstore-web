<template>
    <div class="row">
        <div class="p-strip">
            <h1>Stats</h1>

            <h2 v-if="error" class="center text-red">
                There was an error trying to load the stats, please refresh and try again.
            </h2>

            <div v-if="loading" class="center">
                <i class="fa fa-spinner fa-spin fa-2x"></i>
            </div>
        </div>

        <div v-if="!loading" class="p-strip">
            <h2>App Types</h2>
            <table>
                <thead>
                    <tr>
                        <th>App Type</th>
                        <th class="align-right">Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(count, name) in types" v-if="name != 'push'" :key="name">
                        <td>
                            {{humanType(name)}}
                        </td>
                        <td class="align-right">
                            {{count}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="!loading" class="p-strip">
            <h2>Categories</h2>
            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th class="align-right">Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(count, name) in categories" :key="name">
                        <td>
                            {{name || 'Uncategorized'}}
                        </td>
                        <td class="align-right">
                            {{count}}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import api from '@/api';
import opengraph from '@/opengraph';

export default {
    name: 'Stats',
    head: {
        title: {inner: 'Stats'},
        meta: function() {
            return opengraph({
                title: 'Stats - OpenStore',
            });
        },
    },
    data() {
        return {
            categories: [],
            types: [],
            loading: false,
            error: false,
        };
    },
    created() {
        this.loading = true;
        api.apps.stats().then((stats) => {
            this.loading = false;

            this.categories = stats.categories;
            this.types = stats.types;
        }).catch(() => {
            this.loading = false;
            this.error = true;
        });
    },
    methods: {
        humanType(type) {
            /* eslint-disable arrow-body-style */
            return type.replace('webapp', 'web app').replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        },
    },
};
</script>

<style scoped>
.align-right {
    text-align: right;
}
</style>
