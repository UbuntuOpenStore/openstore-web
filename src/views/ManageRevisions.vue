<template>
    <div class="row">
        <div v-if="!loading">
            <h1>
                <router-link :to="{name: 'manage_package', params: {id: app.id}}" title="Back">
                    <i class="fa fa-chevron-left"></i>
                </router-link>

                New Revision for {{app.name}}
            </h1>

            <form class="p-form p-form--stacked">
                <div class="p-form__group">
                    <label for="channel" class="p-form__label">Channel</label>
                    <select id="channel" class="p-form__control" v-model="channel" :disabled="saving">
                        <option value="xenial">Xenial</option>
                        <option value="vivid">Vivid</option>
                        <option value="vivid-xenial">Vivid &amp; Xenial</option>
                    </select>
                    <div class="small text-lightgrey" v-if="channel == 'vivid-xenial'">
                        Only choose "Vivid &amp; Xenial" if your app is qml only
                        or a webapp.
                    </div>
                </div>

                <div class="divider"></div>

                <div class="p-form__group">
                    <label for="file" class="p-form__label">File Upload</label>
                    <input
                        type="file"
                        id="file"
                        class="p-form__control"
                        accept=".click"
                        @change="fileChange($event.target.files)"
                        :disabled="saving"
                    />
                </div>

                <h3>OR</h3>

                <div class="p-form__group">
                    <label for="downloadUrl" class="p-form__label">URL</label>
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
                    Create
                </a>

                <router-link
                    class="p-button--neutral"
                    :to="{name: 'manage_package', params: {id: app.id}}"
                    :disabled="saving"
                >
                    <i class="fa fa-times"></i>
                    Cancel
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
            let title = 'New Revision';
            if (this.app) {
                title = `New Revision ${this.app.name}`;
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
                title: 'Error',
                message: 'An error occured loading your app data',
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

                    let channel = 'Xenial';
                    if (this.channel == 'vivid') {
                        channel = 'Vivid';
                    }
                    else if (this.channel == 'vivid-xenial') {
                        channel = 'Vivid & Xenial';
                    }
                    VueNotifications.success({
                        title: 'Success',
                        message: `New revision for ${channel} was created!`,
                    });

                    this.$router.push({name: 'manage_package', params: {id: this.app.id}});
                }).catch((err) => {
                    let error = 'An unknown error has occured';
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
