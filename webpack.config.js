var webpack = require('webpack');

module.exports = {
    entry : __dirname + '/lib/wxmoment/index.js',
    output: {
        path: __dirname + '/build',
        filename: 'qmui_h5.js'
    },
    module : {
        loaders: [
            {
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            }
        ]
    }
};