<template>
  <div class="row center">
    <img src="../assets/logo.svg" alt="Login to the OpenStore" class="login-icon" />

    <div class="row">
      <a href="/auth/github" class="p-button--positive">
        <svgicon icon="github" width="1em" height="1em" color="#ffffff" />
        <span class="ml" v-translate>Login via GitHub</span>
      </a>

      <a href="/auth/gitlab" class="p-button--positive">
        <svgicon icon="gitlab" width="1em" height="1em" color="#ffffff" />
        <span class="ml" v-translate>Login via GitLab</span>
      </a>

      <form action="/auth/ubuntu" method="post">
        <button class="p-button--neutral">
          <svgicon icon="ubuntuone" width="1em" height="1em" color="#111111" />
          <span class="ml" v-translate>Login via Ubuntu One</span>
        </button>
      </form>
    </div>
    <div class="row">
      <p>
        <span v-translate>Log in to the OpenStore to be able to manage your apps.</span>
        <br />
        <span v-translate>An account is not needed to download or install apps.</span>
      </p>
    </div>
  </div>
</template>

<script>
import opengraph from '@/opengraph';

export default {
  name: 'Login',
  head: {
    title() {
      return { inner: this.$gettext('Login') };
    },
    meta() {
      return opengraph({
        title: `${this.$gettext('Login')} - OpenStore`,
      });
    },
  },
  created() {
    if (this.$store.state.isAuthenticated) {
      this.$router.push({ name: 'manage' });
    }
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
