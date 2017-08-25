var config = require('../utils/config');
var logger = require('../utils/logger');
var mongoose = require('mongoose');

mongoose.connect(config.mongo.uri + '/' + config.mongo.database, function(err) {
    if (err) {
        logger.error('database: ' + err);
        process.exit(1);
    }
});

var packageSchema = mongoose.Schema({
    architecture: String,
    architectures: [String],
    author: String,
    category: String,
    changelog: String,
    description: String,
    download_sha512: String,
    downloads: {},
    filesize: Number,
    framework: String,
    icon: String,
    id: {type: String, index: true},
    keywords: [String],
    license: String,
    maintainer_name: String,
    maintainer: String,
    manifest: {},
    name: String,
    package: String,
    published_date: String,
    published: Boolean,
    screenshots: [String],
    snappy_meta: {},
    source: String,
    tagline: String,
    types: [String],
    updated_date: String,
    version: String,
    support_url: String,
    donate_url: String,
    video_url: String,
    revision: Number,
    revisions: [],
    languages: [],
});

packageSchema.index({
    name: 'text',
    description: 'text',
    keywords: 'text',
    author: 'text',
},
{
    weights: {
        name: 10,
        description: 5,
        keywords: 3,
        author: 1,
    },
    name: 'searchIndex',
});

var Package = mongoose.model('Package', packageSchema);

var userSchema = mongoose.Schema({
    apikey: String,
    email: String,
    language: String,
    name: String,
    role: String,
    ubuntu_id: {type: String, index: true},
    github_id: String,
    username: String,
});

var User = mongoose.model('User', userSchema);

exports.Package = Package;
exports.User = User;
