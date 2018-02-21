<template>
    <div>
        <div class="p-strip">
            <div class="row">
                <h1>Rules for Submission</h1>

                <ul class="p-list">
                    <li class="p-list__item is-ticked">
                        Apps not requiring manual review can be submitted by logging in
                        with the "Log In" link above.
                    </li>
                    <li class="p-list__item is-ticked">
                        You are only allowed to publish apps that you have permission to
                        distribute.
                    </li>
                    <li class="p-list__item is-ticked">
                        You app can be pulled without warning at the discretion of our
                        admins. Where possible, we will contact you regarding any such
                        actions.
                    </li>
                    <li class="p-list__item is-ticked">
                        Apps requiring manual review must be submitted by contacting an
                        admin in our
                        <a href="/telegram">telegram group</a>.
                    </li>
                    <li class="p-list__item is-ticked">
                        Apps containing NSFW content must be marked as such when
                        submitting your app. App icons and app names must not have
                        NSFW content.
                    </li>
                </ul>
            </div>
        </div>

        <div class="p-strip">
            <div class="row">
                <h1>Rules for Submissions Requiring Manual Review</h1>

                <ul class="p-list">
                    <li class="p-list__item is-ticked">
                        Send us a link to a repository for your app to our
                        <a href="https://launchpad.net/~openstore-team">mailing list</a>
                        or our
                        <a href="/telegram">telegram group</a>.
                        along with some instructions on how to build it.
                    </li>
                    <li class="p-list__item is-ticked">
                        Give a short explanation why you can’t publish the app without
                        extra privileges. No need to go into details, a one liner like "needs to run
                        a daemon in the background" will do. List all the special features you have,
                        if there are more.
                    </li>
                    <li class="p-list__item is-ticked">
                        If an application could be published without manual review
                        if it wouldn’t be for that one cool feature, publish a stripped
                        down version! Not everyone will want to install apps with less
                        confinement.
                    </li>
                    <li class="p-list__item is-ticked">
                        Only open source applications allowed for manual review: As the
                        applications might have arbitrary access to the device, every
                        manually reviewed app will get a source code review.
                    </li>
                </ul>
            </div>
        </div>

        <div class="p-strip">
            <div class="row">
                <router-link :to="{name: 'login'}" v-if="!user" class="p-button--positive">
                    Login to submit your app
                </router-link>
                <div v-if="user">
                    <h1>Submit App</h1>

                    <form class="p-form p-form--stacked">
                        <div class="p-form__group">
                            <label for="file" class="p-form__label">App</label>
                            <input type="file" id="file" class="p-form__control" accept=".snap, .click" @change="fileChange($event.target.files)" :disabled="saving" />
                        </div>

                        <h3>OR</h3>

                        <div class="p-form__group">
                            <label for="downloadUrl" class="p-form__label">App from URL</label>
                            <input type="text" id="downloadUrl" class="p-form__control" placeholder="URL of App from the Web" :disabled="saving" v-model="downloadUrl" />
                        </div>

                        <a class="p-button--positive" @click="submit()" :disabled="saving">
                            <i class="fa" :class="{'fa-plus': !saving, 'fa-spinner fa-spin': saving}"></i>
                            Submit
                        </a>

                        <router-link class="p-button--neutral" :to="{name: 'manage'}" :disabled="saving">
                            <i class="fa fa-times"></i>
                            Cancel
                        </router-link>

                        <p v-if="error" class="text-red">
                            {{error}}
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import api from '@/api';
import opengraph from '@/opengraph';

export default {
    name: 'Submit',
    head: {
        title: {inner: 'Submit App'},
        meta: function() {
            return opengraph({
                title: 'Docs - OpenStore',
            });
        },
    },
    data() {
        return {
            user: null,
            file: null,
            downloadUrl: '',
            saving: false,
            error: false,
        };
    },
    created() {
        api.auth.me().then((user) => {
            this.user = user;
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
        submit() {
            if (!this.saving) {
                this.saving = true;
                let promise = null;
                if (this.file) {
                    let formData = new FormData();
                    formData.append('file', this.file, this.file.name);

                    promise = api.manage.create(formData, this.user.apikey);
                }
                else {
                    promise = api.manage.create({downloadUrl: this.downloadUrl}, this.user.apikey);
                }

                promise.then((app) => {
                    this.saving = false;
                    this.$router.push({name: 'manage_package', params: {id: app.id}});
                }).catch((err) => {
                    if (err.response && err.response.data && err.response.data.message) {
                        this.error = err.response.data.message;
                    }
                    else {
                        this.error = 'An unknown error has occured';
                    }

                    this.saving = false;
                });
            }
        },
    },
};
</script>
