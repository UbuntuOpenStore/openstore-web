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

function replace(html, og) {
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

function match(req) {
    var useragent = req.headers['user-agent'];
    var m = useragents.some(function(ua) {
        return useragent.toLowerCase().indexOf(ua.toLowerCase()) !== -1;
    });

    return (m || req.query._escaped_fragment_ !== undefined);
}

exports.replace = replace;
exports.match = match;
