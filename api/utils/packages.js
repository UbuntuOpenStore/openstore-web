'use strict';

const db = require('../db');
const config = require('./config');
const logger = require('./logger');
const request = require('request');
const parse = require('click-parser');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const moment = require('moment');
const path = require('path');

function sanitize(html) {
    return sanitizeHtml(html, {
      allowedTags: [],
      allowedAttributes: [],
    }).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\r/g, '');
}


function updateInfo(pkg, data, body, file, url, updateRevision) {
    updateRevision = (updateRevision === undefined) ? false : updateRevision;

    let maintainer = body ? body.maintainer : pkg.maintainer;
    return db.User.findOne({_id: maintainer}).then((user) => {
        if (user) {
            pkg.maintainer_name = user.name ? user.name : user.username;
        }

        pkg.updated_date = moment().toISOString();
        if (!pkg.published_date) {
            pkg.published_date = moment().toISOString();
        }

        if (data) {
            var manifest = {
                architecture: data.architecture,
                changelog: data.changelog,
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
                    hook.scope = {};

                    for (let key in app.scopeIni) {
                        //Remove any ini properties with a `.` as mongo will reject them
                        hook.scope[key.replace('.', '__')] = app.scopeIni[key];
                    }
                }

                manifest.hooks[app.name] = hook;
            });

            pkg.architecture = data.architecture;
            pkg.architectures = data.architecture;
            pkg.author = data.maintainer;
            pkg.framework = data.framework;
            pkg.id = data.name;
            pkg.manifest = manifest;
            pkg.types = data.types;
            pkg.version = data.version;
            pkg.snappy_meta = data.snappy_meta;
            pkg.languages = data.languages;

            //Don't overwrite the these if they already exists
            pkg.name = pkg.name ? pkg.name : data.title;
            pkg.description = pkg.description ? pkg.description : data.description;
            pkg.tagline = pkg.tagline ? pkg.tagline : data.description;
        }

        if (file && file.size) {
            pkg.filesize = file.size;
        }

        if (url) {
            pkg.package = url;
        }

        if (body) {
            if (body.name) {
                pkg.name = body.name;
            }

            if (body.published !== undefined) {
                pkg.published = (body.published == 'true');
            }

            if (body.category || body.category === '') {
                pkg.category = body.category;
            }

            if (body.changelog || body.changelog === '') {
                pkg.changelog = body.changelog;
            }

            if (body.description || body.description === '') {
                pkg.description = body.description;
            }

            if (body.license || body.license === '') {
                pkg.license = body.license;
            }

            if (body.source || body.source === '') {
                if (body.source.indexOf('https://') === 0 || body.source.indexOf('http://') === 0) {
                    pkg.source = body.source;
                }
                else {
                    pkg.source = '';
                }
            }

            if ((body.support_url || body.support_url === '')) {
                if (body.support_url.indexOf('https://') === 0 || body.support_url.indexOf('http://') === 0) {
                    pkg.support_url = body.support_url;
                }
                else {
                    pkg.support_url = '';
                }
            }

            if (body.donate_url || body.donate_url === '') {
                if (body.donate_url.indexOf('https://') === 0 || body.donate_url.indexOf('http://') === 0) {
                    pkg.donate_url = body.donate_url;
                }
                else {
                    pkg.donate_url = '';
                }
            }

            if (body.video_url || body.video_url === '') {
                //TODO support regular youtube urls and transform them into embedded urls
                if (body.video_url.indexOf('https://www.youtube.com/embed/') === 0) {
                    pkg.video_url = body.video_url;
                }
                else {
                    pkg.video_url = '';
                }
            }

            if (body.tagline || body.tagline === '') {
                pkg.tagline = body.tagline;
            }

            if (body.screenshots) {
                pkg.screenshots = body.screenshots;
            }
            else {
                pkg.screenshots = [];
            }

            if (body.keywords) {
                pkg.keywords = body.keywords.map((keyword) => {
                    return keyword.trim();
                });
            }
            else {
                pkg.keywords = [];
            }

            pkg.description = pkg.description ? pkg.description : '';
            pkg.changelog = pkg.changelog ? pkg.changelog : '';
            pkg.tagline = pkg.tagline ? pkg.tagline : '';

            pkg.description = sanitize(pkg.description);
            pkg.changelog = sanitize(pkg.changelog);
            pkg.tagline = sanitize(pkg.tagline);

            if (body.maintainer !== undefined) {
                pkg.maintainer = body.maintainer;
            }
        }
        else {
            pkg.description = pkg.description ? pkg.description : '';
            pkg.changelog = pkg.changelog ? pkg.changelog : '';
            pkg.tagline = pkg.tagline ? pkg.tagline : '';

            pkg.description = sanitize(pkg.description);
            pkg.changelog = sanitize(pkg.changelog);
            pkg.tagline = sanitize(pkg.tagline);
        }

        if (updateRevision) {
            if (pkg.revision) {
                pkg.revision++;
            }
            else {
                pkg.revision = 1;
            }

            pkg.revisions.push({
                revision: pkg.revision,
                version: pkg.version,
                downloads: 0,
            });
        }

        return pkg;
    });
}

