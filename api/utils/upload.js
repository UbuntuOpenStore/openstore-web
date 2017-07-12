'use strict';

const config = require('../utils/config');

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

exports.uploadPackage = uploadPackage;
