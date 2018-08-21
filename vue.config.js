module.exports = {
    configureWebpack: {
        devServer: {
            host: '0.0.0.0',
            port: 8081,
            watchOptions: {
                poll: true,
            },
            disableHostCheck: true,
        },
    },
};
