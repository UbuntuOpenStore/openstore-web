<template>
    <div class="row">
        <!-- TODO intelegent back button -->
        <div class="back">
            <router-link :to="back">
                <i class="fa fa-chevron-left"></i>
            </router-link>
            <router-link :to="back">
                Back
            </router-link>
        </div>

        <div class="row">
            <h2 v-if="missing" class="center">
                The app you are looking for has been removed or does not exist
            </h2>

            <h2 v-if="error" class="center text-red">
                There was an error trying to find this app, please refresh and try again.
            </h2>

            <div v-if="loading" class="center">
                <i class="fa fa-spinner fa-spin fa-2x"></i>
            </div>

            <div class="col-6" v-if="app">
                <div class="row">
                    <img class="u-float-left icon" :src="app.icon" />
                    <types class="u-float-right types" :types="app.types"></types>

                    <h1>{{app.name}}</h1>
                    <h2>{{app.tagline}}</h2>
                    <router-link :to="{name: 'browse', query: {search: 'author:' + app.author}}" v-if="app.author">
                        {{app.author}}
                    </router-link>
                </div>

                <div class="row">
                    <div class="center">
                        <a
                            :href="openstoreLink"
                            class="p-button--positive"
                            v-if="app.id != 'openstore.openstore-team'"
                            title="Install via the OpenStore app"
                        >Install</a>

                        <a
                            v-for="download in app.downloads"
                            :href="download.download_url"
                            :key="download.channel"
                            class="p-button--positive"
                            target="_blank"
                        >
                            Download ({{download.channel.charAt(0).toUpperCase()}}{{download.channel.slice(1)}})
                        </a>
                    </div>

                    <div class="row p-matrix u-clearfix">
                        <div class="p-matrix__item center">
                            <i class="fa fa-2x fa-info-circle text-blue"></i>
                            <br/>
                            v{{app.version}}

                            <span v-if="app.donate_url && app.license">
                                <br/>
                                {{app.license}}
                            </span>
                        </div>

                        <div class="p-matrix__item center" v-if="!app.donate_url && app.license">
                            <i class="fa fa-2x fa-file-text-o text-green"></i>
                            <br/>

                            {{app.license}}
                        </div>
                        <div class="p-matrix__item center" :title="restrictedAccess">
                            <i class="fa fa-2x fa-shield" :class="{'text-red': isRestrictedAccess}"></i>
                            <br/>

                            Permissions
                        </div>

                        <div class="p-matrix__item center" v-if="app.donate_url">
                            <a
                                :href="app.donate_url"
                                target="_blank"
                                rel="noopener noreferrer"
                            ><i class="fa fa-2x fa-heart text-red"></i></a>
                            <br/>

                            <a :href="app.donate_url" target="_blank" rel="noopener noreferrer">
                                Donate
                            </a>
                        </div>
                    </div>
                </div>

                <div class="row" v-if="showNSFW">
                    <p class="pre">{{app.description}}</p>
                </div>

                <div class="row video" v-if="app.video_url && showNSFW">
                    <iframe :src="app.video_url" frameborder="0" allowfullscreen></iframe>
                </div>

                <div class="row screenshots" v-if="app.screenshots.length > 0 && showNSFW">
                    <h3>Screenshots</h3>

                    <div class="screenshot-scroll">
                        <div v-for="screenshot in app.screenshots" :key="screenshot">
                            <img v-img:screenshots :src="screenshot" alt="" class="screenshot" />
                        </div>
                    </div>
                </div>

                <div class="row" v-if="!showNSFW">
                    <button class="p-button--neutral" @click="toggleShowNSFW()">Show NSFW Content</button>
                    <p>
                        *This app contains NSFW content, to view the description and
                        screenshots, click the above button.
                    </p>
                </div>
            </div>

            <div class="col-6" v-if="app">
                <div class="row" v-if="showNSFW && app.changelog">
                    <h4>Changelog:</h4>
                    <p class="pre">{{app.changelog}}</p>
                </div>

                <div class="row permissions">
                    <h4>Permissions:</h4>
                    <ul>
                        <li
                            v-for="permission in permissions"
                            :key="permission"
                            :class="{'text-red': isRestricted(permission)}"
                            :title="isRestricted(permission) ? 'Restricted permission' : ''"
                        >
                            {{humanPermission(permission)}}
                        </li>
                        <li v-if="permissions.length === 0">None</li>
                    </ul>
                </div>

                <div class="row info">
                    <h4>Info:</h4>
                    <p v-if="app.author">
                        Author:
                        <router-link :to="{name: 'browse', query: {search: 'author:' + app.author}}">
                            {{app.author}}
                        </router-link>
                    </p>

                    <p v-if="app.maintainer_name">
                        Packager/Publisher: {{app.maintainer_name}}
                    </p>
                    <p v-if="app.support_url">
                        Support:
                        <a :href="app.support_url" target="_blank" rel="noopener noreferrer">{{app.support_url}}</a>
                    </p>
                    <p v-if="app.source">
                        Source: <a :href="app.source" target="_blank" rel="noopener noreferrer">{{app.source}}</a>
                    </p>
                    <p v-if="app.license">
                        License: {{app.license}}
                    </p>
                    <p v-if="app.category">
                        Category: {{app.category}}
                    </p>
                    <p v-if="app.updated_date">
                        Updated: {{app.updated_date | moment("MMMM Do YYYY")}}
                    </p>
                    <p v-if="app.published_date">
                        Published: {{app.published_date | moment("MMMM Do YYYY")}}
                    </p>
                    <p v-if="app.framework">
                        Framework: {{app.framework}}
                    </p>
                    <p v-if="app.architecture">
                        Architecture: {{app.architecture}}
                    </p>
                    <!-- TODO add back when the backend is fixed
                    <p v-if="app.languages.length > 0">
                        Translation Languages: {{app.languages.join(', ')}}
                    </p>
                    -->
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/api';
import opengraph from '@/opengraph';
import cache from '@/cache';
import Types from '@/components/Types.vue';

