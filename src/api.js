var db = require('./db');
var clickParser = require('./clickParser');
var config = require('./config');
var bodyParser = require('body-parser');
var async = require('async');
var passport = require('passport');
var multer  = require('multer');
var request = require('request');
var fs = require('fs');

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
            value:  fs.createReadStream(filepath),
            options: {
                filename: filename
            }
        }
    };

    request.post({
        url: config.smartfile.url,
        formData: formData,
        headers: headers,
    }, function(err, response, body) {
        if (err) {
            callback(err);
        }
        else if (response.statusCode != 200) {
            callback('Could not upload file to smartfile, error code ' + response.statusCode);
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

    app.get('/repo/repolist.json', function(req, res) {
        db.Package.find({$or: [{deleted: false}, {deleted: {$exists: false}}]}, function(err, packages) {
            if (err) {
                error(res, err);
            }
            else {
                var result = [];
                packages.forEach(function(pkg) {
                    result.push({
                        architecture: pkg.architecture,
                        author: pkg.author,
                        category: pkg.category,
                        description: pkg.description,
                        filesize: pkg.filesize,
                        framework: pkg.framework,
                        icon: pkg.icon,
                        id: pkg.id,
                        license: pkg.license,
                        name: pkg.name,
                        package: pkg.package,
                        source: pkg.source,
                        tagline: pkg.tagline,
                        types: pkg.types,
                        version: pkg.version,
                    });
                });

                res.send({
                    success: true,
                    message: null,
                    packages: result
                });
            }
        })
    });

    app.get('/api/apps', function(req, res) {
        db.Package.find({$or: [{deleted: false}, {deleted: {$exists: false}}]}, function(err, packages) {
            if (err) {
                error(res, err);
            }
            else {
                success(res, packages);
            }
        });
    });

    function updateFromClick(req, res, pkg) {
        if (!req.files || !req.files.file) {
            error(res, 'No file upload specified');
        }
        else if (req.files.file.path.indexOf('.click') == -1) {
            error(res, 'The file must be a click package');
            fs.unlink(req.files.file.path);
        }
        else {
            var data = {};
            var file = req.files.file;
            clickParser.parseClickPackage(data, file.path, function(err) {
                if (err) {
                    error(res, err);
                    fs.unlink(file.path);
                }
                else if (!data.manifest || !data.manifest.name || !data.manifest.version || !data.manifest.architecture) {
                    error(res, 'Malformed manifest');
                    fs.unlink(file.path);
                }
                else if (pkg.id && pkg.id != data.manifest.name) {
                    error(res, 'Uploaded manifest does not match package to update');
                    fs.unlink(file.path);
                }
                else {
                    var filename = data.manifest.name + '_' + data.manifest.version + '_' + data.manifest.architecture;
                    uploadToSmartfile(file.path, filename, function(err, url) {
                        if (err) {
                            error(res, err);
                            fs.unlink(file.path);
                        }
                        else {
                            var author = '';
                            if (data.manifest.maintainer) {
                                author = data.manifest.maintainer.replace(/\<.*\>/, '').trim();
                            }

                            pkg.architecture = data.manifest.architecture;
                            pkg.author = author;
                            pkg.category = req.body.category;
                            pkg.description = req.body.description;
                            pkg.filesize = file.size;
                            pkg.framework = data.manifest.framework;
                            //TODO = icon
                            pkg.id = data.manifest.name;
                            pkg.license = req.body.license;
                            pkg.manifest = data.manifest;
                            pkg.name = data.manifest.title;
                            pkg.package = url;
                            pkg.source = req.body.source;
                            pkg.tagline = req.body.tagline;
                            pkg.types = data.types;
                            pkg.version = data.manifest.version;

                            pkg.save(function(err) {
                                if (err) {
                                    error(res, err);
                                }
                                else {
                                    success(res, pkg);
                                }

                                fs.unlink(file.path);
                            });
                        }
                    });
                }
            });
        }
    }

    app.post('/api/apps', passport.authenticate('localapikey', {session: false}), isAdmin, function(req, res) {
        //TODO fail if package already exists

        var pkg = new db.Package();
        updateFromClick(req, res, pkg);
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
        db.Package.findOne({id: req.params.id}, function(err, pkg) {
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
}

exports.setup = setup;
