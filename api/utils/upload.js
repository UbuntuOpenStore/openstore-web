'use strict';

const config = require('../utils/config');
const db = require('../db');
const helpers = require('../utils/helpers');
const parse = require('../utils/click-parser-async');
const logger = require('../utils/logger');

const fs = require('fs');
const path = require('path');
const B2 = require('backblaze-b2');

function removeFile(url) {
    if (url && url.indexOf(config.backblaze.url) == 0) {
        let b2 = new B2({
            accountId: config.backblaze.accountID,
            applicationKey: config.backblaze.appKey,
        });

        return b2.authorize().then(() => {
            return b2.listFileVersions({
                bucketId: config.backblaze.bucket,
                startFileName: url.replace(config.backblaze.url, ''),
            });
        }).then((res) => {
            return Promise.all(res.data.files.map((file) => {
                return b2.deleteFileVersion({
                    fileId: file.fileId,
                    fileName: file.fileName,
                });
            }));
        });
    }
    else {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }
}

function uploadFile(localPath, remotePath) {
    if (localPath) {
        let b2 = new B2({
            accountId: config.backblaze.accountID,
            applicationKey: config.backblaze.appKey,
        });

        return b2.authorize().then(() => {
            return b2.getUploadUrl(config.backblaze.bucket);
        }).then((res) => {
            return b2.uploadFile({
                uploadUrl: res.data.uploadUrl,
                uploadAuthToken: res.data.authorizationToken,
                filename: remotePath,
                data: fs.readFileSync(localPath),
            });
        }).then((results) => {
            return config.backblaze.url + remotePath;
        });
    }
    else {
        return null;
    }
}

//TODO process to reupload old packages
function uploadPackage(pkg, filePath, iconPath) {
    let remoteIconPath = `icons/${pkg.id}${path.extname(iconPath)}`;
    let remoteFilePath = `packages/${pkg.id}_${pkg.version}_${pkg.architecture}${path.extname(filePath)}`;

    return removeFile(pkg.package).then(() => {
        return Promise.all([
            uploadFile(iconPath, remoteIconPath),
            uploadFile(filePath, remoteFilePath),
        ]);
    }).then((results) => {
        if (results[0]) {
            pkg.icon = results[0];
        }
        else {
            pkg.icon = config.server.host + '/img/404.png'
        }

        if (results[1]) {
            pkg.package = results[1];
        }

        return pkg;
    });
}

//This is not how you do promises :/
function transferStorage() {
    logger.debug('transferStorage');
    return db.Package.find({}).then((pkgs) => {
        pkgs = pkgs.filter((pkg) => {
            return (pkg.package.indexOf(config.backblaze.url) != 0);
        });

        logger.debug('going to transfer', pkgs.length);
        return Promise.all(pkgs.map((pkg) => {
            var tmpFile = '/tmp/' + pkg.package.replace(/\//g, '_').replace(':', '_');
            logger.debug('transfering', pkg.id, pkg.package, tmpFile);

            return helpers.download(pkg.package, tmpFile).then(() => {
                logger.debug('downloaded', tmpFile);
                return parse(tmpFile, true).then((parsed) => {
                    logger.debug('parsed', parsed.icon);
                    return uploadPackage(pkg, tmpFile, parsed.icon).then((pkg) => {
                        fs.unlink(tmpFile);

                        logger.debug('uploaded', pkg.package);
                        return pkg.save();
                    });
                })
            });
        }));
    });
}

exports.uploadPackage = uploadPackage;
exports.transferStorage = transferStorage;
