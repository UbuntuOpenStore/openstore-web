var fs = require('fs');
var ar = require('ar');
var zlib = require('zlib');
var tar = require('tar-stream');
var streamifier = require('streamifier');
var async = require('async');
var concat = require('concat-stream');

function isJson(string) {
    var value = true;
    try {
        JSON.parse(string);
    }
    catch (e) {
        value = false;
    }

    return value;
}

function extractIcon(fileData, data, callback) {
    if (data.iconpath) {
        streamifier.createReadStream(fileData)
        .pipe(zlib.Unzip())
        .pipe(tar.extract())
        .on('entry', function(header, stream, cb) {
            if (header.name == './' + data.iconpath) {
                stream.on('data', function(fdata) {
                    data.icon = fdata;
                    cb();
                });
            }
            else {
                cb();
            }

            stream.resume();
        })
        .on('error', function(err) {
            callback(err);
        })
        .on('finish', function() {
            callback(null, data);
        });
    }
    else {
        callback(null, data);
    }
}

function parseData(fileData, data, callback) {
    streamifier.createReadStream(fileData)
    .pipe(zlib.Unzip())
    .pipe(tar.extract())
    .on('entry', function(header, stream, cb) {
        if (header.name == './meta/package.yaml') {
            data.types.push('snappy');
        }
        else if (data.desktopFiles.indexOf(header.name) > -1) {
            stream.on('data', function(fdata) {
                var desktop = fdata.toString().split('\n');

                desktop.forEach(function(line) {
                    var lline = line.toLowerCase().trim();
                    if (lline.indexOf('exec=') === 0) {
                        lline = lline.replace('exec=', '').trim();
                        if (lline.indexOf('webapp-container') === 0) {
                            data.types[data.types.indexOf('application')] = 'webapp';
                        }
                    }
                    else if (lline.indexOf('icon') === 0) {
                        data.iconpath = line.replace(/icon=/i, '').trim();
                    }
                });

                cb();
            });
        }
        else {
            cb();
        }

        stream.resume();
    })
    .on('error', function(err) {
        callback(err);
    })
    .on('finish', function() {
        extractIcon(fileData, data, callback);
    });
}

function parseControl(control, data, callback) {
    var types = [];
    var manifest = {};
    var desktopFiles = [];

    streamifier.createReadStream(control)
    .pipe(zlib.Unzip())
    .pipe(tar.extract())
    .on('entry', function(header, stream, cb) {
        if (header.name == './manifest') {
            stream.on('data', function(fdata) {
                manifest = fdata.toString();
                if (isJson(manifest)) {
                    manifest = JSON.parse(manifest);

                    if (!manifest.hooks || Object.keys(manifest.hooks).length === 0) {
                        cb('Manifest file does not have any hooks in it');
                    }
                    else {
                        for (var key in manifest.hooks) {
                            var hook = manifest.hooks[key];
                            if (hook.desktop) {
                                types.push('application');
                                desktopFiles.push('./' + hook.desktop);
                            }
                            else if (hook['bin-path'] || hook['snappy-systemd']) {
                                types.push('snappy');
                            }
                            else if (hook.scope) {
                                types.push('scope');
                            }
                        }
                    }

                    cb();
                }
                else {
                    cb('Manifest file is not in a json format');
                }
            });
        }
        else {
            cb();
        }

        stream.resume();
    })
    .on('error', function(err) {
        callback(err);
    })
    .on('finish', function() {
        parseData(data, {
            types: types,
            manifest: manifest,
            desktopFiles: desktopFiles,
        }, callback);
    });
}

function parseClickPackage(filepath, callback) {
    var data = null;
    var control = null;

    var archive = new ar.Archive(fs.readFileSync(filepath));
    archive.getFiles().forEach(function(file) {
        if (file.name() == 'data.tar.gz') {
            data = file.fileData();
        }
        else if (file.name() == 'control.tar.gz') {
            control = file.fileData();
        }
    });

    if (data === null || control === null) {
        callback('Malformed click package');
    }
    else {
        parseControl(control, data, callback);
    }
}

exports.parseClickPackage = parseClickPackage;
