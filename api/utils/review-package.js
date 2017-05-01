'use strict';

const config = require('./config');
const logger = require('./logger');

const exec = require('child_process').exec;

function reviewPackage(file) {
    return new Promise((resolve, reject) => {
        exec(config.clickreview.command + ' --json ' + file, {PYTHONPATH: config.clickreview.pythonpath}, function callback(err, stdout, stderr) {
            if (err) {
                logger.error('Error processing package for review: ' + err);
                logger.error(stdout);
                logger.error(stderr);
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