'use strict';

const config = require('./config');
const logger = require('./logger');

const exec = require('child_process').exec;

//TODO return the actual problem
function parseReview(review) {
    let manualReview = false;

    for (let key in review) {
        for (let level in review[key]) {
            for (let label in review[key][level]) {
                if (review[key][level][label].manual_review) {
                    manualReview = true;
                }
            }
        }
    }

    return manualReview;
}

function reviewPackage(file) {
    return new Promise((resolve, reject) => {
        let command = `${config.clickreview.command} --json ${file}`;
        exec(command, {env: {PYTHONPATH: config.clickreview.pythonpath}}, function callback(err, stdout, stderr) {
            if (err) {
                logger.error('Error processing package for review: ' + err);
                if (stderr) {
                    logger.error(stderr);
                }

                resolve(true);
            }
            else {
                let review = JSON.parse(stdout);

                resolve(parseReview(review));
            }
        });
    });
}

module.exports = reviewPackage;
