'use strict';

const db = require('../db');
const helpers = require('../utils/helpers');

function setup(app) {
    function updates(req, res) {
        let ids = [];
        if (req.query.apps) {
            ids = req.query.apps.split(',');
        }
        else if (req.body && req.body.apps) {
            ids = req.body.apps;
        }

        if (ids.length > 0) {
            db.Package.find({id: {$in: ids}, published: true}).then((pkgs) => {
                helpers.success(res, pkgs.reduce((value, pkg) => {
                    value[pkg.id] = pkg.version;
                    return value;
                }, {}));
            }).catch(() => {
                helpers.error(res, 'Could not fetch updates at this time');
            });
        }
        else {
            helpers.error(res, 'No apps were specified', 400);
        }
    }

    app.get('/api/v1/apps/updates', updates);
    app.post('/api/v1/apps/updates', updates);
}

exports.setup = setup;
