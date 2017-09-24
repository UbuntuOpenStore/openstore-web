'use strict';

const db = require('../db');
const config = require('../utils/config');
const discoverJSON = require('./json/discover_apps.json');
const helpers = require('../utils/helpers');

const shuffle = require('shuffle-array');
const moment = require('moment');

function setup(app) {
    discoverJSON.highlight.image = config.server.host + discoverJSON.highlight.image;

    let discoverCache = null;
    let discoverDate = null;
    function getDiscover() {
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
                    types: {
                        $in: ['app', 'webapp', 'scope', 'webapp+'],
                    },
                }).limit(10).sort('-published_date'),

                db.Package.find({
                    published: true,
                    types: {
                        $in: ['app', 'webapp', 'scope', 'webapp+'],
                    },
                }).limit(10).sort('-published_date')
            ]).then((results) => {
                discover.highlight.app = results[0];

                staticCategories.forEach((category, index) => {
                    category.apps = results[1][index];
                });

                let newCategory = discover.categories.filter((category) => (category.name == 'New Apps'))[0];
                newCategory.ids = results[2].map((app) => app.id);
                newCategory.apps = results[2];

                let usedCategory = discover.categories.filter((category) => (category.name == 'Updated Apps'))[0];
                usedCategory.ids = results[3].map((app) => app.id);
                usedCategory.apps = results[3];

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
            console.log('cache hit');
            return new Promise((resolve) => {
                resolve(discoverCache);
            });
        }
    }


    app.get(['/api/apps/discover', '/api/v1/apps/discover'], function(req, res) {
        getDiscover().then((discover) => {
            helpers.success(res, discover);
        }).catch(() => {
            helpers.error(res, 'Unable to fetch discovery data at this time');
        });

    });
}

exports.setup = setup;
