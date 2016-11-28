var webpack = require('webpack');

module.exports = {
    entry : './public/js/src/module/index.es6',
    output: {
        path: __dirname + '/public/js/bin',
        filename: 'index.js'
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