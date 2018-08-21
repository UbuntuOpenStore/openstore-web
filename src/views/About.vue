<template>
    <div class="p-strip">
        <div class="row">
            <h1>About</h1>

            <p>
                The OpenStore is the official app store for
                <a href="http://ubuntu-touch.io">Ubuntu Touch</a>. It is an open
                source project run by a team of volunteers with help from the
                community. You can discover and install new apps on your Ubuntu
                Touch device. You can also upload and manage your own apps for
                publication. The OpenStore encourages the apps published within
                to be open source, but also accepts proprietary apps.
            </p>

            <h2>Install</h2>

            <p>
                The OpenStore app is installed by default on the
                <a href="https://ubports.com">UBports builds of Ubuntu Touch</a>.
                But if you need to install the OpenStore manually, follow these steps:

                <button class="p-button--neutral" v-if="!showInstall" @click="showInstall = true">
                    View Install Instructions
                </button>

                <ol v-if="showInstall">
                    <li>
                        <router-link :to="{name: 'app', params: {id: 'openstore.openstore-team'}}" target="_blank">
                            Download the OpenStore App
                        </router-link>
                    </li>
                    <li>Open the terminal app</li>
                    <li>Navigate to the downloads folder</li>
                    <li>Run the command:
                        <div class="p-code-snippet">
                            <input
                                class="p-code-snippet__input"
                            value="pkcon install-local --allow-untrusted openstore.openstore-team_latest_armhf.click"
                                readonly="readonly"
                            >
                            <button
                                class="p-code-snippet__action"
                                data-clipboard-target=".p-code-snippet__input"
                            >
                                Copy to clipboard
                            </button>
                        </div>
                    </li>
                </ol>
            </p>

            <h2>Contact</h2>

            <p>
                For any questions you may have or help you may need just chat
                with us in our <a href="/telegram">telegram group</a>. You can
                also submit issues, bugs, and feature requests to our
                <a href="https://github.com/UbuntuOpenStore">GitHub bug tracker</a>.
            </p>

            <h2>License</h2>

            <p>
                The source code for OpenStore related projects is available
                under the <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GPL v3</a>.
                You can find the code on the
                <a href="https://github.com/UbuntuOpenStore/">OpenStore GitHub page</a>.
            </p>

            <p>
                The apps available for download from the OpenStore have their
                own licencing and terms. Consult each individual app's page
                for more information.
            </p>

            <h2>Terms</h2>

            <p>
                The OpenStore a non-profit volunteer project. Although every
                effort is made to ensure that everything in the repository is
                safe to install, you use it AT YOUR OWN RISK. Apps uploaded to
                the OpenStore will be subject to an automated review process
                or a manual review process to check for potential security or
                privacy issues. This checking is far from exhaustive though, and
                there are no guarantees.
            </p>

            <p>
                The OpenStore respects your privacy. We don't track you or your
                device. You do not need an account to download and install apps
                and we do not track your downloads. For developer information we
                count the number of downloads per app revision. Information about
                your device (the cpu architecture, framework versions, OS version,
                and OS language) are sent to the server to allow it to filter apps
                to only what you can install and present your native language
                where possible. This information is not logged or stored and
                cannot be used to uniquely identify you.
            </p>

            <p>
                Any personal data you decide to give us (e.g. your email address
                when registering for an account to upload your apps) goes no
                further than us, and will not be used for anything other than
                allowing you to maintain your apps and, in rare cases, contact
                you in the event there is an issue with your app. Additionally,
                this site uses cookies to keep you logged in to your account.
            </p>

            <p>
                Apps uploaded to the OpenStore are subject to our submission
                rules and content policy. You can review the rules and policies
                before <router-link :to="{name: 'submit'}">uploading your app</router-link>.
            </p>

            <h2>Contributors</h2>

            <p>
                The OpenStore is made possible by many amazing contributors:

                <ul class="p-list">
                    <li class="p-list__item">
                        <a href="https://github.com/UbuntuOpenStore/openstore-api/graphs/contributors">
                            OpenStore API/Server Contributors
                        </a>
                    </li>
                    <li class="p-list__item">
                        <a href="https://github.com/UbuntuOpenStore/openstore-app/graphs/contributors">
                            OpenStore Website Contributors
                        </a>
                    </li>
                    <li class="p-list__item">
                        <a href="https://github.com/UbuntuOpenStore/openstore-web/graphs/contributors">
                            OpenStore App Contributors
                        </a>
                    </li>
                    <li class="p-list__item">
                        And many amazing developers, testers, and users from the
                        <a href="/telegram">OpenStore community</a>!
                    </li>
                </ul>
            </p>
        </div>
    </div>
</template>

<script>
import opengraph from '@/opengraph';
import Clipboard from 'clipboard';
import Vue from 'vue';

export default {
    name: 'About',
    head: {
        title: {inner: 'About'},
        meta: function() {
            return opengraph({
                title: 'About - OpenStore',
            });
        },
    },
    data() {
        return {
            showInstall: false,
        };
    },
    created() {
        Vue.nextTick().then(() => {
            /* eslint-disable no-new */
            new Clipboard('.p-code-snippet__action');
        });
    },
};
</script>
