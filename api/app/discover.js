'use strict';

const db = require('../db');
const config = require('../utils/config');
const discover = require('./json/discover_apps.json');
const helpers = require('../utils/helpers');

const shuffle = require('shuffle-array');

function setup(app) {
    discover.highlight.image = config.server.host + discover.highlight.image;

    let staticCategories = discover.categories.filter((category) => (category.ids.length > 0));
    db.Package.findOne({id: discover.highlight.id}).then((highlightedApp) => {
        discover.highlight.app = highlightedApp;

        return Promise.all(staticCategories.map((category) => {
            return db.Package.find({id: {$in: category.ids}});
        }));
    }).then((results) => {
        staticCategories.forEach((category, index) => {
            category.apps = results[index];
        });

        return db.Package.find({
            published: true,
            types: {
                $in: ['app', 'webapp', 'scope', 'webapp+'],
            },
        }).limit(10).sort('-published_date');
    }).then((newest) => {
        let category = discover.categories.filter((category) => (category.name == 'New Apps'))[0];
        category.ids = newest.map((app) => app.id);
        category.apps = newest;

        return db.Package.find({
            published: true,
            types: {
                $in: ['app', 'webapp', 'scope', 'webapp+'],
            },
        }).limit(10).sort('-updated_date');
    }).then((updated) => {
        let category = discover.categories.filter((category) => (category.name == 'Updated Apps'))[0];
        category.ids = updated.map((app) => app.id);
        category.apps = updated;
    });

    app.get(['/api/apps/discover', '/api/v1/apps/discover'], function(req, res) {
        staticCategories.forEach((category) => {
            category.ids = shuffle(category.ids);
            category.apps = shuffle(category.apps);
        });

        helpers.success(res, discover);
    });
}

exports.setup = setup;
