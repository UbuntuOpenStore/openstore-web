'use strict';

const crypto = require('crypto');
const fs = require('fs');


function checksum(filePath) {
    return new Promise((resolve, reject) => {
        let hash = crypto.createHash('sha512');
        let stream = fs.createReadStream(filePath);

        stream.on('data', (data) => {
            hash.update(data, 'utf8')
        });

        stream.on('error', (err) => {
            reject(err);
        });

        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });
    });
}

module.exports = checksum;
