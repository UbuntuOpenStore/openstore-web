<template>
    <div>
        <div class="row">
            <div class="col-4">
                <label for="language" v-translate>Language</label>
                <select v-model="selected" name="language">
                    <option v-for="(lang, code) in languages" :value="code" :key="code">
                        {{lang}}
                    </option>
                </select>
            </div>
        </div>

        <div class="row p-strip">
            <div class="col-small-2 col-medium-3 col-6 center">
                <h2>PNG</h2>

                <div v-if="appId">
                    <a :href="appUrl">
                        <img :src="pngUrl" alt="OpenStore" />
                    </a>

                    <h3>HTML</h3>
                    <copy-line :value="pngHtml" element-id="png-html" no-icon="true" />

                    <h3>Markdown</h3>
                    <copy-line :value="pngMarkdown" element-id="png-markdown" no-icon="true" />
                </div>
                <div v-else>
                    <img :src="pngUrl" alt="OpenStore" />
                    <copy-line :value="pngUrl" element-id="png-url" no-icon="true" />
                </div>
            </div>
            <div class="col-small-2 col-medium-3 col-6 center">
                <h2>SVG</h2>

                <div v-if="appId">
                    <a :href="appUrl">
                        <img class="svg-badge" :src="svgUrl" alt="OpenStore" />
                    </a>

                    <h3>HTML</h3>
                    <copy-line :value="svgHtml" element-id="svg-html" no-icon="true" />

                    <h3>Markdown</h3>
                    <copy-line :value="svgMarkdown" element-id="svg-markdown" no-icon="true" />
                </div>
                <div v-else>
                    <img class="svg-badge" :src="svgUrl" alt="OpenStore" />
                    <copy-line :value="svgUrl" element-id="svg-url" no-icon="true" />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Clipboard from 'clipboard';
import Vue from 'vue';

import CopyLine from '@/components/CopyLine';
import languages from '@/badge-languages.json';

export default {
    name: 'Badge',
    props: ['appId'],
    components: {CopyLine},
    data() {
        return {
            languages: languages,
            selected: 'en_US',
        };
    },
    mounted() {
        Vue.nextTick().then(() => {
            /* eslint-disable no-new */
            new Clipboard('.p-code-snippet__action');
        });
    },
    computed: {
        appUrl() {
            return `${process.env.VUE_APP_DOMAIN}/app/${this.appId}`;
        },
        svgUrl() {
            return `${process.env.VUE_APP_DOMAIN}/badges/${this.selected}.svg`;
        },
        svgHtml() {
            return `<a href="${this.appUrl}"><img src="${this.svgUrl}" alt="OpenStore" /></a>`;
        },
        svgMarkdown() {
            return `[![OpenStore](${this.svgUrl})](${this.appUrl})`;
        },
        pngUrl() {
            return `${process.env.VUE_APP_DOMAIN}/badges/${this.selected}.png`;
        },
        pngHtml() {
            return `<a href="${this.appUrl}"><img src="${this.pngUrl}" alt="OpenStore" /></a>`;
        },
        pngMarkdown() {
            return `[![OpenStore](${this.pngUrl})](${this.appUrl})`;
        },
    },
};
</script>

<style scoped>
.svg-badge {
    width: 182px;
}
</style>
