'use strict';

const db = require('../db');
const config = require('../utils/config');
const discover = require('./json/discover_apps.json');
const helpers = require('../utils/helpers');

const shuffle = require('shuffle-array');

function setup(app) {
    discover.highlight.image = config.server.host + discover.highlight.image;

    let promises = [
        db.Package.findOne({id: discover.highlight.id}),
    ];
    promises = promises.concat(discover.categories.map((category) => {
        return db.Package.find({id: {$in: category.ids}});
    }));

    Promise.all(promises).then((results) => {
        discover.highlight.app = results[0];

        discover.categories.forEach((category, index) => {
            category.apps = results[index + 1];
        });
    });

    app.get(['/api/apps/discover', '/api/v1/apps/discover'], function(req, res) {
        discover.categories.forEach((category) => {
            category.ids = shuffle(category.ids);
            category.apps = shuffle(category.apps);
        });

        helpers.success(res, discover);
    });
}

exports.setup = setup;
