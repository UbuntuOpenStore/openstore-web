'use strict';

const db = require('../db');
const logger = require('../utils/logger');
const helpers = require('./helpers');
const categoryIcons = require('./category_icons.json');

const Gettext = require('node-gettext');
let gt = new Gettext();

let categoryTranslations = {
    'Books & Comics': gt.gettext('Books & Comics'),
    'Business & Finance': gt.gettext('Business & Finance'),
    'Communication & Social': gt.gettext('Communication & Social'),
    'Developer Tools': gt.gettext('Developer Tools'),
    'Education & Reference': gt.gettext('Education & Reference'),
    'Entertainment': gt.gettext('Entertainment'),
    'Food & Drink': gt.gettext('Food & Drink'),
    'Games': gt.gettext('Games'),
    'Graphics': gt.gettext('Graphics'),
    'Health & Fitness': gt.gettext('Health & Fitness'),
    'Lifestyle': gt.gettext('Lifestyle'),
    'Media & Video': gt.gettext('Media & Video'),
    'Medical': gt.gettext('Medical'),
    'Music & Audio': gt.gettext('Music & Audio'),
    'News & Magazines': gt.gettext('News & Magazines'),
    'Personalisation': gt.gettext('Personalisation'),
    'Productivity': gt.gettext('Productivity'),
    'Science & Engineering': gt.gettext('Science & Engineering'),
    'Shopping': gt.gettext('Shopping'),
    'Sports': gt.gettext('Sports'),
    'Travel & Local': gt.gettext('Travel & Local'),
    'Universal Accesss/Accessibility': gt.gettext('Universal Accesss/Accessibility'),
    'Utilities': gt.gettext('Utilities'),
}

function setup(app) {
    app.get(['/api/categories', '/api/v1/categories'], function(req, res) {
        db.Package.aggregate([
            {
                $group: {
                    _id: '$category',
                },
            }, {
                $sort: {'_id': 1},
            }
        ], (err, data) => {
            if (err) {
                logger.error('Error fetching categories:', err);
                helpers.error(res, 'Could not fetch category list at this time');
            }
            else {
                let categories = [];
                data.forEach((category) => {
                    if (category._id) {
                        categories.push(category._id);
                    }
                });

                helpers.success(res, categories);
            }
        });
    });

    app.get('/api/v2/categories', function(req, res) {
        db.Package.aggregate([
            {
                $match: {types: {$ne: 'snappy'}}
            }, {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                },
            }, {
                $sort: {'_id': 1},
            }
        ], (err, categories) => {
            if (err) {
                logger.error('Error fetching categories:', err);
                helpers.error(res, 'Could not fetch category list at this time');
            }
            else {
                let data = [];
                categories.forEach((category) => {
                    if (category._id) {
                        data.push({
                            category: category._id,
                            count: category.count,
                            icon: categoryIcons[category._id],
                        })
                    }
                });

                helpers.success(res, data);
            }
        });
    });
}

exports.setup = setup;
