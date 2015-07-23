var db = require('./db');
var config = require('./config');
var packages = require('./packages');
var parse = require('click-parser');
var passport = require('passport');
var multer  = require('multer');
var request = require('request');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');
var lwip = require('lwip');

function success(res, data, message) {
    res.send({
        success: true,
        data: data,
        message: message ? message : null
    });
}

function error(res, message, code) {
    console.error('server: ' + message);

    res.status(code ? code : 500);
    res.send({
        success: false,
        data: null,
        message: message
    });
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.role == 'admin') {
        next();
    }
    else {
        error(res, 'Forbidden', 403);
    }
}

function uploadToSmartfile(filepath, filename, callback) {
    var headers = {
        'Authorization': 'Basic ' + new Buffer(config.smartfile.key + ':' + config.smartfile.password).toString('base64'),
    };

    var formData = {
        file: {
            value: fs.createReadStream(filepath),
            options: {
                filename: filename
            }
        }
    };

    request.post({
        url: config.smartfile.url,
        formData: formData,
        headers: headers,
    }, function(err, response) {
        if (err) {
            callback(err);
        }
        else if (response.statusCode != 200) {
            callback('Could not upload "' + filename + '" to smartfile, error code ' + response.statusCode);
        }
        else {
            callback(null, config.smartfile.share + filename);
        }
    });
}

