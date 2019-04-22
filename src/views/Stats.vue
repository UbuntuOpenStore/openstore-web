<template>
    <div class="row">
        <div class="p-strip">
            <h1 v-translate>Stats</h1>

            <h2 v-if="error" class="center text-red" v-translate>
                There was an error trying to load the stats, please refresh and try again.
            </h2>

            <div v-if="loading" class="center">
                <i class="fa fa-spinner fa-spin fa-2x"></i>
            </div>
        </div>

        <div v-if="!loading" class="p-strip">
            <h2 v-translate>App Types</h2>
            <table>
                <thead>
                    <tr>
                        <th v-translate>App Type</th>
                        <th class="align-right" v-translate>Count</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(count, name) in types" v-if="name != 'push'" :key="name">
                        <td>
                            {{humanTypeLabel[name]}}
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
                            {{name || uncategorized}}
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
import utils from '@/utils';

export default {
    name: 'Stats',
    head: {
        title: function() {
            return {inner: this.$gettext('Stats')};
        },
        meta: function() {
            return opengraph({
                title: `${this.$gettext('Stats')} - OpenStore`,
            });
        },
    },
    data() {
        return {
            categories: [],
            types: [],
            loading: false,
            error: false,
            uncategorized: this.$gettext('Uncategorized'),
            humanTypeLabel: {
                app: this.$gettext('App'),
                scope: this.$gettext('Scope'),
                webapp: this.$gettext('Web App'),
                'webapp+': this.$gettext('Web App+'),
            },
        };
    },
    created() {
        this.loading = true;
        api.apps.stats().then((stats) => {
            this.loading = false;

            this.categories = stats.categories;
            this.types = stats.types;
        }).catch((err) => {
            this.loading = false;
            this.error = true;

            utils.captureException(err);
        });
    },
};
</script>

<style scoped>
.align-right {
    text-align: right;
}
</style>
