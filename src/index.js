var config = require('./config');
var api = require('./api');
var auth = require('./auth');
var db = require('./db');
var cluster = require('cluster');
var os = require('os');
var express = require('express');
var fs = require('fs');

//list borrowed from https://github.com/prerender/prerender-node
var useragents = [
    //'googlebot',
    //'yahoo',
    //'bingbot',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkShare',
    'W3C_Validator'
];

function openGraphData(html, og) {
    html = html.replace(/meta name="description" content="(?:[\S\s]*?)"/gi,         'meta name="description" content="' + og.description + '"');
    html = html.replace(/meta itemprop="name" content="(?:[\S\s]*?)"/gi,            'meta itemprop="name" content="' + og.title + '"');
    html = html.replace(/meta itemprop="description" content="(?:[\S\s]*?)"/gi,     'meta itemprop="description" content="' + og.description + '"');
    html = html.replace(/meta itemprop="image" content="(?:[\S\s]*?)"/gi,           'meta itemprop="image" content="' + og.image + '"');
    html = html.replace(/meta name="twitter:title" content="(?:[\S\s]*?)"/gi,       'meta name="twitter:title" content="' + og.title + '"');
    html = html.replace(/meta name="twitter:description" content="(?:[\S\s]*?)"/gi, 'meta name="twitter:description" content="' + og.description + '"');
    html = html.replace(/meta name="twitter:image:src" content="(?:[\S\s]*?)"/gi,   'meta name="twitter:image:src" content="' + og.image + '"');
    html = html.replace(/meta property="og:title" content="(?:[\S\s]*?)"/gi,        'meta property="og:title" content="' + og.title + '"');
    html = html.replace(/meta property="og:url" content="(?:[\S\s]*?)"/gi,          'meta property="og:url" content="' + og.url + '"');
    html = html.replace(/meta property="og:image" content="(?:[\S\s]*?)"/gi,        'meta property="og:image" content="' + og.image + '"');
    html = html.replace(/meta property="og:description" content="(?:[\S\s]*?)"/gi,  'meta property="og:description" content="' + og.description + '"');
    html = html.replace(/meta property="og:site_name" content="(?:[\S\s]*?)"/gi,    'meta property="og:site_name" content="' + og.title + ' - OpenStore' + '"');

    return html;
}

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

    auth.setup(app);
    api.setup(app);

    app.use(express.static(__dirname + '/../www'));

    app.get('/app/:name', function(req, res) { //For populating opengraph data, etc for bots that don't execute javascript (like twitter cards)
        var useragent = req.headers['user-agent'];
        var match = useragents.some(function(ua) {
            return useragent.toLowerCase().indexOf(ua.toLowerCase()) !== -1;
        });

        if (match || req.query._escaped_fragment_ !== undefined) {
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
                            res.send(openGraphData(data, {
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