function fixMaintainer() {
    db.User.find({}, function(err, users) {
        if (err) {
            logger.error(err);
        }
        else {
            db.Package.find({}, function(err, pkgs) {
                if (err) {
                    logger.error(err);
                }
                else {
                    pkgs.forEach(function(pkg) {
                        if (pkg.maintainer) {
                            users.forEach(function(user) {
                                if (user._id == pkg.maintainer) {
                                    pkg.maintainer_name = user.name ? user.name : user.username;
                                    pkg.save(function(err) {
                                        if (err) {
                                            logger.error(err);
                                        }
                                        else {
                                            logger.debug(pkg.id + ' saved');
                                        }
                                    });
                                }
                            });

                            logger.info(pkg.id + ' ' + pkg.maintainer_name);
                        }
                        else {
                            logger.error(pkg.id + ' has no maintainer');
                        }
                    });
                }
            });
        }
    });
}

function reparse() {
    db.Package.find({}, function(err, pkgs) {
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
                                    updateInfo(pkg, data, null, null, null, false);
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

function toJson(pkg, req) {
    let json = {};
    if (pkg) {
        let extension = '.click';
        if (pkg.types.indexOf('snappy') >= 0) {
            extension = '.snap';
        }
        let download =  config.server.host + '/api/download/' + pkg.id + '/' + pkg.id + '_latest_' + pkg.architecture + extension;

        let ext = path.extname(pkg.icon);
        json = {
            architecture: pkg.architecture ? pkg.architecture : '',
            architectures: pkg.architectures ? pkg.architectures : [],
            author: pkg.author ? pkg.author : '',
            category: pkg.category ? pkg.category : '',
            changelog: pkg.changelog ? pkg.changelog : '',
            description: pkg.description ? pkg.description : '',
            download_sha512: pkg.download_sha512 ? pkg.download_sha512 : '',
            download: download,
            filesize: pkg.filesize ? pkg.filesize : 0,
            framework: pkg.framework ? pkg.framework : '',
            icon: `${config.server.host}/api/icon/${pkg.version}/${pkg.id}${ext}`,
            id: pkg.id ? pkg.id : '',
            keywords: pkg.keywords ? pkg.keywords : [],
            license: pkg.license ? pkg.license : '',
            maintainer_name: pkg.maintainer_name ? pkg.maintainer_name : null,
            maintainer: pkg.maintainer ? pkg.maintainer : null,
            manifest: pkg.manifest ? pkg.manifest : {},
            name: pkg.name ? pkg.name : '',
            package: pkg.package ? pkg.package : '',
            permissions: pkg.permissions ? pkg.permissions: [],
            published_date: pkg.published_date ? pkg.published_date : '',
            published: !!pkg.published,
            screenshots: pkg.screenshots ? pkg.screenshots : [],
            snappy_meta: pkg.snappy_meta ? pkg.snappy_meta : {},
            source: pkg.source ? pkg.source : '',
            support_url: pkg.support_url ? pkg.support_url : '',
            donate_url: pkg.donate_url ? pkg.donate_url : '',
            video_url: pkg.video_url ? pkg.video_url : '',
            tagline: pkg.tagline ? pkg.tagline : '',
            types: pkg.types ? pkg.types : [],
            updated_date: pkg.published_date ? pkg.updated_date : '',
            version: pkg.version ? pkg.version : '',
            revision: pkg.revision ? pkg.revision : 1,
            languages: pkg.languages ? pkg.languages.sort() : [],
        };

        if (req.isAuthenticated() && req.user && (req.user._id == pkg.maintainer || req.user.role == 'admin')) {
            json.downloads = pkg.downloads;
            json.revisions = pkg.revisions;

            json.totalDownloads = 0;
            pkg.revisions.forEach((revision) => {
                json.totalDownloads += revision.downloads;
            });
        }
    }

    return json;
}

exports.updateInfo = updateInfo;
exports.fixMaintainer = fixMaintainer;
exports.reparse = reparse;
exports.toJson = toJson;
