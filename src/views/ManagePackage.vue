<template>
    <div class="row">
        <div v-if="!loading">
            <h1>
                <router-link :to="{name: 'manage'}" title="Back">
                    <i class="fa fa-chevron-left"></i>
                </router-link>

                <span class="ml" v-translate>Edit</span>
                {{app.name}}
            </h1>

            <div v-if="app.published">
                <router-link :to="{name: 'app', params: {id: app.id}}" target="_blank">
                    <span class="mr" v-translate>Public Link</span>
                    <i class="fa fa-external-link"></i>
                </router-link>
            </div>

            <form class="p-form p-form--stacked">
                <div class="p-form__group">
                    <label for="publish" class="p-form__label" v-translate>Publish</label>
                    <button
                        id="switch-on"
                        class="p-switch"
                        type="button"
                        role="switch"
                        :aria-checked="published"
                        @click="published = !published"
                    >
                        <span v-translate>Yes</span>
                        <span v-translate>No</span>
                    </button>
                </div>

                <router-link class="p-button--positive" :to="{name: 'manage_revisions', params: {id: app.id}}" :disabled="saving">
                    <i class="fa fa-plus"></i>
                    <span class="ml" v-translate>New Revision</span>
                </router-link>

                <nav class="p-tabs">
                    <ul class="p-tabs__list" role="tablist">
                        <li class="p-tabs__item" role="presentation">
                            <a
                                class="p-tabs__link"
                                tabindex="0"
                                role="tab"
                                @click="tab = 'presentation'"
                                :aria-selected="tab == 'presentation'"
                                v-translate
                            >
                                Presentation
                            </a>
                        </li>
                        <li class="p-tabs__item" role="presentation">
                            <a class="p-tabs__link" tabindex="-1" role="tab" @click="tab = 'discovery'" :aria-selected="tab == 'discovery'" v-translate>
                                Discovery
                            </a>
                        </li>
                        <li class="p-tabs__item" role="presentation">
                            <a class="p-tabs__link" tabindex="-1" role="tab" @click="tab = 'info'" :aria-selected="tab == 'info'" v-translate>
                                Info
                            </a>
                        </li>
                        <li class="p-tabs__item" role="presentation">
                            <a class="p-tabs__link" tabindex="-1" role="tab" @click="tab = 'stats'" :aria-selected="tab == 'stats'" v-translate>
                                Stats
                            </a>
                        </li>
                    </ul>
                </nav>

                <div :class="{hidden: tab != 'presentation'}" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label for="name" class="p-form__label" v-translate>Title</label>
                            <input type="text" id="name" class="p-form__control" :disabled="saving" v-model="app.name" />
                        </div>

                        <div class="p-form__group">
                            <label for="tagline" class="p-form__label" v-translate>Tag Line</label>
                            <input type="text" id="tagline" class="p-form__control" :disabled="saving" v-model="app.tagline" />
                        </div>

                        <div class="p-form__group">
                            <label for="description" class="p-form__label" v-translate>Description</label>
                            <textarea
                                id="description"
                                rows="4"
                                class="p-form__control"
                                :disabled="saving"
                                v-model="app.description"
                            ></textarea>
                        </div>

                        <div class="p-form__group">
                            <label for="changelog" class="p-form__label" v-translate>Changelog</label>
                            <textarea id="changelog" rows="4" class="p-form__control" :disabled="saving" v-model="app.changelog"></textarea>
                        </div>

                        <div class="p-form__group">
                            <label for="screenshots" class="p-form__label" v-translate>Screenshots (Limit 5)</label>

                            <div>
                                <input
                                    type="file"
                                    id="screenshots"
                                    class="p-form__control"
                                    accept="image/*"
                                    multiple="multiple"
                                    @change="screenshotFilesChanged($event.target.files)"
                                    :disabled="saving"
                                />

                                <p v-if="app.screenshots && app.screenshots.length > 0" v-translate>
                                    Drag and drop to sort screenshots.
                                </p>

                                <draggable v-model="app.screenshots" class="screenshots">
                                    <div v-for="screenshot in app.screenshots" :key="screenshot" class="screenshot-wrapper">
                                        <a class="screenshot-remove" title="Delete Screenshot" @click="removeScreenshot(screenshot)">
                                            <i class="fa fa-close"></i>
                                        </a>

                                        <img :data-id="screenshot" :src="screenshot" class="screenshot-thumbnail" />
                                    </div>
                                </draggable>
                            </div>
                        </div>
                    </div>
                </div>

                <div :class="{hidden: tab != 'discovery'}" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label for="category" class="p-form__label" v-translate>Category</label>
                            <select type="text" id="category" class="p-form__control" :disabled="saving" v-model="app.category">
                                <option value="" v-translate>Choose a category</option>
                                <option
                                    v-for="category in categories"
                                    :key="category.category"
                                    :value="category.category"
                                >
                                    {{category.translation}}
                                </option>
                                <!--TODO make this a fancy dropdown with our icons-->
                            </select>
                        </div>

                        <div class="p-form__group">
                            <label for="keywords" class="p-form__label" v-translate>Keywords</label>
                            <input type="text" id="keywords" class="p-form__control" :disabled="saving" v-model="app.keywords" />
                            <p class="small text-lightgrey" v-translate>A comma separated list of keywords</p>
                        </div>

                        <div class="p-form__group nsfw">
                            <label for="nsfw" class="p-form__label" v-translate>NSFW</label>
                            <input type="checkbox" id="nsfw" class="p-form__control" :disabled="saving" v-model="app.nsfw" />
                            <div class="small text-lightgrey" v-translate>This app contains NSFW material</div>
                        </div>
                    </div>
                </div>

                <div :class="{hidden: tab != 'info'}" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label for="license" class="p-form__label" v-translate>License</label>
                            <select type="text" id="license" class="p-form__control" :disabled="saving" v-model="app.license">
                                <option value="" v-translate>Choose a license</option>
                                <option value="Proprietary">Proprietary</option>
                                <option value="Apache License">Apache License</option>
                                <option value="BSD License (Simplified)">BSD License (Simplified)</option>
                                <option value="Creative Commons - No Rights Reserved">Creative Commons - No Rights Reserved</option>
                                <option value="GNU Affero GPL v3">GNU Affero GPL v3</option>
                                <option value="GNU GPL v2">GNU GPL v2</option>
                                <option value="GNU GPL v3">GNU GPL v3</option>
                                <option value="GNU LGPL v2.1">GNU LGPL v2.1</option>
                                <option value="GNU LGPL v3" selected="selected">GNU LGPL v3</option>
                                <option value="MIT/X/Expat License">MIT/X/Expat License</option>
                                <option value="Academic Free License">Academic Free License</option>
                                <option value="Artistic License 1.0">Artistic License 1.0</option>
                                <option value="Artistic License 2.0">Artistic License 2.0</option>
                                <option value="Common Public License">Common Public License</option>
                                <option value="Creative Commons - Attribution">Creative Commons - Attribution</option>
                                <option value="Creative Commons - Attribution Share Alike">
                                    Creative Commons - Attribution Share Alike
                                </option>
                                <option value="Eclipse Public License">Eclipse Public License</option>
                                <option value="Educational Community License">Educational Community License</option>
                                <option value="Mozilla Public License">Mozilla Public License</option>
                                <option value="Open Font License v1.1">Open Font License v1.1</option>
                                <option value="Open Software License v3.0">Open Software License v3.0</option>
                                <option value="PHP License">PHP License</option>
                                <option value="Public Domain">Public Domain</option>
                                <option value="Python License">Python License</option>
                                <option value="Zope Public License">Zope Public License</option>
                                <option value="Other Open Source">Other Open Source</option>
                            </select>
                        </div>

                        <div class="p-form__group">
                            <label for="source" class="p-form__label" v-translate>Source URL</label>
                            <input type="text" id="source" class="p-form__control" :disabled="saving" v-model="app.source" />
                        </div>

                        <div class="p-form__group">
                            <label for="support_url" class="p-form__label" v-translate>Support URL</label>
                            <input type="text" id="support_url" class="p-form__control" :disabled="saving" v-model="app.support_url" />
                        </div>

                        <div class="p-form__group">
                            <label for="donate_url" class="p-form__label" v-translate>Donate URL</label>
                            <input type="text" id="donate_url" class="p-form__control" :disabled="saving" v-model="app.donate_url" />
                        </div>

                        <div class="p-form__group">
                            <label for="video_url" class="p-form__label" v-translate>Video URL</label>
                            <input type="text" id="video_url" class="p-form__control" :disabled="saving" v-model="app.video_url" />
                            <div class="small text-lightgrey" v-translate>
                                Only YouTube videos are supported at this time. Make sure the url is for the embedded video!
                            </div>
                        </div>

                        <div class="p-form__group" v-if="user.role == 'admin'">
                            <label for="maintainer" class="p-form__label" v-translate>Maintainer</label>
                            <select type="text" id="maintainer" class="p-form__control" :disabled="saving" v-model="app.maintainer">
                                <option value="" v-translate>Choose a maintainer</option>
                                <option
                                    v-for="user in users"
                                    :key="user._id"
                                    :value="user._id"
                                >{{user.display_name}}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div :class="{hidden: tab != 'stats'}" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label class="p-form__label" v-translate>Package Info</label>
                            <div class="info">
                                <table>
                                    <tbody>
                                        <tr>
                                            <td class="name" v-translate>ID</td>
                                            <td>{{app.id}}</td>
                                        </tr>
                                        <tr>
                                            <td class="name" v-translate>Author</td>
                                            <td>{{app.author}}</td>
                                        </tr>
                                        <tr>
                                            <td class="name" v-translate>Architecture</td>
                                            <td>{{app.architecture}}</td>
                                        </tr>
                                        <tr>
                                            <td class="name" v-translate>Framework</td>
                                            <td>{{app.framework}}</td>
                                        </tr>
                                        <tr>
                                            <td class="name" v-translate>File Size</td>
                                            <td>{{filesize}}</td>
                                        </tr>
                                        <tr>
                                            <td class="name" v-translate>Type</td>
                                            <td>{{app.types.join(', ')}}</td>
                                        </tr>
                                        <tr>
                                            <td class="name" v-translate>Channels</td>
                                            <td>{{app.channels.join(', ')}}</td>
                                        </tr>

                                        <tr class="name" v-if="app.languages.length > 0">
                                            <td v-translate>Translation Languages</td>
                                            <td>{{app.languages.join(', ')}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="p-form__group revisions">
                            <label class="p-form__label" v-translate>Download Stats</label>

                            <div class="downloads">
                                <table>
                                    <thead>
                                        <tr>
                                            <th v-translate>Revision</th>
                                            <th v-translate>Channel</th>
                                            <th v-translate>Version</th>
                                            <th v-translate>Downloads</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr
                                            v-for="revision in revisions"
                                            :class="{
                                                'strong': revision.revision == latestRevision(revision.channel)
                                            }"
                                            :key="revision.revision"
                                        >
                                            <td>{{revision.revision}}</td>
                                            <td>{{revision.channel.charAt(0).toUpperCase()}}{{revision.channel.slice(1)}}</td>
                                            <td>v{{revision.version}}</td>
                                            <td>{{revision.downloads}}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" v-translate>Total</td>
                                            <td>{{app.totalDownloads}}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="p-form__group revisions" v-if="app.published_date">
                            <label class="p-form__label" v-translate>Published Date</label>

                            <div>
                                {{app.published_date.replace('T', ' ').replace('Z', '')}}
                            </div>
                        </div>

                        <div class="p-form__group revisions" v-if="app.updated_date">
                            <label class="p-form__label" v-translate>Updated Date</label>

                            <div>
                                {{app.updated_date.replace('T', ' ').replace('Z', '')}}
                            </div>
                        </div>
                    </div>
                </div>

                <a class="p-button--positive" @click="save()" :disabled="saving">
                    <i class="fa" :class="{'fa-save': !saving, 'fa-spinner fa-spin': saving}"></i>
                    <span class="ml" v-translate>Save</span>
                </a>

                <a class="p-button--negative" :class="{hidden: app.revisions.length > 0}" @click="remove()" :disabled="saving">
                    <i class="fa" :class="{'fa-remove': !saving, 'fa-spinner fa-spin': saving}"></i>
                    <span class="ml" v-translate>Delete</span>
                </a>

                <router-link class="p-button--neutral" :to="{name: 'manage'}" :disabled="saving">
                    <i class="fa fa-times"></i>
                    <span class="ml" v-translate>Cancel</span>
                </router-link>
            </form>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import draggable from 'vuedraggable';
