var fs = require('fs');
var ar = require('ar');
var zlib = require('zlib');
var tarstream = require('tar-stream');
var streamifier = require('streamifier');
var tar = require('tar');
var uuid = require('node-uuid');
var path = require('path');

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
    var write = '/tmp/' + uuid.v4() + path.extname(data.iconpath).toLowerCase();
    var f = fs.createWriteStream(write)
    .on('finish', function() {
        data.icon = write;
        callback(null, data);
    });

    var found = false;
    streamifier.createReadStream(fileData)
    .on('error', function(err) {
        console.error(err);
        callback(null, data);
    })
    .pipe(zlib.Unzip())
    .pipe(tar.Parse())
    .on('entry', function(entry) {
        if (entry.path == './' + data.iconpath) {
            entry.pipe(f);
            found = true;
        }
    })
    .on('end', function() {
        if (!found) {
            callback(null, data);
        }
    });
}

function parseData(fileData, data, icon, callback) {
    streamifier.createReadStream(fileData)
    .pipe(zlib.Unzip())
    .pipe(tarstream.extract())
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
        if (icon) {
            extractIcon(fileData, data, callback);
        }
        else {
            callback(null, data);
        }
    });
}

function parseControl(control, data, icon, callback) {
    var types = [];
    var manifest = {};
    var desktopFiles = [];

    streamifier.createReadStream(control)
    .pipe(zlib.Unzip())
    .pipe(tarstream.extract())
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
        }, icon, callback);
    });
}

function parseClickPackage(filepath, icon, callback) {
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
        parseControl(control, data, icon, callback);
    }
}

exports.parseClickPackage = parseClickPackage;