function setup(app) {
    app.use(multer({dest: '/tmp'}));

    app.get('/api/health', function(req, res) {
        success(res, {
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

        db.Package.find(query).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, packages) {
            if (err) {
                error(res, err);
            }
            else {
                var result = [];
                packages.forEach(function(pkg) {
                    result.push({
                        apparmor: pkg.apparmor ? pkg.apparmor : {},
                        architecture: pkg.architecture ? pkg.architecture : '',
                        author: pkg.author ? pkg.author : '',
                        category: pkg.category ? pkg.category : '',
                        description: pkg.description ? pkg.description : '',
                        filesize: pkg.filesize ? pkg.filesize : 0,
                        framework: pkg.framework ? pkg.framework : '',
                        icon: pkg.icon ? pkg.icon : '',
                        id: pkg.id ? pkg.id : '',
                        license: pkg.license ? pkg.license : '',
                        manifest: pkg.manifest ? pkg.manifest : {},
                        name: pkg.name ? pkg.name : '',
                        //package: config.server.host + '/api/download/' + pkg.id + '/' + pkg.id + '_' + pkg.version + '_' + pkg.architecture + '.click',
                        package: pkg.package ? pkg.package : '',
                        permissions: pkg.permissions ? pkg.permissions: [],
                        source: pkg.source ? pkg.source : '',
                        tagline: pkg.tagline ? pkg.tagline : '',
                        types: pkg.types ? pkg.types : [],
                        version: pkg.version ? pkg.version : '',
                    });
                });

                if (req.params.id) {
                    if (result.length > 0) {
                        result = result[0];
                    }
                    else {
                        return error(res, 'App not found', 404);
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
                    success(res, result);
                }
            }
        });
    });

    function saveClick(req, res, pkg, data, file) {
        var filename = data.name + '_' + data.version + '_' + data.architecture + '.click';
        uploadToSmartfile(file.path, filename, function(err, url) {
            fs.unlink(file.path);

            if (err) {
                error(res, err);
            }
            else {
                packages.updateInfo(pkg, data, req.body, file, url);

                if (data.icon) {
                    var iconname = data.name + path.extname(data.icon);

                    if (data.icon.substring(data.icon.length - 4) == '.png') {
                        lwip.open(data.icon, function(err, image) {
                            if (err) {
                                error(res, err);
                            }
                            else {
                                image.batch()
                                    .resize(92, 92)
                                    .writeFile(data.icon, function(err) {
                                        if (err) {
                                            error(res, err);
                                        }
                                        else {
                                            uploadToSmartfile(data.icon, iconname, function(err, url) {
                                                fs.unlink(data.icon);
                                                if (err) {
                                                    error(res, err);
                                                }
                                                else {
                                                    pkg.icon = url;

                                                    pkg.save(function(err) {
                                                        if (err) {
                                                            error(res, err);
                                                        }
                                                        else {
                                                            success(res, pkg);
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                            }
                        });
                    }
                    else {
                        uploadToSmartfile(data.icon, iconname, function(err, url) {
                            fs.unlink(data.icon);
                            if (err) {
                                error(res, err);
                            }
                            else {
                                pkg.icon = url;

                                pkg.save(function(err) {
                                    if (err) {
                                        error(res, err);
                                    }
                                    else {
                                        success(res, pkg);
                                    }
                                });
                            }
                        });
                    }
                }
                else {
                    pkg.save(function(err) {
                        if (err) {
                            error(res, err);
                        }
                        else {
                            success(res, pkg);
                        }
                    });
                }
            }
        });
    }

    function updateFromClick(req, res, pkg, failIfExists, failIfMissingFile) {
        if (!req.files || !req.files.file) {
            if (failIfMissingFile) {
                error(res, 'No file upload specified');
            }
            else {
                if (req.body.category || req.body.category === '') {
                    pkg.category = req.body.category;
                }

                if (req.body.description || req.body.description === '') {
                    pkg.description = req.body.description;
                }

                if (req.body.license || req.body.license === '') {
                    pkg.license = req.body.license;
                }

                if (req.body.source || req.body.source === '') {
                    pkg.source = req.body.source;
                }

                if (req.body.tagline || req.body.tagline === '') {
                    pkg.tagline = req.body.tagline;
                }

                pkg.save(function(err) {
                    if (err) {
                        error(res, err);
                    }
                    else {
                        success(res, pkg);
                    }
                });
            }
        }
        else if (req.files.file.path.indexOf('.click') == -1) {
            error(res, 'The file must be a click package');
            fs.unlink(req.files.file.path);
        }
        else {
            var file = req.files.file;
            parse(file.path, true, function(err, data) {
                if (err) {
                    error(res, err);
                    fs.unlink(file.path);
                }
                else if (!data.name || !data.version || !data.architecture) {
                    error(res, 'Malformed manifest');
                    fs.unlink(file.path);
                }
                else if (pkg.id && pkg.id != data.name) {
                    error(res, 'Uploaded manifest does not match package to update');
                    fs.unlink(file.path);
                }
                else {
                    if (failIfExists) {
                        db.Package.findOne({id: data.name}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, p) {
                            if (err) {
                                error(res, err);
                            }
                            else if (p) {
                                error(res, 'Package with id "' + data.name + '" already exists');
                            }
                            else {
                                saveClick(req, res, pkg, data, file);
                            }
                        });
                    }
                    else {
                        saveClick(req, res, pkg, data, file);
                    }
                }
            });
        }
    }

    app.post('/api/apps', passport.authenticate('localapikey', {session: false}), isAdmin, function(req, res) {
        var pkg = new db.Package();
        updateFromClick(req, res, pkg, true, true);
    });

    app.put('/api/apps/:id', passport.authenticate('localapikey', {session: false}), isAdmin, function(req, res) {
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
            if (err) {
                error(res, err);
            }
            else if (!pkg) {
                error(res, 'No package found with id "' + req.params.id + '"', 404);
            }
            else {
                updateFromClick(req, res, pkg);
            }
        });
    });

    app.delete('/api/apps/:id', passport.authenticate('localapikey', {session: false}), isAdmin, function(req, res) {
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
            if (err) {
                error(res, err);
            }
            else {
                pkg.deleted = true;
                pkg.save(function(err) {
                    if (err) {
                        error(res, err);
                    }
                    else {
                        success(res, null);
                    }
                });
            }
        });
    });

    app.get('/api/download/:id/:click', function(req, res) {
        db.Package.findOne({id: req.params.id}).or([{deleted: false}, {deleted: {'$exists': false}}]).exec(function(err, pkg) {
            if (err) {
                error(res, err);
            }
            else if (!pkg) {
                error(res, 'Package not found', 404);
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
}

exports.setup = setup;
