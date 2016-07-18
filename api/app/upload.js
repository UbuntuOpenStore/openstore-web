var config = require('../utils/config');
var lwip = require('lwip');
var request = require('request');
var fs = require('fs');
var path = require('path');
var gm = require('gm').subClass({imageMagick: true});

function uploadToSmartfile(url, share, filepath, filename, callback) {
    request.post({
        url: url,

        formData: {
            file: {
                value: fs.createReadStream(filepath),
                options: {
                    filename: filename
                }
            }
        },

        headers: {
            'Authorization': 'Basic ' + new Buffer(config.smartfile.key + ':' + config.smartfile.password).toString('base64'),
        },
    },
    function(err, response) {
        if (err) {
            callback(err);
        }
        else if (response.statusCode != 200) {
            callback('Could not upload "' + filename + '" to smartfile, error code ' + response.statusCode);
        }
        else {
            callback(null, share + filename);
        }
    });
}

function uploadIcon(url, share, pkg, filepath, callback) {
    var iconname = pkg.name + path.extname(filepath);

    if (path.extname(filepath) == '.png') {
        lwip.open(filepath, function(err, image) {
            if (err) {
                callback(err);
            }
            else {
                image.batch().resize(92, 92).writeFile(filepath, function(err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        uploadToSmartfile(url, share, filepath, iconname, function(err, url) {
                            fs.unlink(filepath);
                            callback(err, url);
                        });
                    }
                });
            }
        });
    }
    else if (path.extname(filepath) == '.svg') {
        var pngIcon = filepath.replace('.svg', '.png');
        iconname = iconname.replace('.svg', '.png');

        gm(filepath).write(pngIcon, function(err) {
            if (err) {
                console.warn('failed to convert svg: ' + err)
            }
            console.log(pngIcon);

            uploadToSmartfile(url, share, pngIcon, iconname, function(err, url) {
                fs.unlink(filepath);
                fs.unlink(pngIcon);
                callback(err, url);
            });
        });
    }
    else {
        uploadToSmartfile(url, share, filepath, iconname, function(err, url) {
            fs.unlink(filepath);
            callback(err, url);
        });
    }
}

function uploadClick(url, share, pkg, filepath, iconpath, callback) {
    var extension = '.click';
    if (pkg.types.indexOf('snappy') >= 0) {
        extension = '.snap';
    }
    var filename = pkg.id + '_' + pkg.version + '_' + pkg.architecture + extension;

    uploadToSmartfile(url, share, filepath, filename, function(err, clickurl) {
        fs.unlink(filepath);

        if (err) {
            callback(err);
        }
        else {
            if (!iconpath) {
                iconpath = path.join(__dirname, '../404.png');
            }

            uploadIcon(url, share, pkg, iconpath, function(err, imgurl) {
                callback(err, clickurl, imgurl);
            });
        }
    });
}

exports.uploadToSmartfile = uploadToSmartfile;
exports.uploadIcon = uploadIcon;
exports.uploadClick = uploadClick;
