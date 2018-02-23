<template>
    <div class="row">
        <div v-if="!loading">
            <h1>
                <router-link :to="{name: 'manage'}" title="Back">
                    <i class="fa fa-chevron-left"></i>
                </router-link>

                Edit {{app.name}} v{{app.version}}

            </h1>

            <div v-if="app.published">
                <router-link :to="{name: 'snap', params: {id: app.id}}" v-if="app.types.indexOf('snappy') > -1" target="_blank">
                    Public Link <i class="fa fa-external-link"></i>
                </router-link>
                <router-link :to="{name: 'app', params: {id: app.id}}" v-if="app.types.indexOf('snappy') == -1" target="_blank">
                    Public Link <i class="fa fa-external-link"></i>
                </router-link>
            </div>

            <form class="p-form p-form--stacked">
                <div class="p-form__group">
                    <label for="publish" class="p-form__label">Publish</label>
                    <button id="switch-on" class="p-switch" type="button" role="switch" :aria-checked="published" @click="published = !published">
                        <span>Yes</span>
                        <span>No</span>
                    </button>
                </div>

                <div class="p-form__group">
                    <label for="file" class="p-form__label">New revision</label>
                    <input type="file" id="file" class="p-form__control" accept=".snap, .click" @change="fileChange($event.target.files)" :disabled="saving" />
                </div>

                <h3>OR</h3>

                <div class="p-form__group">
                    <label for="downloadUrl" class="p-form__label">New Revision from URL</label>
                    <input type="text" id="downloadUrl" class="p-form__control" placeholder="URL of App from the Web" :disabled="saving" v-model="downloadUrl" />
                </div>

                <nav class="p-tabs">
                    <ul class="p-tabs__list" role="tablist">
                        <li class="p-tabs__item" role="presentation">
                            <a class="p-tabs__link" tabindex="0" role="tab" @click="tab = 'presentation'" :aria-selected="tab == 'presentation'">Presentation</a>
                        </li>
                        <li class="p-tabs__item" role="presentation">
                            <a class="p-tabs__link" tabindex="-1" role="tab" @click="tab = 'discovery'" :aria-selected="tab == 'discovery'">Discovery</a>
                        </li>
                        <li class="p-tabs__item" role="presentation">
                            <a class="p-tabs__link" tabindex="-1" role="tab" @click="tab = 'info'" :aria-selected="tab == 'info'">Info</a>
                        </li>
                        <li class="p-tabs__item" role="presentation">
                            <a class="p-tabs__link" tabindex="-1" role="tab" @click="tab = 'stats'" :aria-selected="tab == 'stats'">Stats</a>
                        </li>
                    </ul>
                </nav>

                <div v-if="tab == 'presentation'" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label for="name" class="p-form__label">Name</label>
                            <input type="text" id="name" class="p-form__control" :disabled="saving" v-model="app.name" />
                        </div>

                        <div class="p-form__group">
                            <label for="tagline" class="p-form__label">Tag Line</label>
                            <input type="text" id="tagline" class="p-form__control" :disabled="saving" v-model="app.tagline" />
                        </div>

                        <div class="p-form__group">
                            <label for="description" class="p-form__label">Description</label>
                            <textarea id="description" rows="4" class="p-form__control" :disabled="saving" v-model="app.description"></textarea>
                        </div>

                        <div class="p-form__group">
                            <label for="changelog" class="p-form__label">Changelog</label>
                            <textarea id="changelog" rows="4" class="p-form__control" :disabled="saving" v-model="app.changelog"></textarea>
                        </div>

                        <div class="p-form__group">
                            <label for="screenshots" class="p-form__label">Screenshots (Limit 5)</label>

                            <div>
                                <input type="file" id="screenshots" class="p-form__control" accept="image/*" multiple="multiple" @change="screenshotFilesChanged($event.target.files)" :disabled="saving" />

                                <p v-if="app.screenshots.length > 0">
                                    Drag &amp; drop to sort screenshots.
                                </p>

                                <!-- TODO option to remove screenshots -->
                                <draggable v-model="app.screenshots" class="screenshots">
                                    <div v-for="screenshot in app.screenshots" class="screenshot-wrapper">
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

                <div v-if="tab == 'discovery'" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label for="category" class="p-form__label">Category</label>
                            <select type="text" id="category" class="p-form__control" :disabled="saving" v-model="app.category">
                                <option value="">Choose a category</option>
                                <option v-for="category in categories" :value="category.category">{{category.category}}</option>
                                <!--TODO make this a fancy dropdown with our icons-->
                            </select>
                        </div>

                        <div class="p-form__group">
                            <label for="keywords" class="p-form__label">Keywords</label>
                            <input type="text" id="keywords" class="p-form__control" :disabled="saving" v-model="app.keywords" />
                            <p class="small text-lightgrey">A comma separated list of keywords</p>
                        </div>

                        <div class="p-form__group nsfw">
                            <label for="nsfw" class="p-form__label">NSFW</label>
                            <input type="checkbox" id="nsfw" class="p-form__control" :disabled="saving" v-model="app.nsfw" />
                            <div class="small text-lightgrey">This app contains NSFW material</div>
                        </div>
                    </div>
                </div>

                <div v-if="tab == 'info'" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label for="license" class="p-form__label">License</label>
                            <select type="text" id="license" class="p-form__control" :disabled="saving" v-model="app.license">
                                <option value="">Choose a license</option>
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
                                <option value="Creative Commons - Attribution Share Alike">Creative Commons - Attribution Share Alike</option>
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
                            <label for="source" class="p-form__label">Source URL</label>
                            <input type="text" id="source" class="p-form__control" :disabled="saving" v-model="app.source" />
                        </div>

                        <div class="p-form__group">
                            <label for="support_url" class="p-form__label">Support URL</label>
                            <input type="text" id="support_url" class="p-form__control" :disabled="saving" v-model="app.support_url" />
                        </div>

                        <div class="p-form__group">
                            <label for="donate_url" class="p-form__label">Donate URL</label>
                            <input type="text" id="donate_url" class="p-form__control" :disabled="saving" v-model="app.donate_url" />
                        </div>

                        <div class="p-form__group">
                            <label for="video_url" class="p-form__label">Video URL</label>
                            <input type="text" id="video_url" class="p-form__control" :disabled="saving" v-model="app.video_url" />
                            <div class="small text-lightgrey">Only YouTube videos are supported at this time. Make sure the url is for the embedded video!</div>
                        </div>

                        <div class="p-form__group" v-if="user.role == 'admin'">
                            <label for="maintainer" class="p-form__label">Maintainer</label>
                            <select type="text" id="maintainer" class="p-form__control" :disabled="saving" v-model="app.maintainer">
                                <option value="">Choose a maintainer</option>
                                <option v-for="user in users" :value="user._id">{{user.display_name}}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div v-if="tab == 'stats'" class="p-card">
                    <div class="p-card__content">
                        <div class="p-form__group">
                            <label class="p-form__label">Package Info</label>
                            <div class="info">
                                ID: {{app.id}}
                                <br/> Author: {{app.author}}
                                <br/> Version: {{app.version}}
                                <br/> Revision: {{app.revision}}
                                <br/> Architecture: {{app.architecture}}
                                <br/> Framework: {{app.framework}}
                                <br/> File Size: {{filesize}}
                                <br/>
                                <span v-if="app.types.length != 1">Types:</span>
                                <span v-if="app.types.length == 1">Type:</span>
                                {{app.types.join(', ')}}

                                <div v-if="app.languages.length > 0">
                                    Translation Languages: {{app.languages.join(', ')}}
                                </div>

                                <br/>
                            </div>
                        </div>

                        <div class="p-form__group revisions">
                            <label class="p-form__label">Download Stats</label>

                            <div>
                                <p v-for="revision in revisions">
                                    Revision {{revision.revision}} (v{{revision.version}}): {{revision.downloads}}
                                </p>
                                <p>Total: {{app.totalDownloads}}</p>
                            </div>
                        </div>

                        <div class="p-form__group revisions" v-if="app.published_date">
                            <label class="p-form__label">Published Date</label>

                            <div>
                                {{app.published_date.replace('T', ' ').replace('Z', '')}}
                            </div>
                        </div>

                        <div class="p-form__group revisions" v-if="app.updated_date">
                            <label class="p-form__label">Updated Date</label>

                            <div>
                                {{app.updated_date.replace('T', ' ').replace('Z', '')}}
                            </div>
                        </div>
                    </div>
                </div>

                <a class="p-button--positive" @click="save()" :disabled="saving">
                    <i class="fa" :class="{'fa-save': !saving, 'fa-spinner fa-spin': saving}"></i>
                    Save
                </a>

                <router-link class="p-button--neutral" :to="{name: 'manage'}" :disabled="saving">
                    <i class="fa fa-times"></i>
                    Cancel
                </router-link>

                <!-- TODO make this a nice popup -->
                <p v-if="error" class="text-red">
                    {{error}}
                </p>
                <p v-if="success" class="text-green">
                    Saved!
                </p>
            </form>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
