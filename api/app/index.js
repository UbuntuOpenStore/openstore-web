var config = require('../utils/config');
var apps = require('./apps');
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

    auth.setup(app);
    apps.setup(app);
    users.setup(app);

    app.use(express.static(__dirname + '/../../www'));

    app.get('/app/openstore.mzanetti', function(req, res) {
        res.redirect(301, config.server.host + '/app/openstore.openstore-team')
    });

    app.get('/app/:name', function(req, res) { //For populating opengraph data, etc for bots that don't execute javascript (like twitter cards)
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

    app.all(['/', '/docs', '/submit', '/apps', '/manage', '/users'], function(req, res) { //For html5mode on frontend
        res.sendFile('index.html', {root: __dirname + '/../../www'});
    });

    app.listen(config.server.port, config.server.ip);
    logger.debug('listening on ' + config.server.ip + ':' + config.server.port);

    return app;
}

module.exports.setup = setup;
