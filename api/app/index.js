var config = require('../utils/config');
var apps = require('./apps');
var snaps = require('./snaps');
var categories = require('./categories');
var discover = require('./discover');
var updates = require('./updates');
var auth = require('./auth');
var users = require('./users');
var db = require('../db');
var opengraph = require('../utils/opengraph');
var logger = require('../utils/logger');
var fs = require('fs');
var express = require('express');

function setup() {
    var app = express();
    //Pretty print json api
    app.set('json spaces', 2);

    //Setup cors
    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    app.use(function(req, res, next) {
        let host = config.server.host.replace('https://', '').replace('http://', '')
        if (req.headers.host != host) {
            res.redirect(301, config.server.host + req.originalUrl);
        }
        else {
            next();
        }
    });

    //TOOD see if there is a better way to do this
    auth.setup(app);
    discover.setup(app);
    updates.setup(app);
    apps.setup(app);
    snaps.setup(app);
    categories.setup(app);
    users.setup(app);

    app.use(express.static(__dirname + '/../../www'));

    app.get('/telegram', function(req, res) {
        console.log('telegram');
        res.redirect(301, 'https://telegram.me/joinchat/BMTh8AHtOL2foXLulmqDxw');
    });

    app.get('/app/openstore.mzanetti', function(req, res) {
        res.redirect(301, config.server.host + '/app/openstore.openstore-team')
    });

    app.get(['/app/:name', '/snap/:name'], function(req, res) { //For populating opengraph data, etc for bots that don't execute javascript (like twitter cards)
        if (opengraph.match(req)) {
            res.header('Content-Type', 'text/html');
            db.Package.findOne({id: req.params.name}, function(err, pkg) {
                if (err) {
                    res.status(500);
                    res.send();
                }
                else if (!pkg) {
                    res.status(404);
                    //fs.createReadStream(root: __dirname + '/../../www/404.html').pipe(res);
                    res.send();
                }
                else {
                    fs.readFile(__dirname + '/../../www/index.html', {encoding: 'utf8'}, function(err, data) {
                        if (err) {
                            res.status(500);
                            res.send();
                        }
                        else {
                            res.status(200);
                            res.send(opengraph.replace(data, {
                                title: pkg.name,
                                url: 'https://open.uappexplorer.com/app/' + pkg.id,
                                image: pkg.icon,
                                description: pkg.tagline ? pkg.tagline : '',
                            }));
                        }
                    });
                }
            });
        }
        else {
            res.sendFile('index.html', {root: __dirname + '/../../www'});
        }
    });

    app.all(['/', '/docs', '/submit', '/apps', '/snaps', '/manage', '/users', '/manage/:name', '/login'], function(req, res) { //For html5mode on frontend
        res.sendFile('index.html', {root: __dirname + '/../../www'});
    });

    app.listen(config.server.port, config.server.ip);
    logger.debug('listening on ' + config.server.ip + ':' + config.server.port);

    return app;
}

module.exports.setup = setup;
