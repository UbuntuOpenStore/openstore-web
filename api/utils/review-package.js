'use strict';

const config = require('./config');
const logger = require('./logger');

const exec = require('child_process').exec;

function reviewPackage(file) {
    return new Promise((resolve, reject) => {
        let command = `${config.clickreview.command} --json ${file}`;
        exec(command, {PYTHONPATH: config.clickreview.pythonpath}, function callback(err, stdout, stderr) {
            if (err) {
                logger.error('Error processing package for review: ' + err);
                logger.error(stdout);
                logger.error(stderr);
                logger.error(`Command: ${command}, PYTHONPATH: ${config.clickreview.pythonpath}`);
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
