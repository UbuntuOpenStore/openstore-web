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
                        You must read over the content policy detailed below.
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
                <h1>OpenStore App Content Policy</h1>

                <p>
                    One of the main goals of the OpenStore is to provide provide
                    a safe app store for people of all ages. To accomplish this
                    goal we do not allow certain types of app to be published.
                    Failure to follow the guidelines will result in your app being
                    removed. Any account with serious infractions may be subject
                    to termination. The OpenStore team thanks you for helping us
                    promote a better enviroment for everyone.
                </p>

                <h2>Prohibited Apps:</h2>

                <ul class="p-list">
                    <li class="p-list__item is-ticked">
                        <b>Sexually Explicit Content</b>:
                        Apps containing or promoting sexually explicit content
                        are not allowed. This includes, but is not limited to,
                        pornography and services promoting sexually explicit content.
                    </li>
                    <li class="p-list__item is-ticked">
                        <b>Child Endangerment</b>:
                        Apps containing or promoting child abuse or child sexual
                        abuse are strictly prohibited.
                    </li>
                    <li class="p-list__item is-ticked">
                        <b>Violence</b>:
                        Apps containing or promoting gratuitous violence are not
                        allowed. This includes, but is not limited to, violence,
                        terrorism, bomb/weapon making, self harm, and grotesque
                        imagery.
                    </li>
                    <li class="p-list__item is-ticked">
                        <b>Harassment, Bullying, or Hate Speech</b>:
                        App containing or promoting any of the above are strictly prohibited.
                    </li>
                    <li class="p-list__item is-ticked">
                        <b>Gambling</b>:
                        Apps containing gambling involving real world money
                        transactions are not allowed. This includes, but is not
                        limited to, online casinos, betting, and lotteries.
                    </li>
                    <li class="p-list__item is-ticked">
                        <b>Illegal Activities</b>:
                        Apps promoting illegal activities (based on USA law) are not allowed.
                    </li>
                    <li class="p-list__item is-ticked">
                        <b>Malware</b>:
                        Apps that are found to be stealing the users data, trying
                        to escalate their privileges without user consent, or
                        executing malicious process are strictly prohibited.
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
                            <label for="id" class="p-form__label">App Name</label>
                            <input
                                type="text"
                                id="id"
                                class="p-form__control"
                                :disabled="saving"
                                v-model="id"
                            />
                            <p class="small text-lightgrey">
                                This is the unique identifier for your app. It must match
                                exactly the "name" field in your click's manifest.json
                                and must be all lowercase letters. For example:
                                "openstore.openstore-team", where "openstore" is the
                                app and "openstore-team" is the group or individual
                                authoring the app.
                            </p>
                        </div>

                        <div class="p-form__group">
                            <label for="name" class="p-form__label">App Title</label>
                            <input
                                type="text"
                                id="name"
                                class="p-form__control"
                                :disabled="saving"
                                v-model="name"
                            />
                        </div>

                        <a class="p-button--positive" @click="submit()" :disabled="saving">
                            <i class="fa" :class="{'fa-plus': !saving, 'fa-spinner fa-spin': saving}"></i>
                            Submit
                        </a>

                        <router-link class="p-button--neutral" :to="{name: 'manage'}" :disabled="saving">
                            <i class="fa fa-times"></i>
                            Cancel
                        </router-link>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import VueNotifications from 'vue-notifications';

import api from '@/api';
import opengraph from '@/opengraph';

export default {
    name: 'Submit',
    head: {
        title: {inner: 'Submit App'},
        meta: function() {
            return opengraph({
                title: 'Submit App - OpenStore',
            });
        },
    },
    data() {
        return {
            user: null,
            id: '',
            name: '',
            saving: false,
        };
    },
    created() {
        api.auth.me().then((user) => {
            this.user = user;
        });
    },
    methods: {
        submit() {
            if (!this.saving) {
                this.saving = true;
                api.manage.create({id: this.id.toLowerCase(), name: this.name}, this.user.apikey).then((app) => {
                    this.saving = false;
                    this.$router.push({name: 'manage_package', params: {id: app.id}});
                }).catch((err) => {
                    let error = 'An unknown error has occured';
                    if (err.response && err.response.data && err.response.data.message) {
                        error = err.response.data.message;
                    }

                    VueNotifications.error({
                        title: 'Error',
                        message: error,
                    });

                    this.saving = false;
                });
            }
        },
    },
};
</script>
