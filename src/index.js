var cluster = require('cluster');
var os = require('os');
var express = require('express');

var app = express();

if (cluster.isMaster) {
    var cpus = os.cpus().length;

    for (var i = 0; i < cpus; i += 1) {
      cluster.fork();
    }

    cluster.on('exit', function() {
      cluster.fork();
    });
}
else {
    var port = process.env.PORT || 3000;
    app.use(express.static(__dirname + '/static'));
    app.listen(port, '0.0.0.0');
}
