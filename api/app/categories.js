'use strict';

const db = require('../db');
const logger = require('../utils/logger');
const helpers = require('./helpers');
const categoryIcons = require('./category_icons.json');

const _ = require('node-gettext');

let categoryTranslations = {
    'Books & Comics': _('Books & Comics'),
    'Business': _('Business'),
    'Communication': _('Communication'),
    'Developer Tools': _('Developer Tools'),
    'Education': _('Education'),
    'Entertainment': _('Entertainment'),
    'Finance': _('Finance'),
    'Food & Drink': _('Food & Drink'),
    'Games': _('Games'),
    'Graphics': _('Graphics'),
    'Health & Fitness': _('Health & Fitness'),
    'Lifestyle': _('Lifestyle'),
    'Media & Video': _('Media & Video'),
    'Medical': _('Medical'),
    'Music & Audio': _('Music & Audio'),
    'News & Magazines': _('News & Magazines'),
    'Personalisation': _('Personalisation'),
    'Productivity': _('Productivity'),
    'Reference': _('Reference'),
    'Science & Engineering': _('Science & Engineering'),
    'Shopping': _('Shopping'),
    'Social Networking': _('Social Networking'),
    'Sports': _('Sports'),
    'Travel & Local': _('Travel & Local'),
    'Universal Accesss/Accessibility': _('Universal Accesss/Accessibility'),
    'Utilities': _('Utilities'),
    'Weather': _('Weather'),
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
