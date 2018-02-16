<template>
    <div class="p-strip"><div class="row">
        <h1>Docs</h1>

        <p>
            For any questions you may have or help you may need just chat
            with us in our <a href="/telegram">telegram group</a>.
        </p>

        <div>
            <a id="install"></a>
            <h3>How to Install</h3>
            <ol>
                <li>
                    <router-link :to="{name: 'app', params: {id: 'openstore.openstore-team'}}" target="_blank">
                        Download the OpenStore
                    </router-link>
                </li>
                <li>Open the terminal app</li>
                <li>Navigate to the downloads folder</li>
                <li>Run the command:
                    <div class="p-code-snippet">
                        <input class="p-code-snippet__input" value="pkcon install-local --allow-untrusted openstore.openstore-team_latest_armhf.click" readonly="readonly">
                        <button class="p-code-snippet__action" data-clipboard-target=".p-code-snippet__input">Copy to clipboard</button>
                    </div>
                </li>
            </ol>
        </div>
    </div></div>
</template>

<script>
import opengraph from '@/opengraph';
import Clipboard from 'clipboard';
import Vue from 'vue';

export default {
    name: 'Docs',
    head: {
        title: {inner: 'Docs'},
        meta: function() {
            return opengraph({
                title: 'Docs - OpenStore',
            });
        },
    },
    created() {
        Vue.nextTick().then(() => {
            /* eslint-disable no-new */
            new Clipboard('.p-code-snippet__action');
        });
    },
};
</script>
