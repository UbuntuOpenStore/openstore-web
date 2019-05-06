<template>
    <div id="app">
        <header id="navigation" class="p-navigation">
            <div class="row p-navigation__row">
                <div class="p-navigation__banner">
                    <div class="p-navigation__logo">
                        <router-link :to="{name: 'browse'}" class="p-navigation__link">
                            <img src="./assets/logo.svg" alt="" class="p-navigation__image">
                            &nbsp;
                            OpenStore
                        </router-link>
                    </div>
                    <a class="p-navigation__toggle--open" :class="{'u-hide': showMenu}" title="Menu" @click="showMenu = true">
                        <i class="fa fa-bars"></i>
                    </a>
                    <a
                        class="p-navigation__toggle--close"
                        :class="{'u-show': showMenu}"
                        id="close"
                        title="Close Menu"
                        @click="showMenu = false"
                    >
                        <i class="fa fa-times"></i>
                    </a>
                </div>
                <nav class="p-navigation__nav" :class="{'u-show': showMenu}" role="menubar">
                    <ul class="p-navigation__links" role="menu">
                        <li class="p-navigation__link" role="menuitem">
                            <router-link :to="{name: 'submit'}" v-translate>Submit</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem">
                            <router-link :to="{name: 'browse'}" v-translate>Browse</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem">
                            <router-link :to="{name: 'about'}" v-translate>About</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem" v-if="!isAuthenticated">
                            <router-link :to="{name: 'login'}" v-translate>Log In</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem" v-if="isAuthenticated">
                            <router-link :to="{name: 'manage'}" v-translate>Manage</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem" v-if="isAuthenticated">
                            <a href="/auth/logout" v-translate>Log Out</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>

        <div class="row">
            <router-view/>
        </div>

        <footer class="p-footer">
            <div class="row">
                <nav class="p-footer__nav">
                    <ul class="p-footer__links">
                        <li class="p-footer__item">
                            <span class="p-footer__link">
                                <span v-translate>Language</span>:
                                <select
                                    class="language-select"
                                    name="language"
                                    v-model="$language.current"
                                >
                                    <option
                                        v-for="(language, key) in $language.available"
                                        :key="key"
                                        :value="key"
                                    >
                                        {{language}}
                                    </option>
                                </select>
                            </span>
                        </li>

                        <li class="p-footer__item">
                            <router-link :to="{name: 'about'}" class="p-footer__link" v-translate>
                                About Us
                            </router-link>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="/telegram" target="_blank" v-translate>
                                Chat with us on Telegram
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <router-link :to="{name: 'stats'}" class="p-footer__link" v-translate>
                                App Stats
                            </router-link>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://gitlab.com/theopenstore" target="_blank" v-translate>
                                Fork us on GitLab
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://status.open-store.io/" target="_blank" v-translate>
                                Site Status
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://gitlab.com/theopenstore/openstore-meta/issues" target="_blank" v-translate>
                                Report an Issue
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <router-link :to="{name: 'feeds'}" class="p-footer__link" v-translate>
                                RSS Feeds
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

export default {
    name: 'app',
    data() {
        return {
            showMenu: false,
        };
    },
    async created() {
        let language = null;
        if (window.localStorage) {
            language = window.localStorage.getItem('language');
        }

        if (!language) {
            language = window.navigator.language.replace('-', '_');
        }

        if (language && this.$language.available[language]) {
            Vue.config.language = language;
        }
        else {
            language = language.substring(0, language.indexOf('_'));
            if (language && this.$language.available[language]) {
                Vue.config.language = language;
            }
        }

        this.$store.dispatch('getCategories', this.$language.current);

        await this.$store.dispatch('getUser');
        if (this.isAuthenticated && this.$route.name == 'login') {
            this.$router.push({name: 'manage'});
        }
        else if (!this.isAuthenticated && this.$route.path.startsWith('/manage')) {
            this.$router.push({name: 'login'});
        }
    },
    computed: mapState(['isAuthenticated']),
    watch: {
        $route: function() {
            this.showMenu = false;
        },
        '$language.current': function() {
            this.$store.dispatch('getCategories', this.$language.current);

            if (window.localStorage) {
                window.localStorage.setItem('language', this.$language.current);
            }
        },
    },
};
</script>

<style>
#app {
    margin: 0;
}

.p-footer {
    padding-top: 0;
}

.mini-toastr {
    margin-top: 60px;
}

.fullscreen-v-img, .fullscreen-v-img div {
    margin-top: 0;
}

.ml {
    margin-left: 0.5em;
}

.mr {
    margin-right: 0.5em;
}

.language-select {
    margin-left: 0.5rem;
    width: 7rem;
}
</style>
