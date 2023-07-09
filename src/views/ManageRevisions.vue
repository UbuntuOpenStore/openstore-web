<template>
  <div class="row">
    <div v-if="!loading">
      <h1>
        <router-link :to="{name: 'manage_package', params: {id: app.id}}" title="Back">
          <svgicon icon="back" width="0.75em" height="0.75em" color="#007aa6" />
        </router-link>

        <translate :translate-params="{name: app.name}">New Revision for %{name}</translate>
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

        <div class="p-form__group">
          <label for="channel" class="p-form__label" v-translate>Channel</label>
          <select id="channel" class="p-form__control" v-model="channel" :disabled="saving">
            <option value="xenial" v-translate>Xenial</option>
            <option value="focal" v-translate>Focal</option>
          </select>
        </div>

        <div class="divider"></div>

        <div v-for="revision in revisions" :key="revision.key">
          <div class="p-form__group" v-if="fileUpload">
            <label class="p-form__label">
              {{uploadLabel}}

              <span v-if="revision.progress > 0 && revision.progress < 100 && !revision.completed"> - {{revision.progress}}%</span>
              <span v-if="revision.progress >= 100 && !revision.completed"> - {{processingText}}</span>
              <span v-if="revision.completed"> - {{completedText}}</span>
            </label>
            <input
              type="file"
              class="p-form__control file"
              accept=".click"
              @change="fileChange(revision, $event.target.files)"
              :disabled="saving"
            />
          </div>
          <div class="p-form__group" v-else>
            <label class="p-form__label">
              {{uploadLabel}}

              <span v-if="revision.progress >= 100 && !revision.completed"> - {{processingText}}</span>
              <span v-if="revision.completed"> - {{completedText}}</span>
            </label>
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
          <textarea
            id="changelog"
            rows="4"
            class="p-form__control"
            :disabled="saving"
            v-model="changelog"
          ></textarea>
          <p
            class="small text-lightgrey"
            v-translate
          >This will be added to the beginning of your current changelog</p>
        </div>

        <a class="p-button--positive" @click="save()" :disabled="saving || !canCreate">
          <span v-translate>Create</span>
        </a>

        <router-link
          class="p-button--neutral"
          :to="{name: 'manage_package', params: {id: app.id}}"
          :disabled="saving"
        >
          <span v-translate>Cancel</span>
        </router-link>

        <span class="saving">
          <svgicon v-if="saving" class="spin" icon="spinner" width="1.5em" height="1.5em" color="#007aa6" />
        </span>
      </form>

      <p v-if="error" class="text-red">
        {{error}}
        <ul>
          <li v-for="reason in errorReasons" :key="reason">{{reason}}</li>
        </ul>
      </p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';
import miniToastr from 'mini-toastr';

import api from '@/api';
import opengraph from '@/opengraph';
import utils from '@/utils';

function newRevision() {
  return {
    key: Math.random(),
    file: null,
    downloadUrl: null,
    progress: 0,
    completed: false,
  };
}

export default {
  name: 'ManageRevisions',
  head: {
    title() {
      let title = this.$gettext('New Revision');
      if (this.app) {
        title = `${this.$gettext('New Revision')} ${this.app.name}`;
      }

      return { inner: title };
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
      app: {},
      channel: 'xenial',
      loading: false,
      saving: false,
      changelog: '',
      fileUpload: true,
      revisions: [newRevision()],
      completedText: this.$gettext('Completed'),
      processingText: this.$gettext('Processing'),
      error: '',
      errorReasons: [],
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
        this.app = await api.manage.get(
          this.$route.params.id,
          this.user.apikey,
        );

        this.$emit('updateHead');
      }
      catch (err) {
        miniToastr.error(this.$gettext('An error occured loading your app data'), this.$gettext('Error'));
        utils.captureException(err);
      }

      this.loading = false;
    },
    addRevision() {
      this.revisions.push(newRevision());
    },
    fileChange(revision, files) {
      /* eslint-disable no-param-reassign */
      if (files.length > 0) {
        revision.file = files[0];
      }
      else {
        revision.file = null;
      }
      /* eslint-enable no-param-reassign */
    },
    async save() {
      if (!this.saving && this.canCreate) {
        this.saving = true;

        let first = true;
        /* eslint-disable no-await-in-loop */
        for (let i = 0; i < this.revisions.length; i++) {
          const revision = this.revisions[i];
          const updateData = new FormData();

          if (revision.file) {
            updateData.append('file', revision.file, revision.file.name);
          }
          else if (revision.downloadUrl) {
            updateData.append('downloadUrl', revision.downloadUrl);
          }
          else {
            continue;
          }

          updateData.append('channel', this.channel);

          if (first) {
            updateData.append('changelog', this.changelog);
            first = false;
          }

          try {
            await api.manage.revision(
              this.app.id,
              updateData,
              this.user.apikey,
              (progressEvent) => {
                const progress = parseInt(Math.round((progressEvent.loaded / progressEvent.total) * 100), 10);
                Vue.set(this.revisions[i], 'progress', progress);
              },
            );

            Vue.set(this.revisions[i], 'completed', true);
            this.error = '';
            this.errorReasons = [];
          }
          catch (err) {
            let error = this.$gettext('An unknown error has occurred');
            if (
              err.response &&
              err.response.data &&
              err.response.data.message
            ) {
              error = err.response.data.message;
            }
            let reasons = [];
            if (
              err.response &&
              err.response.data &&
              err.response.data.data &&
              err.response.data.data.reasons
            ) {
              reasons = err.response.data.data.reasons;
            }

            this.saving = false;
            this.error = error;
            this.errorReasons = reasons;
            miniToastr.error(error, this.$gettext('Error'));
            utils.captureException(err);

            return;
          }
        }

        this.saving = false;

        let channelText = this.$gettext('Xenial');
        if (this.channel === 'focal') {
          channelText = this.$gettext('Focal');
        }

        let message = this.$gettext(
          'New revision for %{channel} was created!',
        ).replace('%{channel}', channelText);
        if (this.revisions.length > 0) {
          message = this.$gettext(
            'New revisions for %{channel} were created!',
          ).replace('%{channel}', channelText);
        }

        miniToastr.success(message, this.$gettext('Success'));
        this.$router.push({
          name: 'manage_package',
          params: { id: this.app.id },
        });
      }
    },
  },
  computed: {
    ...mapState(['user', 'isAuthenticated']),
    canAdd() {
      return this.revisions.length < 3;
    },
    canCreate() {
      return (
        this.revisions.filter((revision) => revision.file || revision.downloadUrl)
          .length > 0
      );
    },
    uploadLabel() {
      return this.fileUpload ? this.$gettext('File Upload') : this.$gettext('URL');
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
