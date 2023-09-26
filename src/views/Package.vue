<template>
  <div class="row package-view">
    <div class="back">
      <router-link :to="back">
        <svgicon icon="back" width="0.75em" height="0.75em" color="#007aa6" />
      </router-link>
      <router-link :to="back" v-translate>Back</router-link>
    </div>

    <div class="row">
      <h2
        v-if="missing"
        class="center"
        v-translate
      >The app you are looking for has been removed or does not exist</h2>

      <h2
        v-if="error"
        class="center text-red"
        v-translate
      >There was an error trying to find this app, please refresh and try again.</h2>

      <div v-if="loading" class="center loading">
        <svgicon class="spin" icon="spinner" width="3em" height="3em" color="#007aa6" />
      </div>

      <div class="col-6" v-if="app">
        <div class="row">
          <img class="u-float-left icon" :src="app.icon" />
          <types class="u-float-right types" :types="app.types"></types>

          <h1>{{app.name}}</h1>
          <h2>{{app.tagline}}</h2>
          <router-link
            :to="{name: 'browse', query: {search: 'publisher:' + app.publisher}}"
            v-if="app.publisher"
          >{{app.publisher}}</router-link>
        </div>

        <div class="row">
          <div class="center">
            <rating-row :ratings="app.ratings" />
          </div>
        </div>

        <div class="row">
          <div class="center">
            <span v-if="app.downloads.length === 0" v-translate>No longer available</span>

            <a
              :href="openstoreLink"
              class="p-button--positive"
              v-if="app.id !== 'openstore.openstore-team' && app.downloads.length > 0"
              :title="installTitle"
              v-translate
            >Install</a>

            <span
              class="download-button p-contextual-menu--left ml"
              v-if="app.downloads.length > 0"
            >
              <button
                class="p-contextual-menu__toggle p-button--positive"
                aria-controls="#download-menu"
                :aria-expanded="showDownloadMenu ? 'true' : 'false'"
                aria-haspopup="true"
                @click="showDownloadMenu = !showDownloadMenu"
              >
                <span class="mr" v-translate>Download</span>
                <svgicon icon="toolkit_arrow-up" width="0.75em" height="0.75em" color="#ffffff" v-if="showDownloadMenu" />
                <svgicon icon="toolkit_arrow-down" width="0.75em" height="0.75em" color="#ffffff" v-if="!showDownloadMenu" />
              </button>
              <span
                class="p-contextual-menu__dropdown"
                id="download-menu"
                :aria-hidden="showDownloadMenu ? 'false' : 'true'"
                aria-label="submenu"
              >
                <span class="p-contextual-menu__group">
                  <a
                    v-for="download in app.downloads"
                    :href="download.download_url"
                    :key="download.revision"
                    class="p-contextual-menu__link"
                    target="_blank"
                    @click="showDownloadMenu = false"
                  >
                    {{download.channel | titleCase}}
                    <span class="mr" v-translate>Download</span>
                    v{{download.version}}
                    ({{download.architecture}})
                  </a>

                  <router-link
                    :to="{name: 'versions', params: {id: app.id}}"
                    class="p-contextual-menu__link"
                    @click="showDownloadMenu = false"
                  >
                    <span class="mr" v-translate>Older Versions</span>
                  </router-link>
                </span>
              </span>
            </span>
          </div>

          <div class="row p-matrix u-clearfix">
            <div class="p-matrix__item center version">
              <svgicon icon="info" width="2em" height="2em" color="#1ab6ef" />
              <br />

              v{{version}}
              <span v-if="app.donate_url && app.license">
                <br />
                {{app.license}}
              </span>
            </div>

            <div class="p-matrix__item center" v-if="!app.donate_url && app.license">
              <svgicon icon="note" width="2em" height="2em" color="#3fb24f" />
              <br />
              {{app.license}}
            </div>
            <div class="p-matrix__item center" :title="restrictedAccess">
              <svgicon icon="lock" width="2em" height="2em" color="#3fb24f" v-if="!isRestrictedAccess" />
              <svgicon icon="security-alert" width="2em" height="2em" color="#fc4949" v-if="isRestrictedAccess && !isTrustedApp" />
              <svgicon icon="user-admin" width="2em" height="2em" color="#fc4949" v-if="isRestrictedAccess && isTrustedApp" />
              <br />

              <span v-translate>Permissions</span>
            </div>

            <div class="p-matrix__item center" v-if="app.donate_url">
              <a :href="app.donate_url" target="_blank" rel="noopener noreferrer">
                <svgicon icon="thumbs_up-full" width="2em" height="2em" color="#dd4814" />
              </a>
              <br />

              <a :href="app.donate_url" target="_blank" rel="noopener noreferrer" v-translate>Donate</a>
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
          <h3 v-translate>Screenshots</h3>

          <div class="screenshot-scroll">
            <div v-for="screenshot in app.screenshots" :key="screenshot">
              <img v-img:screenshots :src="screenshot" alt class="screenshot" />
            </div>
          </div>
        </div>

        <div class="row" v-if="!showNSFW">
          <button class="p-button--neutral" @click="toggleShowNSFW()" v-translate>Show NSFW Content</button>
          <p v-translate>
            *This app contains NSFW content, to view the description and
            screenshots, click the above button.
          </p>
        </div>

        <div class="row info">
          <h4>
            <span v-translate>Info</span>:
          </h4>
          <p v-if="app.publisher">
            <span v-translate>Publisher</span>:
            <router-link
              :to="{name: 'browse', query: {search: 'publisher:' + app.publisher}}"
            >{{app.publisher}}</router-link>
          </p>

          <p v-if="app.support_url">
            <span v-translate>Support</span>:
            <a
              :href="app.support_url"
              target="_blank"
              rel="noopener noreferrer"
            >{{app.support_url}}</a>
          </p>
          <p v-if="app.source">
            <span v-translate>Source</span>:
            <a :href="app.source" target="_blank" rel="noopener noreferrer">{{app.source}}</a>
          </p>
          <p v-if="app.translation_url">
            <span v-translate>Translations</span>:
            <a
              :href="app.translation_url"
              target="_blank"
              rel="noopener noreferrer"
            >{{app.translation_url}}</a>
          </p>
          <p v-if="app.license">
            <span v-translate>License</span>
            :
            {{app.license}}
          </p>
          <p v-if="app.category">
            <span v-translate>Category</span>
            :
            {{app.category}}
          </p>
          <p v-if="app.updated_date">
            <span v-translate>Updated</span>
            :
            {{app.updated_date | date}}
          </p>
          <p v-if="app.published_date">
            <span v-translate>Published</span>
            :
            {{app.published_date | date}}
          </p>
          <p v-if="app.architectures">
            <span v-translate>Architecture</span>
            :
            {{app.architectures.join(', ')}}
          </p>
          <p v-if="app.languages.length > 0">
            <span v-translate>Translation Languages</span>
            :
            {{app.languages.join(', ')}}
          </p>
        </div>
      </div>

      <div class="col-6" v-if="app">
        <div class="row" v-if="showNSFW && app.changelog">
          <h4>
            <span v-translate>Changelog</span>:
          </h4>
          <p class="pre changelog">{{app.changelog}}</p>
        </div>

        <div class="row permissions">
          <h4>
            <span v-translate>Permissions</span>:
          </h4>
          <ul>
            <li
              v-for="permission in permissions"
              :key="permission"
              :class="{'text-red': isRestricted(permission)}"
              :title="restrictedLabel(permission)"
            >
              <span v-if="permission.type === 'write'">
                <span v-translate>Unrestricted write access to:</span>
                {{permission.path}}
              </span>
              <span v-if="permission.type === 'read'">
                <span v-translate>Unrestricted read access to:</span>
                {{permission.path}}
              </span>
              <span v-if="!permission.type">{{permissionLabels[permission]}}</span>
            </li>
            <li v-if="permissions.length === 0" v-translate>None</li>
          </ul>
        </div>

        <div class="row info">
          <h4>
            <span v-translate>Stats</span>:
          </h4>

          <p v-if="app.latestDownloads > 0">
            <span v-translate>Downloads of the latest version</span>
            :
            {{latestDownloads | number}}
          </p>
          <p>
            <span v-translate>Total downloads</span>
            :
            {{app.totalDownloads | number}}
          </p>
        </div>

        <reviews :app="app" :reviews="reviews" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';
