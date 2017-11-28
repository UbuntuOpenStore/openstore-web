<template>
    <div class="row">
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
                <li>Run the command <code>pkcon install-local --allow-untrusted openstore.openstore-team_latest_armhf.click</code></li>
            </ol>
        </div>
    </div>

</template>

<script>
export default {
    name: 'Docs',
};
</script>
