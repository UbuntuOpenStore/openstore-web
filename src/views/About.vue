<template>
    <div class="p-strip">
        <div class="row">
            <h1 v-translate>About</h1>

            <p v-translate>
                The OpenStore is the official app store for Ubuntu Touch.
                It is an open source project run by a team of volunteers with help from the community.
                You can discover and install new apps on your Ubuntu Touch device.
                You can also upload and manage your own apps for publication.
                The OpenStore encourages the apps published within to be open source, but also accepts proprietary apps.
            </p>

            <a href="http://ubuntu-touch.io">
                <span class="mr" v-translate>Ubuntu Touch</span>
                <i class="fa fa-external-link"></i>
            </a>

            <h2 v-translate>Install</h2>

            <p v-translate>
                The OpenStore app is installed by default on the UBports builds of Ubuntu Touch.
                But if you need to install the OpenStore manually, follow these steps:
            </p>

            <p>
                <button class="p-button--neutral" v-if="!showInstall" @click="showInstall = true" v-translate>
                    View Install Instructions
                </button>

                <ol v-if="showInstall">
                    <li>
                        <router-link :to="{name: 'app', params: {id: 'openstore.openstore-team'}}" target="_blank" v-translate>
                            Download the OpenStore App
                        </router-link>
                    </li>
                    <li v-translate>Open the terminal app</li>
                    <li v-translate>Navigate to the downloads folder</li>
                    <li>
                        <span v-translate>Run the command:</span>
                        <div class="p-code-snippet">
                            <input
                                class="p-code-snippet__input"
                            value="pkcon install-local --allow-untrusted openstore.openstore-team_latest_armhf.click"
                                readonly="readonly"
                            >
                            <button
                                class="p-code-snippet__action"
                                data-clipboard-target=".p-code-snippet__input"
                                v-translate
                            >
                                Copy to clipboard
                            </button>
                        </div>
                    </li>
                </ol>
            </p>

            <h2 v-translate>Contact</h2>

            <p v-translate>
                For any questions you may have or help you may need just chat with us in our telegram group.
                You can also submit issues, bugs, and feature requests to our GitHub bug tracker.
            </p>

            <a href="/telegram">
                <span class="mr" v-translate>OpenStore group on Telegram</span>
                <i class="fa fa-external-link"></i>
            </a>

            <br/>

            <a href="https://github.com/UbuntuOpenStore">
                <span class="mr" v-translate>Bug Tracker</span>
                <i class="fa fa-external-link"></i>
            </a>

            <h2 v-translate>License</h2>

            <p v-translate>
                The source code for OpenStore related projects is available under the GPL v3.
                You can find the code on the OpenStore GitHub page.
            </p>

            <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">
                <span v-translate>GPL v3 License</span>
                <i class="fa fa-external-link"></i>
            </a>

            <br/>

            <a href="https://github.com/UbuntuOpenStore/">
                <span v-translate>OpenStore source on GitHub</span>
                <i class="fa fa-external-link"></i>
            </a>

            <p v-translate>
                The apps available for download from the OpenStore have their own licencing and terms.
                Consult each individual app's page for more information.
            </p>

            <h2 v-translate>Terms</h2>

            <p v-translate>
                The OpenStore a non-profit volunteer project.
                Although every effort is made to ensure that everything in the repository is safe to install, you use it AT YOUR OWN RISK.
                Apps uploaded to the OpenStore will be subject to an automated review process or
                a manual review process to check for potential security or privacy issues.
                This checking is far from exhaustive though, and there are no guarantees.
            </p>

            <p v-translate>
                The OpenStore respects your privacy.
                We don't track you or your device.
                You do not need an account to download and install apps and we do not track your downloads.
                For developer information we count the number of downloads per app revision.
                Information about your device (the cpu architecture, framework versions, OS version, and OS language)
                are sent to the server to allow it to filter apps to only what you can install and present your native language where possible.
                This information is not logged or stored and cannot be used to uniquely identify you.
            </p>

            <p v-translate>
                Any personal data you decide to give us (e.g. your email address when registering for an account to upload your apps) goes no further than us,
                and will not be used for anything other than allowing you to maintain your apps and, in rare cases,
                contact you in the event there is an issue with your app.
                Additionally, this site uses cookies to keep you logged in to your account.
            </p>

            <p v-translate>
                Apps uploaded to the OpenStore are subject to our submission rules and content policy.
                You can review the rules and policies before uploading your app.
            </p>

            <router-link :to="{name: 'submit'}" v-translate>
                Submit your app
            </router-link>

            <h2 v-translate>Contributors</h2>

            <p>
                <span v-translate>The OpenStore is made possible by many amazing contributors:</span>

                <ul class="p-list">
                    <li class="p-list__item">
                        <a href="https://github.com/UbuntuOpenStore/openstore-api/graphs/contributors" v-translate>
                            OpenStore API/Server Contributors
                        </a>
                    </li>
                    <li class="p-list__item">
                        <a href="https://github.com/UbuntuOpenStore/openstore-app/graphs/contributors" v-translate>
                            OpenStore Website Contributors
                        </a>
                    </li>
                    <li class="p-list__item">
                        <a href="https://github.com/UbuntuOpenStore/openstore-web/graphs/contributors" v-translate>
                            OpenStore App Contributors
                        </a>
                    </li>
                    <li class="p-list__item">
                        <a href="/telegram" v-translate>
                            And many amazing developers, testers, and users from the OpenStore community!
                        </a>
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
        title: function() {
            return {inner: this.$gettext('About')};
        },
        meta: function() {
            return opengraph({
                title: `${this.$gettext('About')} - OpenStore`,
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
