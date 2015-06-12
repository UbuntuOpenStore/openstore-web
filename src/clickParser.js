var fs = require('fs');
var ar = require('ar');
var tar = require('tar');
var zlib = require('zlib');
var _ = require('lodash');
var async = require('async');

var tmp_dir = '/tmp';

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

//TODO make this more generic so it can be better shared between this an uApp Explorer
//TODO extract icon
function unlink(files) {
  _.forEach(files, function(file) {
    if (file.indexOf('.click') == -1) {
      if (_.isArray(file)) {
        unlink(file);
      }
      else {
        if (file.indexOf(tmp_dir) !== 0) {
          file = tmp_dir + '/' + file.replace(/\//g, '__');
        }

        fs.unlink(file);
      }
    }
  });
}

function checkSnappy(data, callback) {
  var found = false;
  fs.createReadStream(data)
  .on('error', function(err) {
    callback(err);
  })
  .pipe(zlib.Unzip())
  .pipe(tar.Parse())
  .on('entry', function(entry) {
    if (entry.path == './meta/package.yaml') {
      found = true;
      callback(null, true);
    }
  })
  .on('end', function() {
    if (!found) {
      callback('Could not find package.yaml');
    }
  });
}

function extractData(data, file, callback) {
  var write_file = tmp_dir + '/' + file.replace(/\//g, '__');
  var f = fs.createWriteStream(write_file)
  .on('finish', function() {
    var webapp = false;
    var fdata = fs.readFileSync(write_file, {encoding: 'utf8'});
    fdata = fdata.split('\n');

    _.forEach(fdata, function(line) {
      line = line.toLowerCase().trim();
      if (line.indexOf('exec=') === 0) {
        line = line.replace('exec=', '').trim();
        if (line.indexOf('webapp-container') === 0) {
          webapp = true;
        }
      }
    });

    callback(null, webapp);
  });

  var found = false;
  fs.createReadStream(data)
  .on('error', function(err) {
    callback(err);
  })
  .pipe(zlib.Unzip())
  .pipe(tar.Parse())
  .on('entry', function(entry) {
    if (entry.path == './' + file) {
      entry.pipe(f);
      found = true;
    }
  })
  .on('end', function() {
    if (!found) {
      callback('Could not find desktop file: ' + file);
    }
  });
}

function parseControl(pkg, files, callback) {
  var data = fs.readFileSync(files.manifest, {encoding: 'utf8'});
  if (isJson(data)) {
    data = JSON.parse(data);
    pkg.manifest = data;

    if (!data.hooks || Object.keys(data.hooks).length === 0) {
      callback('Missing hooks in manifest');
    }
    else {
      var type = [];
      _.forEach(data.hooks, function(hook) {
        if (hook.desktop) {
          type.push('application');
          files.desktops.push(hook.desktop);
        }
        else if (hook['bin-path'] || hook['snappy-systemd']) {
          type.push('snappy');
        }
        else if (hook.scope) {
          type.push('scope');
        }
      });

      if (type.length === 0) {
        unlink(files);
        callback('No app or scope found in manifest');
      }
      else {
        pkg.types = _.uniq(type);
        callback();
      }
    }
  }
  else {
    unlink(files);
    callback('Invalid json in manifest');
  }
}

function extractControl(pkg, files, callback) {
  var f = fs.createWriteStream(files.manifest)
  .on('finish', function() {
    parseControl(pkg, files, callback);
  });

  var found = false;
  fs.createReadStream(files.control)
  .on('error', function(err) {
    callback(err);
  })
  .pipe(zlib.Unzip())
  .pipe(tar.Parse())
  .on('entry', function(entry) {
    if (entry.path.substring(2) == 'manifest') {
      entry.pipe(f);
      found = true;
    }
  })
  .on('end', function() {
    if (!found) {
      callback('Could not find manifest file');
    }
  });
}

function parse(pkg, f, callback) {
  var files = {
    click: f,
    data: f.replace('.click', '.tar.gz'),
    manifest: f.replace('.click', '.manifest'),
    control: f.replace('.click', '.control.tar.gz'),
    desktops: []
  };

  var foundData = false;
  var foundControl = false;
  var archive = new ar.Archive(fs.readFileSync(files.click));
  _.forEach(archive.getFiles(), function(file) {
    if (file.name() == 'data.tar.gz') {
      fs.writeFileSync(files.data, file.fileData());
      foundData = true;
    }
    else if (file.name() == 'control.tar.gz') {
      fs.writeFileSync(files.control, file.fileData());
      foundControl = true;
    }
  });

  if (!foundData || !foundControl) {
    callback('Malformed click package');
  }
  else {
    pkg.types = [];
    extractControl(pkg, files, function(err) {
      if (err) {
        checkSnappy(files.data, function(err2, snappy) {
          if (err2) {
            callback(err + ' ' + err2);
          }
          else {
            if (snappy) {
              pkg.types = ['snappy'];
              callback();
            }
            else {
              callback(err);
            }
          }
        });
      }
      else {
        //Check if it's a web app
        if (pkg.types.indexOf('application') > -1) {
          var webapps = [];
          async.eachSeries(files.desktops, function(file, cb) {
            extractData(files.data, file, function(err, webapp) {
              if (err) {
                cb(err);
              }
              else {
                webapps.push(webapp);
                cb();
              }
            });
          }, function(err) {
            if (err) {
              callback(err);
            }
            else {
              if (webapps.length > 0 && webapps.length == _.compact(webapps).length) { //All the apps included are webapps
                var index = pkg.types.indexOf('application');
                pkg.types.splice(index, 1);
                pkg.types.push('webapp');
              }
              else { //Not all the apps are webapps (if any)
                _.forEach(webapps, function(webapp) {
                  if (webapp) {
                    pkg.types.push('webapp');

                    return false;
                  }
                });
              }

              callback();
            }

            unlink(files);
          });
        }
        else {
          unlink(files);
          callback();
        }
      }
    });
  }
}

function parseClickPackage(pkg, file, callback) {
  console.log('Going to parse ' + file);

  parse(pkg, file, function(err) {
    if (err) {
      console.error(err);
    }

    callback(err);
  });
}

exports.parseClickPackage = parseClickPackage;
