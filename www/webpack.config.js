var HtmlWebpackPlugin = require('html-webpack-plugin');
var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: './app.js',
    output: {
        hash: true,
        path: __dirname,
        filename: 'bundle.js'
    },

    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|gif)$/,
                loader: 'url'
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&minetype=application/font-woff'
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader'
            },
        ],
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'jshint-loader'
            }
        ]
    },

    devServer: {
        historyApiFallback: true,
        port: 8081,
    },
    resolve: {
        modulesDirectories: ['node_modules', 'bower_components']
    },
    plugins: [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
        ),
        new webpack.DefinePlugin({'process.env': {
            'API': (process.env.NODE_ENV == 'production') ? JSON.stringify('https://open.uappexplorer.com') : JSON.stringify('http://local.open.uappexplorer.com'),
            'UPLOADCARE_KEY': process.env.UPLOADCARE_KEY,
        }}),
        //new webpack.optimize.DedupePlugin(),
        //new webpack.optimize.UglifyJsPlugin(),
        new HtmlWebpackPlugin({
            hash: true,
            filename: 'index.html',
            template: __dirname + '/index.html',
        }),
    ],

    jshint: {
        failOnHint: (process.env.NODE_ENV == 'production'),
    }
};
