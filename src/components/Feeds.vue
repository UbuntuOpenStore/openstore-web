<template>
    <div class="row">
        <div class="p-strip">
            <h1>RSS Feeds</h1>

            <h2>
                <a href="/rss/new.xml">
                    <i class="fa fa-rss"></i>
                </a>
                <a href="/rss/new.xml">
                    New Apps
                </a>
            </h2>

            <h2>
                <a href="/rss/updates.xml">
                    <i class="fa fa-rss"></i>
                </a>
                <a href="/rss/updates.xml">
                    Updated Apps
                </a>
            </h2>
        </div>
    </div>
</template>

<script>
import opengraph from '@/opengraph';

export default {
    name: 'Feeds',
    head: {
        title: {inner: 'Feeds'},
        meta: function() {
            return opengraph({
                title: 'Feeds - OpenStore',
            });
        },
    },
};
</script>

<style scoped>
</style>