let restricted = [
    'bluetooth',
    'calendar',
    'contacts',
    'debug',
    'history',
    'music_files',
    'picture_files',
    'video_files',
    'unconfined',
];

function isRestrictedAccess(permissions) {
    return permissions.some((permission) => restricted.includes(permission));
}

export default {
    name: 'Package',
    components: {
        types: Types,
    },
    head: {
        title: function() {
            return {inner: this.app ? this.app.name : ''};
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
            back: cache.getBack(),
            app: null,
            showNSFW: true,
            permissions: [],
            missing: false,
            error: false,
            loading: false,
        };
    },
    created() {
        this.refresh();
    },
    methods: {
        refresh() {
            this.loading = true;

            api.apps.get(this.$route.params.id).then((data) => {
                this.loading = false;

                this.app = data;
                if (this.app.nsfw) {
                    this.showNSFW = false;
                }

                let permissions = [];
                if (this.app && this.app.manifest && this.app.manifest.hooks) {
                    Object.values(this.app.manifest.hooks).forEach((hook) => {
                        if (hook.apparmor && hook.apparmor.policy_groups) {
                            permissions = permissions.concat(hook.apparmor.policy_groups);
                        }

                        if (hook.apparmor && hook.apparmor.template == 'unconfined') {
                            permissions.push('unconfined');
                        }
                    });
                }

                // Only unique permissions
                permissions = permissions.filter((item, pos) => permissions.indexOf(item) == pos);

                this.permissions = permissions.sort();
                this.$emit('updateHead');
            }).catch((err) => {
                this.loading = false;

                if (err.response && err.response.status) {
                    this.missing = true;
                }
                else {
                    this.error = true;
                }
            });
        },
        toggleShowNSFW() {
            this.showNSFW = !this.showNSFW;
        },
        isRestricted(permission) {
            let isRestricted = false;
            if (restricted.indexOf(permission) >= 0) {
                isRestricted = true;
            }

            return isRestricted;
        },
        humanPermission(permission) {
            /* eslint-disable arrow-body-style */
            let humanPerm = permission.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });

            if (permission == 'unconfined') {
                humanPerm = 'Full System Access';
            }

            return humanPerm;
        },
    },
    computed: {
        isRestrictedAccess() {
            return isRestrictedAccess(this.permissions);
        },
        restrictedAccess() {
            let message = 'This app does not have access to restricted system data, see permissions for more details';
            if (isRestrictedAccess(this.permissions)) {
                message = 'This app has access to restricted system data, see permissions for more details';
            }
            return message;
        },
        openstoreLink() {
            return `openstore://${this.app.id}`;
        },
        screenshots() {
            let screenshots = [];
            if (this.app) {
                screenshots = this.app.screenshots.map((screenshot) => ({
                    thumb: screenshot,
                    src: screenshot,
                }));
            }

            return screenshots;
        },
    },
};
</script>

<style scoped>
    .back {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }

    .icon {
        width: 92px;
        height: 92px;
        margin-right: 1em;
        border-radius: 8px;
    }

    h1 {
        margin-top: 0;
        font-size: 2em;
    }

    h2 {
        margin-top: 0;
        font-size: 1.5em;
    }

    .types {
        margin-top: 0;
    }

    .pre {
        white-space: pre-line;
    }

    .p-matrix__item {
        display: block;
    }

    .info p {
        margin-top: 0.25em;
    }

    .video iframe {
        width: 100%;
        height: 315px;
    }

    .screenshot {
        display: block;
        width: auto;
        height: auto;
        max-width: 300px;
        max-height: 300px;
        margin: 5px;
        border: 1px solid #999999;
        border-radius: 8px;
    }

    .screenshot-scroll {
        max-height: 330px;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
    }

    .screenshot-scroll div {
        display: inline-block;
        margin: 0;
    }

    .permissions li {
        margin-top: 0;
    }

    .p-button--positive {
        margin-top: 0;
    }

    .p-button--positive {
        margin-top: 0.25em;
    }

    /*
        Copied from vanilla js because on small screen sizes the matrix isn't a matrix.
        But we don't want to change the matrix breakpoint for the other pages
    */
    .p-matrix {
        display: flex;
        flex-wrap: wrap;
        margin-top: 2em;
    }

    .p-matrix__item {
        border-right: 1px dotted #666;
        border-top: 1px dotted #666;
        margin-bottom: 0;
        padding: 1rem;
        width: 33.333%;
    }

    .p-matrix__item:empty {
        display: block;
    }
    .p-matrix__item:first-child, .p-matrix__item:nth-child(3n+1) {
        padding-left: 0;
    }
    .p-matrix__item:last-child, .p-matrix__item:nth-child(3n) {
        padding-right: 0;
    }
    .p-matrix__item:nth-child(-n+3) {
        border-top: 0;
    }
    .p-matrix__item:nth-child(2n) {
        border-right: 1px dotted #666;
        padding-right: 1rem;
    }
    .p-matrix__item:nth-child(3n) {
        border-right: 0;
        padding-right: 0;
    }
</style>
