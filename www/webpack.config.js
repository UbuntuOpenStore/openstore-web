const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    context: __dirname,
    entry: './app.js',
    output: {
        path: __dirname,
        filename: 'bundle.[chunkhash].js'
    },

    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.(png|gif)$/,
                use: 'url-loader',
            }, {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'file-loader'
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: 'url-loader',
            },
        ]
    },

    devServer: {
        historyApiFallback: {
            disableDotRule: true,
            verbose: true,
        },
        port: 8081,
    },
    resolve: {
        alias: { //Aliases for bower components
            swipebox: path.resolve(__dirname, 'bower_components/swipebox/src/js/jquery.swipebox.js'),
            Uploadcare: path.resolve(__dirname, 'bower_components/Uploadcare/uploadcare.min.js'),
        }
    },
    plugins: [
        new webpack.DefinePlugin({'process.env': {
            'API': (process.env.NODE_ENV == 'production') ? JSON.stringify('https://open.uappexplorer.com') : JSON.stringify('http://local.open.uappexplorer.com'),
            'UPLOADCARE_KEY': JSON.stringify(process.env.UPLOADCARE_KEY),
        }}),
        //new webpack.optimize.DedupePlugin(),
        //new webpack.optimize.UglifyJsPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: __dirname + '/index.html',
        }),
    ],
};
