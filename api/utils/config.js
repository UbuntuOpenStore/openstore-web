var config = {
    server: {
        ip: process.env.NODEJS_IP || '0.0.0.0',
        port: process.env.PORT || process.env.NODEJS_PORT || 8080,
        session_secret: process.env.SESSION_SECRET || 'open-appstore',
        host: process.env.HOST || 'http://local.open.uappexplorer.com:8080',
        process_limit: process.env.PROCESS_LIMIT || 0,
    },
    mongo: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost',
        database: process.env.MONGODB_DB || 'openappstore',
    },
    smartfile: {
        key: process.env.SMARTFILE_KEY || '',
        password: process.env.SMARTFILE_PASS || '',
        url: process.env.SMARTFILE_URL || 'https://app.smartfile.com/api/2/path/data/test/',
        share: process.env.SMARTFILE_SHARE || 'https://file.ac/MjgQmGAVzEU/',
    },
    papertrail: {
        host: process.env.PAPERTRAIL_HOST,
        port: process.env.PAPERTRAIL_PORT,
    },
    clickreview: {
        //Heroku command: /app/.apt/usr/bin/click-review
        command: process.env.CLICK_REVIEW_COMMAND || 'click-review',
        //Heroku pythonpath: /app/.apt/usr/lib/python3/dist-packages/
        pythonpath: process.env.CLICK_REVIEW_PYTHONPATH || '',
    }
};

//Mongo uri from docker
if (process.env.MONGO_PORT) {
    config.mongo.uri = process.env.MONGO_PORT.replace('tcp', 'mongodb');
}

module.exports = config;
