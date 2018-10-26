<template>
    <span>
        <span v-for="type in types" :key="type">
            <span v-if="type == 'app'" class="label app-label">App</span>
            <span v-if="type == 'scope'" class="label scope-label">Scope</span>
            <span v-if="type == 'webapp'" class="label webapp-label">Web App</span>
            <span v-if="type == 'webapp+'" class="label webapp-label">Web App+</span>
        </span>
    </span>
</template>

<script>
export default {
    name: 'Types',
    props: ['types'],
};
</script>

<style scoped>
    .label {
        color: #FFFFFF;
        font-size: 0.75rem;
        font-weight: bold;
        text-align: center;
        padding: 0.1rem 0.2rem;

        border-radius: .125rem;
        border-style: solid;
        border-width: 1px;
        border-color: #333333;
    }

    .app-label {
        background-color: #1ab6ef;
        border-color: #1ab6ef;
    }

    .scope-label {
        background-color: #dd4814;
        border-color: #dd4814;
    }

    .webapp-label {
        background-color: #888888;
        border-color: #888888;
    }
</style>
