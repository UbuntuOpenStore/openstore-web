<template>
    <div class="row center">
        <img src="../assets/logo.svg" alt="Login to the OpenStore" class="login-icon" />

        <div class="row">
            <a href="/auth/github" class="p-button--positive">
                <i class="fa fa-github"></i>
                Login via GitHub
            </a>

            <form action="/auth/ubuntu" method="post">
                <button class="p-button--neutral">
                    <i class="fa fa-linux"></i>
                    Login via Ubuntu
                </button>
            </form>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Login',
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
