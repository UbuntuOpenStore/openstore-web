var config = require('./config');
var mongoose = require('mongoose');

mongoose.connect(config.mongo.uri + config.mongo.database, function(err) {
    if (err) {
        console.error('database: ' + err);
        process.exit(1);
    }
});

var packageSchema = mongoose.Schema({
    author: String,
    category: String,
    description: String,
    deleted: Boolean,
    filesize: Number,
    icon: String,
    id: {type: String, index: true},
    license: String,
    name: String,
    package: String,
    source: String,
    tagline: String,
    version: String,
});

var Package = mongoose.model('Package', packageSchema);

var userSchema = mongoose.Schema({
    apikey: String,
    email: String,
    language: String,
    name: String,
    role: String,
    ubuntu_id: {type: String, index: true},
    username: String,
});

var User = mongoose.model('User', userSchema);

exports.Package = Package;
exports.User = User;
