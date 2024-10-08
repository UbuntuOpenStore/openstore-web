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
        <svgicon icon="external-link" width="1em" height="1em" color="#007aa6" />
      </a>

      <h2 v-translate>Badges</h2>

      <p v-translate>Promote your app on the OpenStore!</p>

      <router-link :to="{name: 'badge'}">
        <span class="mr" v-translate>Get your badge</span>
        <svgicon icon="external-link" width="1em" height="1em" color="#007aa6" />
      </router-link>

      <h2 v-translate>Install</h2>

      <p v-translate>
        The OpenStore app is installed by default on the UBports builds of Ubuntu Touch.
        But if you need to install the OpenStore manually, follow these steps:
      </p>

      <div>
        <button
          class="p-button--neutral"
          v-if="!showInstall"
          @click="showInstall = true"
          v-translate
        >View Install Instructions</button>

        <ol v-if="showInstall">
          <li>
            <router-link
              :to="{name: 'app', params: {id: 'openstore.openstore-team'}}"
              target="_blank"
              v-translate
            >Download the OpenStore App</router-link>
          </li>
          <li v-translate>Open the terminal app</li>
          <li v-translate>Navigate to the downloads folder</li>
          <li>
            <span v-translate>Run the command:</span>
            <copy-line
              value="pkcon install-local --allow-untrusted openstore.openstore-team_latest_armhf.click"
              element-id="install"
            />
          </li>
        </ol>
      </div>

      <h2 v-translate>Contact</h2>

      <p v-translate>
        For any questions you may have or help you may need just chat with us in our telegram group.
        You can also submit issues, bugs, and feature requests to our GitLab bug tracker.
      </p>

      <a href="/telegram">
        <span class="mr" v-translate>OpenStore group on Telegram</span>
        <svgicon icon="external-link" width="1em" height="1em" color="#007aa6" />
      </a>

      <br />

      <a href="https://gitlab.com/theopenstore/openstore-meta/issues">
        <span class="mr" v-translate>Bug Tracker</span>
        <svgicon icon="external-link" width="1em" height="1em" color="#007aa6" />
      </a>

      <h2 v-translate>License</h2>

      <p v-translate>
        The source code for OpenStore related projects is available under the GPL v3.
        You can find the code on the OpenStore GitLab page.
      </p>

      <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">
        <span class="mr" v-translate>GPL v3 License</span>
        <svgicon icon="external-link" width="1em" height="1em" color="#007aa6" />
      </a>

      <br />

      <a href="https://gitlab.com/theopenstore/">
        <span class="mr" v-translate>OpenStore source on GitLab</span>
        <svgicon icon="external-link" width="1em" height="1em" color="#007aa6" />
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
        Any personal data you decide to give us (e.g. your email address when registering for an account to upload your apps)
        goes no further than us,
        and will not be used for anything other than allowing you to maintain your apps and, in rare cases,
        contact you in the event there is an issue with your app.
        Additionally, this site uses cookies to keep you logged in to your account.
      </p>

      <p v-translate>
        Apps uploaded to the OpenStore are subject to our submission rules and content policy.
        You can review the rules and policies before uploading your app.
      </p>

      <router-link :to="{name: 'submit'}" v-translate>Submit your app</router-link>

      <br/>

      <a href="https://bhdouglass.com/blog/how-to-publish-an-ubuntu-touch-app/">
        <span class="mr" v-translate>App Submission Tutorial</span>
        <svgicon icon="external-link" width="1em" height="1em" color="#007aa6" />
      </a>

      <h2 v-translate>Contributors</h2>

      <div>
        <span v-translate>The OpenStore is made possible by many amazing contributors:</span>

        <ul class="p-list">
          <li class="p-list__item">
            <a
              href="https://gitlab.com/theopenstore/openstore-api/-/graphs/master"
              v-translate
            >OpenStore API/Server Contributors</a>
          </li>
          <li class="p-list__item">
            <a
              href="https://gitlab.com/theopenstore/openstore-web/-/graphs/master"
              v-translate
            >OpenStore Website Contributors</a>
          </li>
          <li class="p-list__item">
            <a
              href="https://gitlab.com/theopenstore/openstore-app/-/graphs/master"
              v-translate
            >OpenStore App Contributors</a>
          </li>
          <li class="p-list__item">
            <a
              href="/telegram"
              v-translate
            >And many amazing developers, testers, and users from the OpenStore community!</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Clipboard from 'clipboard';

import opengraph from '@/opengraph';
import CopyLine from '@/components/CopyLine';

export default {
  name: 'About',
  components: { CopyLine },
  head: {
    title() {
      return { inner: this.$gettext('About') };
    },
    meta() {
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
