'use strict';

const db = require('../db');
const config = require('../utils/config');
const discoverJSON = require('./json/discover_apps.json');
const helpers = require('../utils/helpers');
const packages = require('../utils/packages');

const shuffle = require('shuffle-array');
const moment = require('moment');

function setup(app) {
    discoverJSON.highlight.image = config.server.host + discoverJSON.highlight.image;

    let discoverCache = null;
    let discoverDate = null;
    function getDiscover(req) {
        let now = moment();
        if (!discoverDate || now.diff(discoverDate, 'minutes') > 10 || !discoverCache) { //Cache miss
            let discover = JSON.parse(JSON.stringify(discoverJSON));
            let staticCategories = discover.categories.filter((category) => (category.ids.length > 0));

            return Promise.all([
                db.Package.findOne({id: discover.highlight.id}),

                Promise.all(staticCategories.map((category) => {
                    return db.Package.find({id: {$in: category.ids}});
                })),

                db.Package.find({
                    published: true,
                    nsfw: {$in: [null, false]},
                    types: {
                        $in: ['app', 'webapp', 'scope', 'webapp+'],
                    },
                }).limit(8).sort('-published_date'),

                db.Package.find({
                    published: true,
                    nsfw: {$in: [null, false]},
                    types: {
                        $in: ['app', 'webapp', 'scope', 'webapp+'],
                    },
                }).limit(8).sort('-published_date')
            ]).then((results) => {
                discover.highlight.app = packages.toJson(results[0], req);

                staticCategories.forEach((category, index) => {
                    category.apps = results[1][index];
                });

                let category = discover.categories.filter((category) => (category.name == 'New and Updated Apps'))[0];
                let ids = results[2].map((app) => app.id).concat(results[3].map((app) => app.id));
                ids = ids.filter(function(item, pos) {
                    //Only unique ids;
                    return ids.indexOf(item) == pos;
                });
                category.ids = ids.slice(0, 10);

                let apps = results[2].concat(results[3]);
                category.apps = category.ids.map((id) => {
                    return apps.filter((app) => (app.id == id))[0];
                });
                category.apps = category.apps.map((app) => packages.toJson(app, req));

                staticCategories.forEach((category) => {
                    category.ids = shuffle(category.ids);
                    category.apps = shuffle(category.apps);
                });

                discoverCache = discover;
                discoverDate = now;
                return discover;
            });
        }
        else { //Cache hit
            return new Promise((resolve) => {
                resolve(discoverCache);
            });
        }
    }

    app.get(['/api/apps/discover', '/api/v1/apps/discover'], function(req, res) {
        getDiscover(req).then((discover) => {
            helpers.success(res, discover);
        }).catch(() => {
            helpers.error(res, 'Unable to fetch discovery data at this time');
        });

    });
}

exports.setup = setup;
