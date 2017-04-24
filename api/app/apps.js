'use strict';

const db = require('../db');
const config = require('../utils/config');
const packages = require('../utils/packages');
const logger = require('../utils/logger');
const helpers = require('./helpers');
const upload = require('./upload');
const parse = require('../utils/click-parser-async');
const checksum = require('../utils/checksum');
const reviewPackage = require('../utils/review-package');

const passport = require('passport');
const multer  = require('multer');
const cluster = require('cluster');
const fs = require('fs');
const moment = require('moment');
const crypto = require('crypto');
const exec = require('child_process').exec;
const bluebird = require('bluebird');

bluebird.promisifyAll(fs);
const mupload = multer({dest: '/tmp'});

const NEEDS_MANUAL_REVIEW = 'This app needs to be reviewed manually';
const MALFORMED_MANIFEST = 'Your package manifest is malformed';
const DUPLICATE_PACKAGE = 'A package with the same name already exists';
const PERMISSION_DENIED = 'You do not have permission to update this app';

function setup(app) {
    app.get('/api/health', function(req, res) {
        helpers.success(res, {
            id: cluster.worker.id
        });
    });

    app.get(['/api/apps', '/api/apps/:id', '/repo/repolist.json'], function(req, res) {
        var query = {published: true};

        if (req.params.id) {
            query.id = req.params.id;
        }
        else {
            if (req.query.types && Array.isArray(req.query.types)) {
                query['types'] = {
                    $in: req.query.types,
                };
            }
            else if (req.query.types) {
                query['types'] = req.query.types;
            }
            else {
                query['types'] = {
                    $in: ['app', 'webapp', 'scope'],
                };
            }
        }

        if (req.query.frameworks) {
            var frameworks = req.query.frameworks.split(',');
            query.framework = {
                $in: frameworks
            };
        }

        if (req.query.architecture) {
            var architectures = [req.query.architecture];
            if (req.query.architecture != 'all') {
                architectures.push('all');
            }

            query.$or = [
                {architecture: {$in: architectures}},
                {architectures: {$in: architectures}},
            ];
        }

        db.Package.find(query).sort('name').exec(function(err, pkgs) {
            if (err) {
                helpers.error(res, err);
            }
            else {
                var result = [];
                pkgs.forEach(function(pkg) {
                    result.push(packages.toJson(pkg, req));
                });

                if (req.params.id) {
                    if (result.length > 0) {
                        result = result[0];
                    }
                    else {
                        return helpers.error(res, 'App not found', 404);
                    }
                }

                if (req.originalUrl == '/repo/repolist.json') {
                    res.send({
                        success: true,
                        message: null,
                        packages: result,
                    });
                }
                else {
                    helpers.success(res, result);
                }
            }
        });
    });

    app.get('/api/download/:id/:click', function(req, res) {
        db.Package.findOne({id: req.params.id, published: trye}).exec(function(err, pkg) {
            if (err) {
                helpers.error(res, err);
            }
            else if (!pkg) {
                helpers.error(res, 'Package not found', 404);
            }
            else {
                var version = 'v' + pkg.version.replace(/\./g, '__');
                var inc = {};
                inc['downloads.' + version] = 1;

                db.Package.update({_id: pkg._id}, {$inc: inc}, function(err) {
                    if (err) {
                        logger.error(err);
                    }
                    else {
                        res.redirect(301, pkg.package);
                    }
                });
            }
        });
    });

    app.get('/api/manage/apps', passport.authenticate('localapikey', {session: false}), function(req, res) {
        let query = null;
        if (helpers.isAdminUser(req)) {
            query = db.Package.find({});
        }
        else {
            query = db.Package.find({maintainer: req.user._id});
        }

        query.sort('name').then((pkgs) => {
            let result = pkgs.map((pkg) => {
                return packages.toJson(pkg, req);
            });

            helpers.success(res, result);
        }).catch((err) => {
            logger.error('Error fetching packages:', err);
            helpers.error(res, 'Could not fetch app list at this time');
        });
    });

    app.get('/api/manage/apps/:id', passport.authenticate('localapikey', {session: false}), function(req, res) {
        let query = null;
        if (helpers.isAdminUser(req)) {
            query = db.Package.findOne({id: req.params.id});
        }
        else {
            query = db.Package.findOne({id: req.params.id, maintainer: req.user._id});
        }

        query.then((pkg) => {
            helpers.success(res, packages.toJson(pkg, req));
        }).catch((err) => {
            helpers.error(res, 'App not found', 404);
        });
    });

    app.post(['/api/apps', '/api/manage/apps'], passport.authenticate('localapikey', {session: false}), mupload.single('file'), function(req, res) {
        if (!req.file) {
            helpers.error(res, 'No file upload specified');
        }
        else if (
            !req.file.originalname.endsWith('.click') &&
            !req.file.originalname.endsWith('.snap')
        ) {
            helpers.error(res, 'The file must be a click or snap package');
            fs.unlink(req.file.path);
        }
        else {
            let filePath = req.file.path;
            //Rename the file so click-review doesn't freak out
            if (req.file.originalname.endsWith('.click')) {
                filePath += '.click';
            }
            else {
                filePath += '.snap';
            }

            fs.renameAsync(req.file.path, filePath).then(() => {
                if (helpers.isAdminOrTrustedUser(req)) {
                    return false; //Admin & trusted users can upload apps without manual review
                }
                else {
                    return reviewPackage(filePath);
                }
            }).then((needsManualReview) => {
                if (needsManualReview) {
                    throw NEEDS_MANUAL_REVIEW;
                }

                let parsePromise = parse(filePath, true);
                let existingPromise = parsePromise.then((parseData) => {
                    if (!parseData.name || !parseData.version || !parseData.architecture) {
                        throw MALFORMED_MANIFEST;
                    }

                    return db.Package.findOne({id: parseData.name});
                });

                return Promise.all([
                    parsePromise,
                    existingPromise,
                    checksum(filePath),
                ]);
            }).then((results) => {
                let parseData = results[0];
                let existing = results[1];
                let checksum = results[2];

                if (existing) {
                    console.log(existing);
                    throw DUPLICATE_PACKAGE;
                }

                if (req.body && !req.body.maintainer) {
                    req.body.maintainer = req.user._id;
                }

                let pkg = new db.Package();
                packages.updateInfo(pkg, parseData, req.body, filePath);

                return upload.uploadPackage(
                    config.smartfile.url,
                    config.smartfile.share,
                    pkg,
                    filePath,
                    parseData.icon
                );
            }).then((pkg) => {
                return pkg.save();
            }).then((pkg) => {
                helpers.success(res, packages.toJson(pkg, req));
            }).catch((err) => {
                if (err == NEEDS_MANUAL_REVIEW || err == MALFORMED_MANIFEST || err == DUPLICATE_PACKAGE) {
                    helpers.error(res, err, 400);
                }
                else {
                    logger.error('Error parsing new package:', err);
                    helpers.error(res, 'There was an error creating your app, please try again later');
                }
            });
        }
    });

    app.put(['/api/apps/:id', '/api/manage/apps/:id'], passport.authenticate('localapikey', {session: false}), mupload.single('file'), function(req, res) {
        /*letpackagePromise = db.Package.findOne({id: req.params.id})

        return packagePromise.then((pkg) => {
            if (helpers.isAdminUser(req) || req.user._id == pkg.maintainer) {
                if (req.file) {
                    //TODO
                }
                else {
                    packages.updateInfo(pkg, null, req.body, null);
                    return pkg.save();
                }
            }
            else {
                throw PERMISSION_DENIED;
            }
        }).then((pkg) => {
            helpers.success(res, packages.toJson(pkg, req));
        }).catch((err) => {
            if (err == PERMISSION_DENIED || err == NEEDS_MANUAL_REVIEW || err == MALFORMED_MANIFEST) {
                helpers.error(res, err, 400);
            }
            else {
                logger.error('Error updating package:', err);
                helpers.error(res, 'There was an error updating your app, please try again later');
            }
        });*/
    });
}

exports.setup = setup;
