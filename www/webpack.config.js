var webpack = require('webpack');

module.exports = {
    context: __dirname,
    entry: './app.js',
    output: {
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
                test: /\.png$/,
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
                exclude: /node_modules/,
                loader: 'jshint-loader'
            }
        ]
    },

    devServer: {
        historyApiFallback: true,
    },

    plugins: [
        new webpack.DefinePlugin({'process.env': {
            'API': (process.env.NODE_ENV == 'production') ? JSON.stringify('https://open.uappexplorer.com') : JSON.stringify('http://local.open.uappexplorer.com:3000'),
        }}),
        //new webpack.optimize.DedupePlugin(),
        //new webpack.optimize.UglifyJsPlugin(),
    ],

    jshint: {
        failOnHint: (process.env.NODE_ENV == 'production'),
    }
};
