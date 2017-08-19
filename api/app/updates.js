'use strict';

const db = require('../db');
const helpers = require('../utils/helpers');

function setup(app) {
    function updates(req, res, byRevision) {
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
                    if (byRevision) {
                        value[pkg.id] = pkg.revision;
                    }
                    else {
                        value[pkg.id] = pkg.version;
                    }

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

    function updatesByVersion(req, res) {
        return updates(req, res, false);
    }
    function updatesByRevision(req, res) {
        return updates(req, res, true);
    }

    app.get('/api/v1/apps/updates', updatesByVersion);
    app.post('/api/v1/apps/updates', updatesByVersion);

    app.get('/api/v2/apps/updates', updatesByRevision);
    app.post('/api/v2/apps/updates', updatesByRevision);
}

exports.setup = setup;
