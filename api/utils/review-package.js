'use strict';

const config = require('../utils/config');

const exec = require('child_process').exec;

function reviewPackage(file) {
    return new Promise((resolve, reject) => {
        exec(config.clickreview.command + ' --json ' + file, {PYTHONPATH: config.clickreview.pythonpath}, function callback(err, stdout, stderr) {
            if (err) {
                resolve(true);
            }
            else {
                let review = JSON.parse(stdout);
                let manualReview = false;
                for (let key in review) {
                    for (let level in review[key]) {
                        for (let label in review[key][level]) {
                            if (review[key][level][label].manual_review) {
                                manualReview = true;
                                //TODO explain why automatic review failed
                            }
                        }
                    }
                }

                resolve(manualReview);
            }
        });
    });
}

module.exports = reviewPackage;
