var db = require('../db');
var config = require('../utils/config');
var logger = require('../utils/logger');
var helpers = require('../utils/helpers');
var passport = require('passport');

function setup(app) {
    app.get('/api/users', passport.authenticate('localapikey', {session: false}), helpers.isAdmin, function(req, res) {
        db.User.find({}).exec(function(err, users) {
            if (err) {
                helpers.error(res, err);
            }
            else {
                var result = [];
                users.forEach(function(user) {
                    user.apikey = undefined;
                    user.ubuntu_id = undefined;

                    result.push(user);
                });

                helpers.success(res, result);
            }
        });
    });

    app.get('/api/users/:id', passport.authenticate('localapikey', {session: false}), helpers.isAdmin, function(req, res) {
        db.User.find({_id: req.params.id}).exec(function(err, users) {
            if (err) {
                helpers.error(res, err);
            }
            else if (users.length === 0) {
                helpers.error(res, 'User not found', 404);
            }
            else {
                var user = users[0];

                user.apikey = undefined;
                user.ubuntu_id = undefined;

                helpers.success(res, user);
            }
        });
    });

    app.put('/api/users/:id', passport.authenticate('localapikey', {session: false}), helpers.isAdmin, function(req, res) {
        db.User.find({_id: req.params.id}).exec(function(err, users) {
            if (err) {
                helpers.error(res, err);
            }
            else if (users.length === 0) {
                helpers.error(res, 'User not found', 404);
            }
            else {
                var user = users[0];
                user.role = req.body.role;

                user.save(function(err) {
                    if (err) {
                        helpers.error(res, err);
                    }
                    else {
                        helpers.success(res, user);
                    }
                });
            }
        });
    });
}

exports.setup = setup;
