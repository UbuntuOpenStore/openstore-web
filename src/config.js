var config = {
    server: {
        ip: process.env.NODEJS_IP || '0.0.0.0',
        port: process.env.PORT || process.env.NODEJS_PORT || 3000,
        session_secret: process.env.SESSION_SECRET || 'open-appstore',
        host: process.env.HOST || 'http://local.open.uappexplorer.com:3000'
    },
    mongo: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost/',
        database: process.env.MONGODB_DB || 'openappstore',
    },
};

module.exports = config
