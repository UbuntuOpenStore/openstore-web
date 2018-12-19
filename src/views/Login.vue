<template>
    <div class="row center">
        <img src="../assets/logo.svg" alt="Login to the OpenStore" class="login-icon" />

        <div class="row">
            <a href="/auth/github" class="p-button--positive">
                <i class="fa fa-github"></i>
                <span class="ml" v-translate>Login via GitHub</span>
            </a>

            <a href="/auth/gitlab" class="p-button--positive">
                <i class="fa fa-gitlab"></i>
                <span class="ml" v-translate>Login via GitLab</span>
            </a>

            <form action="/auth/ubuntu" method="post">
                <button class="p-button--neutral">
                    <i class="fa fa-linux"></i>
                    <span class="ml" v-translate>Login via Ubuntu</span>
                </button>
            </form>
        </div>
        <div class="row">
            <p>
                <span v-translate>Log in to the OpenStore to be able to manage your apps.</span>
                <br/>
                <span v-translate>An account is not needed to download or install apps.</span>
            </p>
        </div>
    </div>
</template>

<script>
import api from '@/api';
import opengraph from '@/opengraph';

export default {
    name: 'Login',
    head: {
        title: {inner: 'Login'},
        meta: function() {
            return opengraph({
                title: 'Login - OpenStore',
            });
        },
    },
    created() {
        api.auth.me().then((user) => {
            if (user) {
                // The user is already logged in
                this.$router.push({name: 'manage'});
            }
        });
    },
};
</script>

<style scoped>
    .login-icon {
        width: 92px;
        height: 92px;
        border-radius: 8px;
    }

    .row {
        margin-top: 2em;
    }
</style>
