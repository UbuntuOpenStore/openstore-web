var db = require('../db');
var config = require('../utils/config');
var packages = require('../utils/packages');
var logger = require('../utils/logger');
var cluster = require('cluster');
var fs = require('fs');

function setup(app) {
    app.get('/api/snaps/search', function(req, res) {
        var query = {
            types: 'snappy',
        };

        if (req.query.q) {
            if (req.query.q.indexOf('package_name:') >= 0) {
                query.id = req.query.q.replace('package_name:', '').replace(/"/g, '');
            }
            else {
                query.id = new RegExp(req.query.q, 'i');
            }
        }

        if (req.headers['x-ubuntu-architecture']) {
            query.architectures = {
                $in: [
                    req.headers['x-ubuntu-architecture'],
                    'all',
                ]
            };
        }

        db.Package.find(query).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkgs) {
            if (err) {
                helpers.error(res, err);
            }
            else {
                var packages = [];
                pkgs.forEach(function(pkg) {
                    packages.push(            {
                        'anon_download_url': config.server.host + '/api/download/' + pkg.id + '/' + pkg.id + '_' + pkg.version + '_' + pkg.architecture + '.snap',
                        'architecture': pkg.architectures,
                        'binary_filesize': pkg.filesize,
                        'channel': 'stable', //TODO allow this to be configured
                        'confinement': 'strict', //TODO allow this to be configured
                        'content': 'application', //TODO allow this to be configured
                        'description': pkg.deacription,
                        'download_sha512': pkg.download_sha512,
                        'download_url': config.server.host + '/api/download/' + pkg.id + '/' + pkg.id + '_' + pkg.version + '_' + pkg.architecture + '.snap',
                        'icon_url': pkg.icon,
                        'last_updated': pkg.updated_date,
                        'origin': pkg.author,
                        'package_name': pkg.id,
                        'prices': {},
                        'publisher': pkg.author,
                        'ratings_average': 0.0,
                        'revision': 1,
                        'snap_id': pkg.id,
                        'summary': pkg.tagline,
                        'version': pkg.version,
                    });
                });

                res.setHeader('content-type', 'application/hal+json');

                //Sending as a buffer to avoid express adding the charset to the content-type (as the snap client doesn't like that)
                res.send(new Buffer(JSON.stringify({
                    '_embedded': {
                        'clickindex:package': packages,
                    }
                })));
            }
        });
    });
}

exports.setup = setup;
