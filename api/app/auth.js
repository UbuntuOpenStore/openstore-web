'use strict';

var config = require('../utils/config');
var logger = require('../utils/logger');
var db = require('../db');
var passport = require('passport');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('cookie-session');
var UbuntuStrategy = require('passport-ubuntu').Strategy;
var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var uuid = require('node-uuid');

function setup(app) {
    app.use(cookieParser());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(methodOverride());
    app.use(session({
    secret: config.server.session_secret,
        name: 'opensession',
        maxAge: 604800000 //7 days in miliseconds
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user.email ? user.email : 'UBUNTU_' + user.ubuntu_id); //This is kinda hacky, but not all ubuntu logins will have an email
    });

    passport.deserializeUser(function(identifier, done) {
        if (identifier.substring(0, 7) == 'UBUNTU_') {
            db.User.findOne({ubuntu_id: identifier}, done);
        }
        else {
            db.User.findOne({email: identifier}, done);
        }
    });

    passport.use(new LocalAPIKeyStrategy(function(apikey, done) {
        db.User.findOne({apikey: apikey}, function(err, user) {
            if (err) {
                done(err);
            }
            else if (!user) {
                done(null, false);
            }
            else {
                done(null, user);
            }
        });
    }));

    function updateOrCreateUbuntuUser(user, identifier, profile, callback) {
        if (!user) {
            user = new db.User();
            user.apikey = uuid.v4();
            user.username = Math.random();
            user.language = 'en';
        }

        user.ubuntu_id = identifier;
        user.name = profile.fullname ? profile.fullname : user.name;
        user.username = profile.nickname ? profile.nickname : user.username;
        user.email = profile.email ? profile.email : user.email;
        user.language = profile.language ? profile.language : user.language;

        user.save(callback);
    }

    passport.use(new UbuntuStrategy({
        returnURL: config.server.host + '/auth/ubuntu/return',
        realm: config.server.host,
        stateless: true,
    },
    function(identifier, profile, callback) {
        db.User.findOne({ubuntu_id: identifier}, function(err, user) {
            if (err) {
                callback(err);
            }
            else {
                if (!user && profile.email) {
                    db.User.findOne({email: profile.email}, function(err, user) {
                        if (err) {
                            callback(err);
                        }
                        else {
                            updateOrCreateUbuntuUser(user, identifier, profile, callback);
                        }
                    });
                }
                else {
                    updateOrCreateUbuntuUser(user, identifier, profile, callback);
                }
            }
        });
    }));

    app.post('/auth/ubuntu', passport.authenticate('ubuntu'));
    app.get('/auth/ubuntu/return', passport.authenticate('ubuntu', {
        successRedirect: '/manage',
        failureRedirect: '/'
    }));
    app.post('/auth/ubuntu/return', passport.authenticate('ubuntu', {
        successRedirect: '/manage',
        failureRedirect: '/'
    }));

    function updateOrCreateGithubUser(user, profile, callback) {
        if (!user) {
            user = new db.User();
            user.apikey = uuid.v4();
            user.language = 'en';
        }

        let emails = profile.emails.filter((email) => email.primary);

        user.github_id = profile.id;
        user.email = (emails.length >= 1) ? emails[0].value : '';
        user.name = profile.displayName;
        user.username = profile.username;

        user.save(callback);
    }

    if (config.github.clientID && config.github.clientSecret) {
        passport.use(new GitHubStrategy({
            clientID: config.github.clientID,
            clientSecret: config.github.clientSecret,
            callbackURL: config.server.host + '/auth/github/callback',
            scope: ['user:email'],
        },
        function(accessToken, refreshToken, profile, callback) {
            db.User.findOne({github_id: profile.id}, function(err, user) {
                if (err) {
                    callback(err);
                }
                else {
                    let emails = profile.emails.filter((email) => email.verified).map((email) => email.value);
                    if (!user && emails) {
                        db.User.findOne({email: {$in: emails}}, function(err, user) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                updateOrCreateGithubUser(user, profile, callback);
                            }
                        });
                    }
                    else {
                        updateOrCreateGithubUser(user, profile, callback);
                    }
                }
            });
        }));

        app.get('/auth/github', passport.authenticate('github'));
        app.get('/auth/github/callback', passport.authenticate('github', {
            successRedirect: '/manage',
            failureRedirect: '/'
        }));
    }
    else {
        logger.error('GitHub login is not available, set a client id & secret');
    }

    app.get('/auth/me', function(req, res) {
        if (req.user) {
            res.send({
                success: true,
                data: {
                    _id: req.user._id,
                    name: req.user.name,
                    language: req.user.language,
                    username: req.user.username,
                    apikey: req.user.apikey,
                    role: req.user.role,
                },
                message: null
            });
        }
        else {
            res.status(401);
            res.send({
                success: false,
                data: null,
                message: 'User not logged in'
            });
        }
    });

    app.get('/auth/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
}

exports.setup = setup;
