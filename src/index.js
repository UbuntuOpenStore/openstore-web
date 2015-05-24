var config = require('./config');
var api = require('./api');
var auth = require('./auth');
var cluster = require('cluster');
var os = require('os');
var express = require('express');

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
    auth.setup(app);
    api.setup(app);

    app.use(express.static(__dirname + '/../www'));

    app.all(['/', '/docs', '/submit', '/apps', '/app/:name', '/manage'], function(req, res) { //For html5mode on frontend
        res.sendFile('index.html', {root: __dirname + '/../www'});
    });

    app.listen(config.server.port, config.server.ip);
}
