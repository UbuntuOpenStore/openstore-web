<template>
    <div class="p-code-snippet">
        <input
            :id="elementId"
            class="p-code-snippet__input"
            :class="{'no-icon': noIcon}"
            :value="value"
            readonly="readonly"
        >
        <button
            class="p-code-snippet__action"
            :data-clipboard-target="target"
            @click.prevent
            v-translate
        >
            Copy to clipboard
        </button>
    </div>
</template>

<script>
export default {
    name: 'Badge',
    props: ['value', 'elementId', 'noIcon'],
    // TODO look at https://github.com/euvl/v-clipboard/blob/master/README.md
    computed: {
        target() {
            return `#${this.elementId}`;
        },
    },
};
</script>

<style scoped>
.no-icon {
    /* Remove the cli icon */
    background-image: none;
    padding: 8px;
}

form * + button {
    margin-top: 0;
}
</style>
