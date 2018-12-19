<template>
    <div class="row">
        <div v-if="!loading">
            <h1>
                <router-link :to="{name: 'manage_package', params: {id: app.id}}" title="Back">
                    <i class="fa fa-chevron-left"></i>
                </router-link>

                <translate :translate-params="{name: app.name}">New Revision for %{name}</translate>
            </h1>

            <form class="p-form p-form--stacked">
                <div class="p-form__group">
                    <label for="channel" class="p-form__label" v-translate>Channel</label>
                    <select id="channel" class="p-form__control" v-model="channel" :disabled="saving">
                        <option value="xenial" v-translate>Xenial</option>
                        <option value="vivid" v-translate>Vivid</option>
                        <option value="vivid-xenial" v-translate>Vivid and Xenial</option>
                    </select>
                    <div class="small text-lightgrey" v-if="channel == 'vivid-xenial'" v-translate>
                        Only choose "Vivid and Xenial" if your app is qml only or a webapp.
                    </div>
                </div>

                <div class="divider"></div>

                <div class="p-form__group">
                    <label for="file" class="p-form__label" v-translate>File Upload</label>
                    <input
                        type="file"
                        id="file"
                        class="p-form__control"
                        accept=".click"
                        @change="fileChange($event.target.files)"
                        :disabled="saving"
                    />
                </div>

                <h3 v-translate>OR</h3>

                <div class="p-form__group">
                    <label for="downloadUrl" class="p-form__label" v-translate>URL</label>
                    <input
                        type="text"
                        id="downloadUrl"
                        class="p-form__control"
                        placeholder="URL of App from the Web"
                        :disabled="saving"
                        v-model="downloadUrl"
                    />
                </div>

                <a class="p-button--positive" @click="save()" :disabled="saving">
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

import api from '@/api';
import opengraph from '@/opengraph';

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
            user: null,
            app: {},
            channel: 'xenial',
            file: null,
            downloadUrl: '',
            loading: false,
            saving: false,
        };
    },
    created() {
        this.loading = true;

        // TODO don't always fetch this
        api.auth.me().then((user) => {
            if (user) {
                this.user = user;
            }
            else {
                this.$router.push({name: 'login'});
            }
        }).then(() => {
            if (this.user) {
                // TODO cache this so it only needs to be gotten once between this an ManagePackage
                return api.manage.get(this.$route.params.id, this.user.apikey);
            }

            return null;
        }).then((data) => {
            this.loading = false;
            if (data) {
                this.app = data;

                this.$emit('updateHead');
            }
        }).catch(() => {
            this.loading = false;
            VueNotifications.error({
                title: this.$gettext('Error'),
                message: this.$gettext('An error occured loading your app data'),
            });
        });
    },
    methods: {
        fileChange(files) {
            if (files.length > 0) {
                [this.file] = files;
            }
            else {
                this.file = null;
            }
        },
        save() {
            if (!this.saving) {
                this.saving = true;

                this.app.published = this.published;
                let updateData = new FormData();

                if (this.file) {
                    updateData.append('file', this.file, this.file.name);
                }
                else {
                    updateData.append('downloadUrl', this.downloadUrl);
                }

                updateData.append('channel', this.channel);

                api.manage.revision(this.app.id, updateData, this.user.apikey).then(() => {
                    this.file = null;
                    document.getElementById('file').value = '';

                    this.saving = false;

                    let channel = this.$gettext('Xenial');
                    if (this.channel == 'vivid') {
                        channel = this.$gettext('Vivid');
                    }
                    else if (this.channel == 'vivid-xenial') {
                        channel = this.$gettext('Vivid & Xenial');
                    }

                    VueNotifications.success({
                        title: this.$gettext('Success'),
                        message: this.$gettext('New revision for %{channel} was created!').replace('%{channel}', channel),
                    });

                    this.$router.push({name: 'manage_package', params: {id: this.app.id}});
                }).catch((err) => {
                    let error = this.$gettext('An unknown error has occured');
                    if (err.response && err.response.data && err.response.data.message) {
                        error = err.response.data.message;
                    }

                    this.saving = false;
                    VueNotifications.error({
                        title: 'Error',
                        message: error,
                    });
                });
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
