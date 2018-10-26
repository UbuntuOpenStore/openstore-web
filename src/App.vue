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
                            <router-link :to="{name: 'submit'}">Submit</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem">
                            <router-link :to="{name: 'browse'}">Browse</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem">
                            <router-link :to="{name: 'about'}">About</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem" v-if="!user">
                            <router-link :to="{name: 'login'}">Log In</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem" v-if="user">
                            <router-link :to="{name: 'manage'}">Manage</router-link>
                        </li>
                        <li class="p-navigation__link" role="menuitem" v-if="user">
                            <a href="/auth/logout">Log Out</a>
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
                            <router-link :to="{name: 'about'}" class="p-footer__link">
                                About Us
                            </router-link>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="/telegram" target="_blank">
                                Chat with us on Telegram
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <router-link :to="{name: 'stats'}" class="p-footer__link">
                                App Stats
                            </router-link>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://github.com/UbuntuOpenStore" target="_blank">
                                Fork us on Github
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://status.open-store.io/" target="_blank">
                                Site Status
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://github.com/UbuntuOpenStore/openstore-meta/issues" target="_blank">
                                Report an Issue
                            </a>
                        </li>
                        <li class="p-footer__item">
                            <router-link :to="{name: 'feeds'}" class="p-footer__link">
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
import api from '@/api';

export default {
    name: 'app',
    data() {
        return {
            user: null,
            showMenu: false,
        };
    },
    created() {
        api.auth.me().then((user) => {
            this.user = user;
        });
    },
    watch: {
        $route: function() {
            this.showMenu = false;
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
</style>
