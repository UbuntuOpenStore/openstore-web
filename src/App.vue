<template>
    <div id="app">
        <header id="navigation" class="p-navigation">
            <div class="row p-navigation__row">
                <div class="p-navigation__banner">
                    <div class="p-navigation__logo">
                        <a class="p-navigation__link" href="/">
                            <img src="./assets/logo.svg" alt="" class="p-navigation__image">
                            &nbsp;
                            OpenStore
                        </a>
                    </div>
                    <a href="#navigation" class="p-navigation__toggle--open" title="menu">
                        <i class="fa fa-menu"></i>
                    </a>
                    <a href="#navigation-closed" class="p-navigation__toggle--close" title="close menu">
                        <i class="fa fa-menu"></i>
                    </a>
                </div>
                <nav class="p-navigation__nav" role="menubar">
                    <span class="u-off-screen">
                        <a href="#main-content">Jump to main content</a>
                    </span>
                    <ul class="p-navigation__links" role="menu">
                        <li class="p-navigation__link" role="menuitem"><a href="#">Submit</a></li>
                        <li class="p-navigation__link" role="menuitem"><router-link :to="{name: 'browse'}">Browse</router-link></li>
                        <li class="p-navigation__link" role="menuitem"><router-link :to="{name: 'browse_snaps'}">Browse Snaps</router-link></li>
                        <li class="p-navigation__link" role="menuitem"><router-link :to="{name: 'docs'}">Docs</router-link></li>
                        <li class="p-navigation__link" role="menuitem"><a href="#">Log In</a></li>
                        <!--TODO <li class="p-navigation__link" role="menuitem"><a href="#">Manage</a></li>-->
                        <!--TODO <li class="p-navigation__link" role="menuitem"><a href="#">Log Out</a></li>-->
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
                            <a class="p-footer__link" href="/telegram">Chat with us on Telegram</a>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://github.com/UbuntuOpenStore">Fork us on Github</a>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="http://status.uappexplorer.com/">Site Status</a>
                        </li>
                        <li class="p-footer__item">
                            <a class="p-footer__link" href="https://github.com/UbuntuOpenStore/openstore-meta/issues">Report an Issue</a>
                        </li>
                    </ul>
                    <span class="u-off-screen">
                        <a href="#">Go to the top of the page</a>
                    </span>
                </nav>
            </div>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'app',
};
</script>

<style scoped>
    .p-footer {
        padding-top: 0;
    }
</style>
