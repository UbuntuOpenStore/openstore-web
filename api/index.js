var app = require('./app');
var config = require('./utils/config');
var logger = require('./utils/logger');
var cluster = require('cluster');
var os = require('os');

if (cluster.isMaster) {
    var cpus = os.cpus().length;
    var processes = cpus;
    if (config.server.process_limit > 0 && cpus > config.server.process_limit) {
        processes = config.server.process_limit;
        logger.debug('limiting processes to ' + processes + ' (CPUs: ' + cpus + ')');
    }
    else {
        logger.debug('spawning ' + processes + ' processes');
    }

    for (var i = 0; i < processes; i += 1) {
        cluster.fork();
    }

    cluster.on('exit', function() {
        cluster.fork();
    });
}
else {
    app.setup();
}
