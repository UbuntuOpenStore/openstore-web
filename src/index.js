var config = require('./config');
var apps = require('./api/apps');
var auth = require('./api/auth');
var db = require('./db');
var opengraph = require('./opengraph');
var cluster = require('cluster');
var os = require('os');
var express = require('express');
var fs = require('fs');

if (cluster.isMaster) {
    for (var i = 0; i < os.cpus().length; i += 1) {
        cluster.fork();
    }

    cluster.on('exit', function() {
        cluster.fork();
    });
}
else {
    var app = express();
    app.set('json spaces', 2);

    app.use(function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    auth.setup(app);
    apps.setup(app);

    app.use(express.static(__dirname + '/../www'));

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
                    //fs.createReadStream(root: __dirname + '/../www/404.html').pipe(res);
                    res.send();
                }
                else {
                    fs.readFile(__dirname + '/../www/index.html', {encoding: 'utf8'}, function(err, data) {
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
            res.sendFile('index.html', {root: __dirname + '/../www'});
        }
    });

    app.all(['/', '/docs', '/submit', '/apps', '/manage'], function(req, res) { //For html5mode on frontend
        res.sendFile('index.html', {root: __dirname + '/../www'});
    });

    app.listen(config.server.port, config.server.ip);
}