import Types from '@/components/Types.vue';
import RatingRow from '@/components/RatingRow.vue';
import Reviews from '@/components/Reviews.vue';

const restricted = [
  'bluetooth',
  'calendar',
  'contacts',
  'debug',
  'history',
  'music_files',
  'music_files_read',
  'picture_files',
  'picture_files_read',
  'video_files',
  'video_files_read',
  'unconfined',
];

export default {
  name: 'Package',
  components: {
    Types,
    RatingRow,
    Reviews,
  },
  head: {
    title() {
      return { inner: this.app ? this.app.name : '' };
    },
    meta() {
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
      app: null,
      reviews: [],
      showNSFW: true,
      showDownloadMenu: false,
      permissions: [],
      missing: false,
      error: false,
      loading: false,
      latestDownloads: 0,
      version: '',
      installTitle: this.$gettext('Install via the OpenStore app'),
      permissionLabels: {
        // TODO make these update with the language change
        accounts: this.$gettext('Accounts'),
        audio: this.$gettext('Audio'),
        bluetooth: this.$gettext('Bluetooth'),
        calendar: this.$gettext('Calendar'),
        camera: this.$gettext('Camera'),
        connectivity: this.$gettext('Connectivity'),
        contacts: this.$gettext('Contacts'),
        content_exchange_source: this.$gettext('Content Exchange Source'),
        content_exchange: this.$gettext('Content Exchange'),
        debug: this.$gettext('Debug'),
        document_files_read: this.$gettext('Read Document Files'),
        document_files: this.$gettext('Document Files'),
        history: this.$gettext('History'),
        'in-app-purchases': this.$gettext('In App Purchases'),
        'keep-display-on': this.$gettext('Keep Display On'),
        location: this.$gettext('Location'),
        microphone: this.$gettext('Microphone'),
        music_files_read: this.$gettext('Read Music Files'),
        music_files: this.$gettext('Music Files'),
        nfc: this.$gettext('NFC'),
        networking: this.$gettext('Networking'),
        picture_files_read: this.$gettext('Read Picture Files'),
        picture_files: this.$gettext('Picture Files'),
        'push-notification-client': this.$gettext('Push Notifications'),
        sensors: this.$gettext('Sensors'),
        usermetrics: this.$gettext('User Metrics'),
        video_files_read: this.$gettext('Read Video Files'),
        video_files: this.$gettext('Video Files'),
        video: this.$gettext('Video'),
        webview: this.$gettext('Webview'),
        unconfined: this.$gettext('Full System Access'),
      },
    };
  },
  created() {
    this.refresh();
  },
  methods: {
    async refresh() {
      this.loading = true;
      this.latestDownloads = 0;
      this.version = '';

      try {
        const [app, reviews] = await Promise.all([
          api.apps.get(this.$route.params.id),
          api.apps.getReviews(this.$route.params.id),
        ]);

        this.app = app;
        this.reviews = reviews;
        this.loading = false;

        this.version = app.version;

        // TODO make this more generic to survive the next upgrade
        const focalDownload = app.downloads.find((download) => download.channel === 'focal');
        if (focalDownload && focalDownload.version) {
          this.version = focalDownload.version;
        }

        // Include all channels in the downloads count
        this.latestDownloads = app.downloads.reduce((acc, curr) => {
          return acc + curr.downloads;
        }, 0);

        if (this.app.nsfw) {
          this.showNSFW = false;
        }

        let permissions = [];
        if (this.app && this.app.manifest && this.app.manifest.hooks) {
          Object.values(this.app.manifest.hooks).forEach((hook) => {
            if (hook.apparmor) {
              if (hook.apparmor.policy_groups) {
                permissions = permissions.concat(hook.apparmor.policy_groups);
              }

              if (hook.apparmor.template === 'unconfined') {
                permissions.push('unconfined');
              }

              if (hook.apparmor.write_path) {
                hook.apparmor.write_path.forEach((path) => {
                  permissions.push({
                    type: 'write',
                    path: path
                      .replace('/home/phablet', '~')
                      .replace('@{HOME}', '~'),
                  });
                });
              }

              if (hook.apparmor.read_path) {
                hook.apparmor.read_path.forEach((path) => {
                  permissions.push({
                    type: 'read',
                    path: path
                      .replace('/home/phablet', '~')
                      .replace('@{HOME}', '~'),
                  });
                });
              }
            }
          });
        }

        // Only unique permissions
        permissions = permissions.filter(
          (item, pos) => permissions.indexOf(item) === pos,
        );

        this.permissions = permissions.sort();
        this.$emit('updateHead');
      }
      catch (err) {
        this.loading = false;

        if (err.response && err.response.status) {
          this.missing = true;
        }
        else {
          this.error = true;
        }

        utils.captureException(err);
      }
    },
    toggleShowNSFW() {
      this.showNSFW = !this.showNSFW;
    },
    isRestricted(permission) {
      let isRestricted = false;
      if (restricted.indexOf(permission) >= 0 || permission.type) {
        isRestricted = true;
      }

      return isRestricted;
    },
    restrictedLabel(permission) {
      if (this.isRestricted(permission)) {
        return this.$gettext('Restricted permission');
      }

      return '';
    },
  },
  computed: {
    ...mapState(['back']),
    isRestrictedAccess() {
      return this.permissions.some(
        (permission) => restricted.includes(permission) || permission.type,
      );
    },
    restrictedAccess() {
      let message = this.$gettext(
        'This app does not have access to restricted system data, see permissions for more details',
      );
      if (this.isRestrictedAccess) {
        message = this.$gettext(
          'This app has access to restricted system data, see permissions for more details',
        );
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
    isTrustedApp() {
      if (this.app && this.app.id) {
        if (this.app.id.startsWith('com.ubuntu.') && !this.app.id.startsWith('com.ubuntu.developer.')) {
          return true;
        }

        if (this.app.id.startsWith('com.canonical.')) {
          return true;
        }

        if (this.app.id.startsWith('ubports.')) {
          return true;
        }

        if (this.app.id.startsWith('openstore.')) {
          return true;
        }
      }

      return false;
    },
  },
};
</script>

<style>
.package-view .back {
  margin-top: 0.5em;
  margin-bottom: 0.5em;
}

.package-view .icon {
  width: 92px;
  height: 92px;
  margin-right: 1em;
  border-radius: 8px;
}

.package-view h1 {
  margin-top: 0;
  font-size: 2em;
}

.package-view h2 {
  margin-top: 0;
  font-size: 1.5em;
}

.package-view .types {
  margin-top: 0;
}

.package-view .pre {
  white-space: pre-line;
}

.package-view .changelog {
  max-height: 20em;
  overflow-y: scroll;
}

.package-view .p-matrix__item {
  display: block;
}

.package-view .info:first-child {
  margin-top: 1em;
}

.package-view p + p {
  margin-top: 0.25em;
}

.package-view .video iframe {
  width: 100%;
  height: 315px;
}

.package-view .screenshot {
  display: block;
  width: auto;
  height: auto;
  max-width: 300px;
  max-height: 300px;
  margin: 5px;
  border: 1px solid #999999;
  border-radius: 8px;
}

.package-view .screenshot-scroll {
  max-height: 330px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

.package-view .screenshot-scroll div {
  display: inline-block;
  margin: 0;
}

.package-view .permissions li {
  margin-top: 0;
}

.package-view .version {
  word-wrap: break-word;
}

.package-view .p-button--positive {
  margin-top: 0;
}

.package-view .p-button--positive {
  margin-top: 0.25em;
}

.package-view .p-contextual-menu__dropdown {
  min-width: 16em;
  max-width: 20em;
}

.package-view button * {
  margin-top: 0;
}

/*
  Copied from vanilla js because on small screen sizes the matrix isn't a matrix.
  But we don't want to change the matrix breakpoint for the other pages
*/
.package-view .p-matrix {
  display: flex;
  flex-wrap: wrap;
  margin-top: 2em;
}

.package-view .p-matrix__item {
  border-right: 1px dotted #666;
  border-top: 1px dotted #666;
  margin-bottom: 0;
  padding: 1rem;
  width: 33.333%;
}

.package-view .p-matrix__item:empty {
  display: block;
}
.package-view .p-matrix__item:first-child,
.package-view .p-matrix__item:nth-child(3n + 1) {
  padding-left: 0;
}
.package-view .p-matrix__item:last-child,
.package-view .p-matrix__item:nth-child(3n) {
  padding-right: 0;
}
.package-view .p-matrix__item:nth-child(-n + 3) {
  border-top: 0;
}
.package-view .p-matrix__item:nth-child(2n) {
  border-right: 1px dotted #666;
  padding-right: 1rem;
}
.package-view .p-matrix__item:nth-child(3n) {
  border-right: 0;
  padding-right: 0;
}

@media screen and (max-width: 768px) {
  .package-view .download-button {
    width: 100%;
    margin-left: 0;
  }
}
</style>
