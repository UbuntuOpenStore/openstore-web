<template>
    <div class="row">
        <h1>Rules for Submission</h1>

        <ul>
            <li>
                Apps not requiring manual review can be submitted by logging in
                with the "Log In" link above.
            </li>
            <li>
                You are only allowed to publish apps that you have permission to
                distribute.
            </li>
            <li>
                You app can be pulled without warning at the discretion of our
                admins. Where possible we will contact you regarding any such
                actions.
            </li>
            <li>
                Apps requiring manual review must be submitted by contacting an
                admin in our
                <a href="/telegram">telegram group</a>.
            </li>
            <li>
                Apps containing NSFW content must be marked as such when
                submitting your app. App icons and app names must not have
                NSFW content.
            </li>
        </ul>

        <h1>Rules for Submissions Requiring Manual Review</h1>
        <ul>
            <li>
                Send us a link to a branch for your app to our
                <a href="https://launchpad.net/~openstore-team">mailing list</a>
                or our
                <a href="/telegram">telegram group</a>.
                along with some instructions on how to build it if they differ
                from the standard (Ubuntu SDK).
            </li>
            <li>
                Give a short explanation why you can’t publish the app without
                extra privileges. No need to go into details, a one liner like "needs to run
                a daemon in the background" will do. List all the special features you have,
                if there are more.
            </li>
            <li>
                If an application could be published without manual review
                if it wouldn’t be for that one cool feature, publish a stripped
                down version! Not everyone will want to install apps with less
                confinement.
            </li>
            <li>
                Only open source applications allowed for manual review: As the
                applications might have arbitrary access to the device, every
                manually reviewed app will get a source code review.
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'Submit',
};
</script>
