var db = require('./db');
var bodyParser = require('body-parser');
var async = require('async');
var passport = require('passport');

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

function setup(app) {
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
                res.send({
                    success: true,
                    message: null,
                    packages: packages
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

    app.post('/api/apps', passport.authenticate('localapikey', {session: false}), isAdmin, function(req, res) {
        var data = req.body;
        if (!Array.isArray(req.body)) {
            data = [req.body];
        }

        async.map(data, function(item, done) {
            //TODO check for unique id

            var pkg = new db.Package(item);
            pkg.save(function(err) {
                if (err) {
                    done(err);
                }
                else {
                    done(err, pkg);
                }
            });
        }, function(err, packages) {
            if (err) {
                error(res, err);
            }
            else {
                success(res, packages);
            }
        });
    });

    app.put('/api/apps', passport.authenticate('localapikey', {session: false}), isAdmin, function(req, res) {
        var data = req.body;
        if (!Array.isArray(req.body)) {
            data = [req.body];
        }

        async.map(data, function(item, done) {
            //TODO check that request contains _id
            db.Package.findOne({_id: item._id}, function(err, pkg) {
                if (err) {
                    done(err);
                }
                else {
                    for (var key in item) {
                        pkg[key] = item[key];
                    }

                    pkg.save(function(err) {
                        done(err, pkg);
                    });
                }
            });
        }, function(err, packages) {
            if (err) {
                error(res, err);
            }
            else {
                success(res, packages);
            }
        });
    });

    app.delete('/api/apps', passport.authenticate('localapikey', {session: false}), isAdmin, function(req, res) {
        var data = req.body;
        if (!Array.isArray(req.body)) {
            data = [req.body];
        }

        async.map(data, function(item, done) {
            //TODO check that request contains _id
            db.Package.findOne({_id: item._id}, function(err, pkg) {
                if (err) {
                    done(err);
                }
                else {
                    pkg.deleted = true;
                    pkg.save(done);
                }
            });
        }, function(err, packages) {
            if (err) {
                error(res, err);
            }
            else {
                success(res, null);
            }
        });
    });
}

exports.setup = setup;
