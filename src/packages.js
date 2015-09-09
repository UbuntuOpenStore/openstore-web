var db = require('./db');
var request = require('request');
var parse = require('click-parser');
var fs = require('fs');

function updateInfo(pkg, data, body, file, url) {
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
            console.error(err);
        }
        else {
            pkgs.forEach(function(pkg) {
                var r = request(pkg.package);
                r.on('error', function(err) {
                    console.error(pkg.id + ': ' + err);
                })
                .on('response', function(response) {
                    if (response.statusCode == 200) {
                        var filename = '/tmp/' + pkg.id + '.click';
                        var f = fs.createWriteStream(filename);
                        f.on('error', function(err) {
                            console.error(pkg.id + ': ' + err);
                        })
                        .on('finish', function() {
                            parse(filename, function(err, data) {
                                fs.unlink(filename);
                                if (err) {
                                    console.error(pkg.id + ': ' + err);
                                }
                                else {
                                    updateInfo(pkg, data);
                                    pkg.save(function(err) {
                                        if (err) {
                                            console.error(pkg.id + ': ' + err);
                                        }
                                        else {
                                            console.log(pkg.id + ': success!');
                                        }
                                    });
                                }
                            });
                        });

                        r.pipe(f);
                    }
                    else {
                        console.error(pkg.id + ': http error ' + response.statusCode);
                    }
                });
            });
        }
    });
}

exports.updateInfo = updateInfo;
exports.reparse = reparse;
