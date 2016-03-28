var db = require('../db');
var config = require('./config');
var logger = require('./logger');
var request = require('request');
var parse = require('click-parser');
var fs = require('fs');

function updateInfo(pkg, data, body, file, url) {
    if (data) {
        var manifest = {
            architecture: data.architecture,
            description: data.description,
            framework: data.framework,
            hooks: {},
            maintainer: data.maintainer,
            name: data.name,
            title: data.title,
            version: data.version,
        };

        data.apps.forEach(function(app) {
            var hook = {};

            if (Object.keys(app.apparmor).length > 0) {
                hook.apparmor = app.apparmor;
            }

            if (Object.keys(app.desktop).length > 0) {
                hook.desktop = app.desktop;
            }

            if (Object.keys(app.contentHub).length > 0) {
                hook['content-hub'] = app.contentHub;
            }

            if (Object.keys(app.urlDispatcher).length > 0) {
                hook.urls = app.urlDispatcher;
            }

            if (Object.keys(app.accountService).length > 0) {
                hook['account-application'] = app.accountService;
            }

            if (Object.keys(app.accountApplication).length > 0) {
                hook['account-service'] = app.accountApplication;
            }

            if (Object.keys(app.pushHelper).length > 0) {
                hook['push-helper'] = app.pushHelper;
            }

            if (Object.keys(app.webappProperties).length > 0) {
                hook['webapp-properties'] = app.webappProperties;
            }

            if (Object.keys(app.scopeIni).length > 0) {
                hook.scope = app.scopeIni;
            }

            manifest.hooks[app.name] = hook;
        });

        pkg.architecture = data.architecture;
        pkg.author = data.maintainer;
        pkg.framework = data.framework;
        pkg.id = data.name;
        pkg.manifest = manifest;
        pkg.name = data.title;
        pkg.types = data.types;
        pkg.version = data.version;
        pkg.description = data.description;
    }

    if (file && file.size) {
        pkg.filesize = file.size;
    }

    if (url) {
        pkg.package = url;
    }

    if (body) {
        if (body.category || body.category === '') {
            pkg.category = body.category;
        }

        if (body.description) { //Only set description if non-empty (allows us to pull from the manifest on create)
            pkg.description = body.description;
        }

        if (body.license || body.license === '') {
            pkg.license = body.license;
        }

        if (body.source || body.source === '') {
            pkg.source = body.source;
        }

        if (body.tagline || body.tagline === '') {
            pkg.tagline = body.tagline;
        }
    }
}

function reparse() {
    db.Package.find({'$or': [{deleted: false}, {deleted: {'$exists': false}}]}, function(err, pkgs) {
        if (err) {
            logger.error(err);
        }
        else {
            pkgs.forEach(function(pkg) {
                var r = request(pkg.package);
                r.on('error', function(err) {
                    logger.error(pkg.id + ': ' + err);
                })
                .on('response', function(response) {
                    if (response.statusCode == 200) {
                        var filename = '/tmp/' + pkg.id + '.click';
                        var f = fs.createWriteStream(filename);
                        f.on('error', function(err) {
                            logger.error(pkg.id + ': ' + err);
                        })
                        .on('finish', function() {
                            parse(filename, function(err, data) {
                                fs.unlink(filename);
                                if (err) {
                                    logger.error(pkg.id + ': ' + err);
                                }
                                else {
                                    updateInfo(pkg, data);
                                    pkg.save(function(err) {
                                        if (err) {
                                            logger.error(pkg.id + ': ' + err);
                                        }
                                        else {
                                            logger.debug(pkg.id + ': success!');
                                        }
                                    });
                                }
                            });
                        });

                        r.pipe(f);
                    }
                    else {
                        logger.error(pkg.id + ': http error ' + response.statusCode);
                    }
                });
            });
        }
    });
}

function toJson(pkg) {
    return {
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
        download: config.server.host + '/api/download/' + pkg.id + '/' + pkg.id + '_' + pkg.version + '_' + pkg.architecture + '.click',
        package: pkg.package ? pkg.package : '',
        permissions: pkg.permissions ? pkg.permissions: [],
        source: pkg.source ? pkg.source : '',
        tagline: pkg.tagline ? pkg.tagline : '',
        types: pkg.types ? pkg.types : [],
        version: pkg.version ? pkg.version : '',
    };
}

exports.updateInfo = updateInfo;
exports.reparse = reparse;
exports.toJson = toJson;
