'use strict';

const parse = require('click-parser');

function parsePackage(file, getIcon) {
    return new Promise((resolve, reject) => {
        parse(file, getIcon, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

module.exports = parsePackage;