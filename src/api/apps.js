var db = require('../db');
var config = require('../config');
var packages = require('../packages');
var helpers = require('./helpers');
var upload = require('./upload');
var parse = require('click-parser');
var passport = require('passport');
var multer  = require('multer');
var cluster = require('cluster');
var fs = require('fs');

var mupload = multer({dest: '/tmp'});

function parseFile(pkg, filepath, callback) {
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
            packages.updateInfo(pkg, data);

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
        }
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

            query.architecture = {
                $in: architectures
            };
        }

        db.Package.find(query).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkgs) {
            if (err) {
                helpers.error(res, err);
            }
            else {
                var result = [];
                pkgs.forEach(function(pkg) {
                    var p = packages.toJson(pkg);

                    if (req.isAuthenticated() && req.user && req.user.role == 'admin') {
                        p.downloads = pkg.downloads;
                    }

                    result.push(p);
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
                        console.error(err);
                    }
                    else {
                        res.redirect(301, pkg.package);
                    }
                });
            }
        });
    });

    app.post('/api/apps', passport.authenticate('localapikey', {session: false}), helpers.isAdmin, mupload.single('file'), function(req, res) {
        var pkg = new db.Package();

        if (!req.file) {
            helpers.error(res, 'No file upload specified');
        }
        else if (req.file.originalname.indexOf('.click') == -1) {
            helpers.error(res, 'The file must be a click package');
            fs.unlink(req.file.path);
        }
        else {
            packages.updateInfo(pkg, null, req.body, req.file);
            parseFile(pkg, req.file.path, function(err) {
                if (err) {
                    helpers.error(res, err);
                }
                else {
                    helpers.success(res, packages.toJson(pkg));
                }
            });
        }
    });

    app.put('/api/apps/:id', passport.authenticate('localapikey', {session: false}), helpers.isAdmin, mupload.single('file'), function(req, res) {
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
            if (err) {
                helpers.error(res, err);
            }
            else if (!pkg) {
                helpers.error(res, 'No package found with id "' + req.params.id + '"', 404);
            }
            else if (req.file) {
                if (req.file.originalname.indexOf('.click') == -1) {
                    helpers.error(res, 'The file must be a click package');
                    fs.unlink(req.file.path);
                }
                else {
                    packages.updateInfo(pkg, null, req.body, req.file);
                    parseFile(pkg, req.file.path, function(err) {
                        if (err) {
                            helpers.error(res, err);
                        }
                        else {
                            helpers.success(res, packages.toJson(pkg));
                        }
                    });
                }
            }
            else {
                packages.updateInfo(pkg, null, req.body);
                pkg.save(function(err) {
                    if (err) {
                        helpers.error(res, err);
                    }
                    else {
                        helpers.success(res, packages.toJson(pkg));
                    }
                });
            }
        });
    });

    app.delete('/api/apps/:id', passport.authenticate('localapikey', {session: false}), helpers.isAdmin, function(req, res) {
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
            if (err) {
                helpers.error(res, err);
            }
            else {
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
        });
    });
}

exports.setup = setup;
