'use strict';

const db = require('../db');
const helpers = require('../utils/helpers');
const logger = require('../utils/logger');

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

    app.get(['/api/v1/apps/revision/:id', '/api/v2/apps/revision/:id'], function(req, res) {
        let query = {
            published: true,
            id: req.params.id,
        };

        db.Package.findOne(query).then((pkg) => {
            if (!pkg) {
                helpers.error(res, err, 404);
            }
            else {
                let version = req.query.version ? req.query.version : pkg.version;
                let revision = pkg.revisions.filter((rev) => (rev.version == version))[0];
                revision = revision ? revision.revision : 0;

                helpers.success(res, {
                    id: pkg.id,
                    version: version,
                    revision: revision,
                    latest_version: pkg.version,
                    latest_revision: pkg.revision,
                });
            }
        }).catch((err) => {
            logger.error('Error finding package for revision:', err);
            helpers.error(res, 'Could not fetch app revision at this time');
        });
    });

    function revisionsByVersion(req, res) {
        let versions = [];
        if (req.query.apps) {
            versions = req.query.apps.split(',');
        }
        else if (req.body && req.body.apps) {
            versions = req.body.apps;
        }

        let ids = versions.map((version) => version.split('@')[0]);
        db.Package.find({published: true, id: {$in: ids}}).then((pkgs) => {
            helpers.success(res, pkgs.map((pkg) => {
                let version = versions.filter((v) => (v.split('@')[0] == pkg.id))[0];
                version = version.split('@')[1];

                let revision = pkg.revisions.filter((rev) => (rev.version == version))[0];
                revision = revision ? revision.revision : 0;

                return {
                    id: pkg.id,
                    version: version,
                    revision: revision,
                    latest_version: pkg.version,
                    latest_revision: pkg.revision,
                };
            }));
        }).catch((err) => {
            logger.error('Error finding packages for revision:', err);
            helpers.error(res, 'Could not fetch app revisions at this time');
        });
    }

    app.get(['/api/v1/apps/revision/', '/api/v2/apps/revision/'], revisionsByVersion);
    app.post(['/api/v1/apps/revision/', '/api/v2/apps/revision/'], revisionsByVersion);
}

exports.setup = setup;
