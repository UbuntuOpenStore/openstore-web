var db = require('../db');
var config = require('../utils/config');
var packages = require('../utils/packages');
var logger = require('../utils/logger');
var helpers = require('./helpers');
var upload = require('./upload');
var parse = require('click-parser');
var passport = require('passport');
var multer  = require('multer');
var cluster = require('cluster');
var fs = require('fs');
var moment = require('moment');
var crypto = require('crypto');

var mupload = multer({dest: '/tmp'});

function parseFileHelper(pkg, filepath, callback) {
    parse(filepath, true, function(err, data) {
        if (err) {
            callback(err);
        }
        else if (!data.name || !data.version || !data.architecture) {
            callback('Malformed manifest');
        }
        else if (pkg.id && pkg.id != data.name) {
            callback('Uploaded manifest does not match package to update');
        }
        else {
            packages.updateInfo(pkg, data, null, null, null, function(pkg) {
                if (pkg._id) {
                    upload.uploadClick(
                        config.smartfile.url,
                        config.smartfile.share,
                        pkg,
                        filepath,
                        data.icon,
                        function(err, url, imgurl) {
                            pkg.package = url;
                            pkg.icon = imgurl;
                            pkg.save(callback);
                        }
                    );
                }
                else { //trying to create a new package, check if one already exists
                    db.Package.findOne({id: data.name}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, p) {
                        if (err) {
                            callback(err);
                        }
                        else if (p) {
                            callback('Package with id "' + data.name + '" already exists');
                        }
                        else {
                            upload.uploadClick(
                                config.smartfile.url,
                                config.smartfile.share,
                                pkg,
                                filepath,
                                data.icon,
                                function(err, url, imgurl) {
                                    pkg.package = url;
                                    pkg.icon = imgurl;
                                    pkg.save(callback);
                                }
                            );
                        }
                    });
                }
            });
        }
    });
}

function parseFile(pkg, filepath, callback) {
    var hash = crypto.createHash('sha512');

    var input = fs.createReadStream(filepath);
    input.on('readable', function() {
        var data = input.read();
        if (data)
            hash.update(data);
        else {
            pkg.download_sha512 = hash.digest('hex');
        }
    });

    input.on('error', function() {
        logger.error('error reading file for sha512');
        pkg.download_sha512 = '';
        parseFileHelper(pkg, filepath, callback)
    });

    input.on('end', function() {
        parseFileHelper(pkg, filepath, callback)
    });
}

function setup(app) {
    app.get('/api/health', function(req, res) {
        helpers.success(res, {
            id: cluster.worker.id
        });
    });

    app.get(['/api/apps', '/api/apps/:id', '/repo/repolist.json'], function(req, res) {
        var query = {};

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

        var q = {
            $and: [
                query,
                {
                    $or: [{deleted: false}, {deleted: {'$exists': false}}],
                },
            ]
        }

        db.Package.find(q).sort('name').exec(function(err, pkgs) {
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
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
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

    app.post('/api/apps', passport.authenticate('localapikey', {session: false}), helpers.isAdminOrTrusted, mupload.single('file'), function(req, res) {
        var pkg = new db.Package();
        pkg.published_date = moment().toISOString();
        pkg.updated_date = moment().toISOString();

        if (!req.file) {
            helpers.error(res, 'No file upload specified');
        }
        else if (req.file.originalname.indexOf('.click') == -1 && req.file.originalname.indexOf('.snap') == -1) {
            helpers.error(res, 'The file must be a click or snap package');
            fs.unlink(req.file.path);
        }
        else {
            if ((req.body && !req.body.maintainer) || req.user.role != 'admin') {
                req.body.maintainer = req.user._id;
            }

            packages.updateInfo(pkg, null, req.body, req.file, null, function(pkg) {
                parseFile(pkg, req.file.path, function(err) {
                    if (err) {
                        helpers.error(res, err);
                    }
                    else {
                        helpers.success(res, packages.toJson(pkg, req));
                    }
                });
            });
        }
    });

    app.put('/api/apps/:id', passport.authenticate('localapikey', {session: false}), mupload.single('file'), function(req, res) {
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
            if (err) {
                helpers.error(res, err);
            }
            else if (!pkg) {
                helpers.error(res, 'No package found with id "' + req.params.id + '"', 404);
            }
            else if (req.file) {
                if (req.file.originalname.indexOf('.click') == -1 && req.file.originalname.indexOf('.snap') == -1) {
                    helpers.error(res, 'The file must be a click or snap package');
                    fs.unlink(req.file.path);
                }
                else {
                    //Admins may edit any package, but trusted users may only edit packages they maintain
                    if (helpers.isAdminOrTrustedOwner(req, pkg)) {
                        if (req.body && req.body.maintainer && req.user.role != 'admin') {
                            delete req.body.maintainer;
                        }

                        pkg.updated_date = moment().toISOString();
                        packages.updateInfo(pkg, null, req.body, req.file, null, function(pkg) {
                            parseFile(pkg, req.file.path, function(err) {
                                if (err) {
                                    helpers.error(res, err);
                                }
                                else {
                                    helpers.success(res, packages.toJson(pkg, req));
                                }
                            });
                        });
                    }
                    else {
                        helpers.error(res, 'Forbidden', 403);
                        fs.unlink(req.file.path);
                    }
                }
            }
            else {
                //Admins may edit any package, but trusted users may only edit packages they maintain
                if (helpers.isAdminOrTrustedOwner(req, pkg)) {
                    pkg.updated_date = moment().toISOString();

                    packages.updateInfo(pkg, null, req.body, null, null, function(pkg) {
                        pkg.save(function(err) {
                            if (err) {
                                helpers.error(res, err);
                            }
                            else {
                                helpers.success(res, packages.toJson(pkg, req));
                            }
                        });
                    });

                }
                else {
                    helpers.error(res, 'Forbidden', 403);
                }
            }
        });
    });

    app.delete('/api/apps/:id', passport.authenticate('localapikey', {session: false}), function(req, res) {
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
            if (err) {
                helpers.error(res, err);
            }
            else {
                //Admins may delete any package, but trusted users may only delete packages they maintain
                if (helpers.isAdminOrTrustedOwner(req, pkg)) {
                    pkg.deleted = true;
                    pkg.save(function(err) {
                        if (err) {
                            helpers.error(res, err);
                        }
                        else {
                            helpers.success(res, null);
                        }
                    });
                }
                else {
                    helpers.error(res, 'Forbidden', 403);
                }
            }
        });
    });
}

exports.setup = setup;