import draggable from 'vuedraggable';

import api from '@/api';
import opengraph from '@/opengraph';

export default {
    name: 'ManagePackage',
    components: {
        draggable,
    },
    head: {
        title: function() {
            let title = 'Manage';
            if (this.app) {
                title = `Manage ${this.app.name}`;
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
            published: false,
            file: null,
            screenshotFiles: [],
            downloadUrl: '',
            loading: false,
            saving: false,
            error: false,
            success: false,
            tab: 'presentation',
            categories: [],
            users: [],
            sortableOptions: {
                store: {
                    get: () => {
                        return this.app.screenshots ? this.app.screenshots : [];
                    },
                    set: (sortable) => {
                        this.app.screenshots = sortable.toArray();
                    },
                },
            },
        };
    },
    created() {
        this.loading = true;
        api.auth.me().then((user) => {
            if (user) {
                this.user = user;
            }
            else {
                this.$router.push({name: 'login'});
            }
        }).then(() => {
            if (this.user) {
                return api.manage.get(this.$route.params.id, this.user.apikey);
            }

            return null;
        }).then((data) => {
            this.loading = false;
            if (data) {
                data.keywords = data.keywords.join(', ');
                this.app = data;
                this.published = this.app.published;

                this.$emit('updateHead');
            }

            if (this.user.role == 'admin') {
                return api.users.getAll(this.user.apikey);
            }

            return [];
        }).then((users) => {
            users.sort((a, b) => {
                if (a.role == 'admin' && b.role != 'admin') {
                    return -1;
                }
                else if (a.role != 'admin' && b.role == 'admin') {
                    return 1;
                }
                else if (a.name > b.name) {
                    return 1;
                }
                else if (a.name < b.name) {
                    return -1;
                }

                return 0;
            });

            users.forEach((user) => {
                let name = 'UNKNOWN';
                if (user.name && user.email) {
                    name = `${user.name} (${user.email})`;
                }
                else if (user.name && !user.email) {
                    name = user.name;
                }
                else if (!user.name && user.email) {
                    name = user.email;
                }

                if (user.role) {
                    name += ` - ${user.role}`;
                }
                else {
                    name += ' - community';
                }

                user.display_name = name;
            });

            this.users = users;

            return Vue.nextTick();
        }).catch(() => {
            this.loading = false;
            this.error = 'An error occured loading your app data';
        });

        api.categories().then((data) => {
            this.categories = data;
        });
    },
    methods: {
        fileChange(files) {
            if (files.length > 0) {
                this.file = files[0];
            }
            else {
                this.file = null;
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
            this.app.screenshots = this.app.screenshots.filter((s) => {
                return (s != screenshot);
            });
        },
        save() {
            if (!this.saving) {
                this.saving = true;
                this.success = false;
                this.error = '';

                this.app.published = this.published;
                let updateData = {};

                if (this.file || this.screenshotFiles.length > 0) {
                    updateData = new FormData();

                    if (this.file) {
                        updateData.append('file', this.file, this.file.name);
                    }

                    if (this.screenshotFiles.length > 0) {
                        let screenshotLimit = 5 - this.app.screenshots.length;
                        if (this.screenshotFiles.length < screenshotLimit) {
                            screenshotLimit = this.screenshotFiles.length;
                        }

                        for (let i = 0; i < screenshotLimit; i++) {
                            updateData.append('screenshot_files', this.screenshotFiles[i], this.screenshotFiles[i].name);
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
                    updateData.keywords = updateData.keywords.split(',').map((keyword) => {
                        return keyword.trim();
                    });

                    if (this.downloadUrl) {
                        updateData.downloadUrl = this.downloadUrl;
                    }
                }

                api.manage.update(this.app.id, updateData, this.user.apikey).then((data) => {
                    data.keywords = data.keywords.join(', ');
                    this.app = data;
                    this.published = this.app.published;

                    this.file = null;
                    document.getElementById('file').value = '';
                    document.getElementById('screenshots').value = '';

                    this.saving = false;
                    this.success = true;
                }).catch((err) => {
                    if (err.response && err.response.data && err.response.data.message) {
                        this.error = err.response.data.message;
                    }
                    else {
                        this.error = 'An unknown error has occured';
                    }

                    this.saving = false;
                    this.success = false;
                });
            }
        },
    },
    computed: {
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

    .p-card {
        margin-top: 1em;
    }

    .p-tabs::before {
        width: 35px;
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
    }
</style>
