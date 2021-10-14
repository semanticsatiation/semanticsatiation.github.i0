const path = require('path'); 
const webpack = require('webpack');

module.exports = {
    mode: "development",
    context: __dirname,
    entry: [
        'babel-polyfill',
        'react-hot-loader/patch',
        "webpack-dev-server/client?http://0.0.0.0:8080", // WebpackDevServer host and port
        "webpack/hot/only-dev-server",
        './frontend/bug_off.jsx',
    ],
    output: {
        path: path.resolve(__dirname, 'app', 'assets', 'javascripts'),
        filename: 'bundle.js',
        hotUpdateChunkFilename: 'hot/hot-update.js',
        hotUpdateMainFilename: 'hot/hot-update.json',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    query: {
                        presets: ['@babel/env', '@babel/react']
                    }
                },
            },
            {
                test: /\.(png)$/i,
                use: {
                    loader: 'url-loader',
                },
            }
        ]
    },
    devtool: 'source-map',
    resolve: {
        extensions: [".js", ".jsx", "*"]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};


