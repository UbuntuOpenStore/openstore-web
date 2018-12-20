<template>
    <div>
        <div class="p-strip">
            <div class="row">
                <h1 v-translate>Rules for Submission</h1>

                <ul class="p-list">
                    <li class="p-list__item is-ticked" v-translate>
                        Apps not requiring manual review can be submitted by logging in with the "Log In" link above.
                    </li>
                    <li class="p-list__item is-ticked" v-translate>
                        You are only allowed to publish apps that you have permission to distribute.
                    </li>
                    <li class="p-list__item is-ticked" v-translate>
                        You app can be pulled without warning at the discretion of our admins.
                        Where possible, we will contact you regarding any such actions.
                    </li>
                    <li class="p-list__item is-ticked">
                        <a href="/telegram" v-translate>
                            Apps requiring manual review must be submitted by contacting an admin in our telegram group.
                        </a>
                    </li>
                    <li class="p-list__item is-ticked" v-translate>
                        You must read over the content policy detailed below.
                    </li>
                </ul>
            </div>
        </div>

        <div class="p-strip">
            <div class="row">
                <h1 v-translate>Rules for Submissions Requiring Manual Review</h1>

                <ul class="p-list">
                    <li class="p-list__item is-ticked">
                        <a href="/telegram">
                            Send us a link to a repository for your app to our telegram group along with some instructions on how to build it.
                        </a>
                    </li>
                    <li class="p-list__item is-ticked" v-translate>
                        Give a short explanation why you can’t publish the app without extra privileges.
                        No need to go into details, a one liner like "needs to run a daemon in the background" will do.
                        List all the special features you have, if there are more.
                    </li>
                    <li class="p-list__item is-ticked" v-translate>
                        If an application could be published without manual review if it wouldn’t be for that one cool feature, publish a stripped down version!
                        Not everyone will want to install apps with less confinement.
                    </li>
                    <li class="p-list__item is-ticked" v-translate>
                        Only open source applications allowed for manual review:
                        As the applications might have arbitrary access to the device, every manually reviewed app will get a source code review.
                    </li>
                </ul>
            </div>
        </div>

        <div class="p-strip">
            <div class="row">
                <h1 v-translate>OpenStore App Content Policy</h1>

                <p v-translate>
                    One of the main goals of the OpenStore is to provide provide a safe app store for people of all ages.
                    To accomplish this goal we do not allow certain types of app to be published.
                    Failure to follow the guidelines will result in your app being removed.
                    Any account with serious infractions may be subject to termination.
                    The OpenStore team thanks you for helping us promote a better enviroment for everyone.
                </p>

                <h2>
                    <span v-translate>Prohibited Apps</span>:
                </h2>

                <ul class="p-list">
                    <li class="p-list__item is-ticked">
                        <b v-translate>Sexually Explicit Content</b>:
                        <span v-translate>
                            Apps containing or promoting sexually explicit contentare not allowed.
                            This includes, but is not limited to, pornography and services promoting sexually explicit content.
                        </span>
                    </li>
                    <li class="p-list__item is-ticked">
                        <b v-translate>Child Endangerment</b>:
                        <span v-translate>
                            Apps containing or promoting child abuse or child sexual abuse are strictly prohibited.
                        </span>
                    </li>
                    <li class="p-list__item is-ticked">
                        <b v-translate>Violence</b>:
                        <span v-translate>
                            Apps containing or promoting gratuitous violence are not allowed.
                            This includes, but is not limited to, violence, terrorism, bomb/weapon making, self harm, and grotesque imagery.
                        </span>
                    </li>
                    <li class="p-list__item is-ticked">
                        <b v-translate>Harassment, Bullying, or Hate Speech</b>:
                        <span v-translate>
                            App containing or promoting any of the above are strictly prohibited.
                        </span>
                    </li>
                    <li class="p-list__item is-ticked">
                        <b v-translate>Gambling</b>:
                        <span v-translate>
                            Apps containing gambling involving real world money transactions are not allowed.
                            This includes, but is not limited to, online casinos, betting, and lotteries.
                        </span>
                    </li>
                    <li class="p-list__item is-ticked">
                        <b v-translate>Illegal Activities</b>:
                        <span v-translate>
                            Apps promoting illegal activities (based on USA law) are not allowed.
                        </span>
                    </li>
                    <li class="p-list__item is-ticked">
                        <b v-translate>Malware</b>:
                        <span v-translate>
                            Apps that are found to be stealing the users data, trying to escalate their privileges without user consent,
                            or executing malicious process are strictly prohibited.
                        </span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="p-strip">
            <div class="row">
                <router-link :to="{name: 'login'}" v-if="!user" class="p-button--positive" v-translate>
                    Login to submit your app
                </router-link>
                <div v-if="user">
                    <h1 v-translate>Submit App</h1>

                    <form class="p-form p-form--stacked">
                        <div class="p-form__group">
                            <label for="id" class="p-form__label" v-translate>App Name</label>
                            <input
                                type="text"
                                id="id"
                                class="p-form__control"
                                :disabled="saving"
                                v-model="id"
                            />
                            <p class="small text-lightgrey" v-translate>
                                This is the unique identifier for your app.
                                It must match exactly the "name" field in your click's manifest.json and must be all lowercase letters.
                                For example: "openstore.openstore-team", where "openstore" is the app and "openstore-team"
                                is the group or individual authoring the app.
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
                            <span v-translate>Submit</span>
                        </a>

                        <router-link class="p-button--neutral" :to="{name: 'manage'}" :disabled="saving">
                            <i class="fa fa-times"></i>
                            <span v-translate>Cancel</span>
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
        title: function() {
            return {inner: this.$gettext('Submit App')};
        },
        meta: function() {
            return opengraph({
                title: `${this.$gettext('Submit App')} - OpenStore`,
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
                    let error = this.$gettext('An unknown error has occured');
                    if (err.response && err.response.data && err.response.data.message) {
                        error = err.response.data.message;
                    }

                    VueNotifications.error({
                        title: this.$gettext('Error'),
                        message: error,
                    });

                    this.saving = false;
                });
            }
        },
    },
};
</script>
