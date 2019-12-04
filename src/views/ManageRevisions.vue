<template>
    <div class="row">
        <div v-if="!loading">
            <h1>
                <router-link :to="{name: 'manage_package', params: {id: app.id}}" title="Back">
                    <i class="fa fa-chevron-left"></i>
                </router-link>

                <translate class="ml" :translate-params="{name: app.name}">New Revision for %{name}</translate>
            </h1>


            <form class="p-form p-form--stacked">
                <div class="p-form__group">
                    <label class="p-form__label" v-translate>Upload Revision via:</label>
                    <button
                        id="switch-on"
                        class="p-switch"
                        type="button"
                        role="switch"
                        :aria-checked="fileUpload"
                        @click="fileUpload = !fileUpload"
                    >
                        <span v-translate>File</span>
                        <span v-translate>URL</span>
                    </button>
                </div>

                <!--
                <div class="p-form__group">
                    <label for="channel" class="p-form__label" v-translate>Channel</label>
                    <select id="channel" class="p-form__control" v-model="channel" :disabled="saving">
                        <option value="xenial" v-translate>Xenial</option>
                    </select>
                </div>
                -->

                <div class="divider"></div>

                <div v-for="revision in revisions" :key="revision.key">
                    <div class="p-form__group" v-if="fileUpload">
                        <label class="p-form__label" v-translate>File Upload</label>
                        <input
                            type="file"
                            class="p-form__control file"
                            accept=".click"
                            @change="fileChange(revision, $event.target.files)"
                            :disabled="saving"
                        />
                    </div>
                    <div class="p-form__group" v-else>
                        <label class="p-form__label" v-translate>URL</label>
                        <input
                            type="text"
                            class="p-form__control"
                            :disabled="saving"
                            v-model="revision.downloadUrl"
                        />
                        <p class="small text-lightgrey" v-translate>URL of App from the Web</p>
                    </div>
                </div>

                <div class="p-form__group" v-if="canAdd">
                    <label class="p-form__label" v-translate>Add Another Architecture</label>
                    <a class="p-button--positive" @click="addRevision()">Add</a>
                </div>

                <div class="divider"></div>

                <div class="p-form__group">
                    <label for="changelog" class="p-form__label" v-translate>Changelog</label>
                    <textarea id="changelog" rows="4" class="p-form__control" :disabled="saving" v-model="changelog"></textarea>
                    <p class="small text-lightgrey" v-translate>This will be added to the beginning of your current changelog</p>
                </div>

                <a class="p-button--positive" @click="save()" :disabled="saving || !canCreate">
                    <i class="fa" :class="{'fa-save': !saving, 'fa-spinner fa-spin': saving}"></i>
                    <span class="ml" v-translate>Create</span>
                </a>

                <router-link
                    class="p-button--neutral"
                    :to="{name: 'manage_package', params: {id: app.id}}"
                    :disabled="saving"
                >
                    <i class="fa fa-times"></i>
                    <span class="ml" v-translate>Cancel</span>
                </router-link>
            </form>
        </div>
    </div>
</template>

<script>
import VueNotifications from 'vue-notifications';
import {mapState} from 'vuex';

import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';

function newRevision() {
    return {
        key: Math.random(),
        file: null,
        downloadUrl: null,
    };
}

export default {
    name: 'ManageRevisions',
    head: {
        title: function() {
            let title = this.$gettext('New Revision');
            if (this.app) {
                title = `${this.$gettext('New Revision')} ${this.app.name}`;
            }

            return {inner: title};
        },
        meta: function() {
            let data = {};
            if (this.app) {
                data = {
                    title: `${this.app.name} - OpenStore`,
                    description: this.app.tagline,
                    image: this.app.icon,
                };
            }

            return opengraph(data);
        },
    },
    data() {
        return {
            app: {},
            channel: 'xenial',
            loading: false,
            saving: false,
            changelog: '',
            fileUpload: true,
            revisions: [newRevision()],
        };
    },
    created() {
        this.loading = true;

        if (this.isAuthenticated) {
            this.getApp();
        }
    },
    methods: {
        async getApp() {
            this.loading = true;
            try {
                // TODO cache this so it only needs to be gotten once between this an ManagePackage
                this.app = await api.manage.get(this.$route.params.id, this.user.apikey);

                this.$emit('updateHead');
            }
            catch (err) {
                VueNotifications.error({
                    title: this.$gettext('Error'),
                    message: this.$gettext('An error occured loading your app data'),
                });

                utils.captureException(err);
            }

            this.loading = false;
        },
        addRevision() {
            this.revisions.push(newRevision());
        },
        fileChange(revision, files) {
            if (files.length > 0) {
                revision.file = files[0];
            }
            else {
                revision.file = null;
            }
        },
        async save() {
            if (!this.saving && this.canCreate) {
                this.saving = true;

                let first = true;
                /* eslint-disable no-await-in-loop */
                for (let i = 0; i < this.revisions.length; i++) {
                    let revision = this.revisions[i];
                    let updateData = new FormData();

                    if (revision.file) {
                        updateData.append('file', revision.file, revision.file.name);
                    }
                    else if (revision.downloadUrl) {
                        updateData.append('downloadUrl', revision.downloadUrl);
                    }
                    else {
                        continue;
                    }

                    updateData.append('channel', 'xenial');

                    if (first) {
                        updateData.append('changelog', this.changelog);
                        first = false;
                    }

                    try {
                        await api.manage.revision(this.app.id, updateData, this.user.apikey);
                    }
                    catch (err) {
                        let error = this.$gettext('An unknown error has occured');
                        if (err.response && err.response.data && err.response.data.message) {
                            error = err.response.data.message;
                        }

                        this.saving = false;
                        VueNotifications.error({
                            title: 'Error',
                            message: error,
                        });

                        utils.captureException(err);

                        return;
                    }
                }

                this.saving = false;

                let channel = this.$gettext('Xenial');
                let message = this.$gettext('New revision for %{channel} was created!').replace('%{channel}', channel);
                if (this.revisions.length > 0) {
                    message = this.$gettext('New revisions for %{channel} were created!').replace('%{channel}', channel);
                }

                VueNotifications.success({
                    title: this.$gettext('Success'),
                    message: message,
                });

                this.$router.push({name: 'manage_package', params: {id: this.app.id}});
            }
        },
    },
    computed: {
        ...mapState(['user', 'isAuthenticated']),
        canAdd() {
            return this.revisions.length < 3;
        },
        canCreate() {
            return this.revisions.filter((revision) => (revision.file || revision.downloadUrl)).length > 0;
        },
    },
    watch: {
        isAuthenticated(newValue) {
            if (newValue) {
                this.getApp();
            }
        },
    },
};
</script>

<style scoped>
.divider {
    border-top: 1px solid #cdcdcd;
}

.small {
    float: right;
    text-align: right;
    width: 100%;
    margin-top: 1em;
}
</style>
