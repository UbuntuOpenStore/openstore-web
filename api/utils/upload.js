var config = require('../utils/config');
var request = require('request');
var fs = require('fs');
var path = require('path');
var jimp = require('jimp');

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
    var iconname = pkg.id + path.extname(filepath);

    if (path.extname(filepath) == '.png') {
        jimp.read(filepath, function(err, image) {
            if (err) {
                callback(err);
            }
            else {
                image.resize(92, 92).write(filepath, function(err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        uploadToSmartfile(url, share, filepath, iconname, function(err, url) {
                            if (iconname.indexOf('404.png') > -1) {
                                fs.unlink(filepath);
                            }

                            callback(err, url);
                        });
                    }
                });
            }
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

//TODO Refactor this whole module
function uploadPackage(url, share, pkg, filepath, iconpath) {
    return new Promise((resolve, reject) => {
        uploadClick(url, share, pkg, filepath, iconpath, (err, pkgUrl, imgUrl) => {
            if (err) {
                reject(err);
            }
            else {
                pkg.package = pkgUrl;
                pkg.icon = imgUrl;

                resolve(pkg);
            }
        });
    });
}


exports.uploadToSmartfile = uploadToSmartfile;
exports.uploadIcon = uploadIcon;
exports.uploadClick = uploadClick;
exports.uploadPackage = uploadPackage;