import VueNotifications from 'vue-notifications';

import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';

export default {
    name: 'ManagePackage',
    components: {
        draggable,
    },
    head: {
        title: function() {
            let title = this.$gettext('Manage');
            if (this.app) {
                title = `${this.$gettext('Manage')} ${this.app.name}`;
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
            published: false,
            screenshotFiles: [],
            loading: false,
            saving: false,
            tab: 'presentation',
            users: [],
            sortableOptions: {
                store: {
                    get: () => (this.app.screenshots ? this.app.screenshots : []),
                    set: (sortable) => {
                        this.app.screenshots = sortable.toArray();
                    },
                },
            },
        };
    },
    created() {
        this.loading = true;
        if (this.isAuthenticated) {
            this.getApp();
            this.getUsers();
        }
    },
    methods: {
        async getApp() {
            this.loading = true;

            try {
                let data = await api.manage.get(this.$route.params.id, this.user.apikey);
                if (data) {
                    data.keywords = data.keywords.join(', ');
                    this.app = data;
                    this.published = this.app.published;

                    this.$emit('updateHead');
                }
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
        async getUsers() {
            if (this.user.role == 'admin') {
                try {
                    let users = await api.users.getAll(this.user.apikey);
                    this.users = users;
                }
                catch (err) {
                    console.error(err);
                    VueNotifications.error({
                        title: this.$gettext('Error'),
                        message: this.$gettext('An error occured loading your app data'),
                    });

                    utils.captureException(err);
                }
            }
        },
        screenshotFilesChanged(files) {
            if (files.length > 0) {
                this.screenshotFiles = files;
            }
            else {
                this.screenshotFiles = [];
            }
        },
        removeScreenshot(screenshot) {
            this.app.screenshots = this.app.screenshots.filter((s) => (s != screenshot));
        },
        latestRevision(channel) {
            let revision = -1;
            if (channel == 'vivid') {
                // Don't show anything for vivid any more
                return revision;
            }

            this.app.revisions.filter((data) => (data.channel == channel))
                .forEach((data) => {
                    if (revision < data.revision) {
                        revision = data.revision;
                    }
                });

            return revision;
        },
        save() {
            if (!this.saving) {
                this.saving = true;

                this.app.published = this.published;
                let updateData = {};

                if (this.screenshotFiles.length > 0) {
                    updateData = new FormData();

                    if (this.screenshotFiles.length > 0) {
                        let screenshotLimit = 5 - this.app.screenshots.length;
                        if (this.screenshotFiles.length < screenshotLimit) {
                            screenshotLimit = this.screenshotFiles.length;
                        }

                        for (let i = 0; i < screenshotLimit; i++) {
                            updateData.append(
                                'screenshot_files',
                                this.screenshotFiles[i],
                                this.screenshotFiles[i].name,
                            );
                        }
                    }

                    Object.keys(this.app).forEach((key) => {
                        // Arrays and objects are just extra data send from the api, ignore them
                        if (!Array.isArray(this.app[key]) && typeof this.app[key] !== 'object') {
                            updateData.append(key, this.app[key]);
                        }
                        else if (key == 'screenshots') {
                            updateData.append(key, JSON.stringify(this.app[key]));
                        }
                        else if (key == 'keywords') {
                            updateData.append(key, this.app[key].join(','));
                        }
                    });
                }
                else {
                    updateData = JSON.parse(JSON.stringify(this.app)); // Quick n dirty clone
                    updateData.keywords = updateData.keywords.split(',').map((keyword) => keyword.trim());
                }

                api.manage.update(this.app.id, updateData, this.user.apikey).then((data) => {
                    data.keywords = data.keywords.join(', ');
                    this.app = data;
                    this.published = this.app.published;

                    let screenshotsElement = document.getElementById('screenshots');
                    if (screenshotsElement) {
                        screenshotsElement.value = '';
                    }

                    this.saving = false;
                    VueNotifications.success({
                        title: this.$gettext('Success'),
                        message: this.$gettext('The changes to %{name} were saved!').replace('%{name}', this.app.name),
                    });
                }).catch((err) => {
                    let error = 'An unknown error has occured';
                    if (err.response && err.response.data && err.response.data.message) {
                        error = err.response.data.message;
                    }

                    this.saving = false;
                    VueNotifications.error({
                        title: this.$gettext('Error'),
                        message: error,
                    });

                    utils.captureException(err);
                });
            }
        },
        remove() {
            if (!this.saving) {
                this.saving = true;

                api.manage.remove(this.app.id, this.user.apikey).then(() => {
                    VueNotifications.success({
                        title: this.$gettext('Success'),
                        message: this.$gettext('%{name} was successfully deleted').replace('%{name}', this.app.name),
                    });

                    this.saving = false;
                    this.$router.push({name: 'manage'});
                }).catch((err) => {
                    let error = 'An unknown error has occured';
                    if (err.response && err.response.data && err.response.data.message) {
                        error = err.response.data.message;
                    }

                    this.saving = false;
                    VueNotifications.error({
                        title: this.$gettext('Error'),
                        message: error,
                    });

                    utils.captureException(err);
                });
            }
        },
    },
    computed: {
        ...mapState(['user', 'isAuthenticated', 'categories']),
        revisions() {
            let revisions = this.app ? this.app.revisions : [];
            revisions.sort((a, b) => {
                if (a.revision < b.revision) {
                    return -1;
                }
                if (a.revision > b.revision) {
                    return 1;
                }

                return 0;
            });

            return revisions;
        },
        filesize() {
            let b = this.app ? this.app.filesize : 0;
            let unit = 'B';

            if (!b) {
                b = 0;
            }
            else if (b > 1024) {
                b /= 1024;
                unit = 'KB';

                if (b > 1024) {
                    b /= 1024;
                    unit = 'MB';

                    if (b > 1024) {
                        b /= 1024;
                        unit = 'GB';

                        if (b > 1024) {
                            b /= 1024;
                            unit = 'TB';
                        }
                    }
                }
            }

            return `${b.toFixed(1)} ${unit}`;
        },
    },
    watch: {
        isAuthenticated(newValue) {
            if (newValue) {
                this.getApp();
                this.getUsers();
            }
        },
    },
};
</script>

<style scoped>
    h1 {
        margin-top: 2px;
    }

    .revisions p {
        margin: 0;
    }

    .screenshots {
        margin-top: 0.5em;
    }

    .screenshot-wrapper {
        display: inline-block;
        margin-right: 1em;
        position: relative;
    }

    .screenshot-remove {
        position: absolute;
        top: 0;
        right: 0;
        display: block;
        background-color: #FFFFFF;
        padding-left: 0.5em;
        padding-right: 0.5em;
        color: #111111;
    }

    .screenshot-thumbnail {
        max-height: 15em;
        max-width: 15em;
        margin-top: 0;
    }

    .small {
        float: right;
        font-size: 0.75em;
        text-align: right;
        width: 100%;
        margin-top: 1em;
    }

    .info {
        margin-top: 0;
    }

    .info table .name {
        width: 8em;
    }

    .info table {
        max-width: 40em
    }

    .downloads table th {
        min-width: 5em;
    }

    .p-card {
        margin-top: 1em;
    }

    .p-tabs::before {
        width: 35px;
    }

    .hidden {
        display: none;
    }

    @media screen and (max-width: 768px) {
        .nsfw label {
            display: inline-block;
        }

        .nsfw input {
            float: none;
            margin: 0;
        }

        .nsfw .small {
            float: none;
        }

        .p-tabs::before {
            padding-right: 0.5em;
        }

        .p-tabs__item:last-of-type {
            margin-right: 2em;
        }
    }

    .strong td {
        font-weight: bold;
    }
</style>
