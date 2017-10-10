const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const ExtractTextPlugin = require('extract-text-webpack-plugin'); // 抽离css一类文件为单独文件，不再依赖js环境
const UglifyJSPlugin = require('uglifyjs-webpack-plugin'); // 代码压缩，且自动删去未被使用模块
const path = require('path'); // 提供路径处理

// 实例抽离sass插件
const extractSass = new ExtractTextPlugin({
    filename: "[name].[contenthash].css",
    disable: process.env.NODE_ENV === "development"
});

module.exports = merge(common, {
    /* 此处需自己按需设置 */
    entry: {
        vendor: [
            'clipboard', // 需要缓存的模块
        ]
    },
    // 文件出口
    output: {
        filename: '[name].[chunkhash].js', // 输出文件名称
        chunkFilename: '[name].bundle.js', // 动态导入的输出文件名
        path: path.resolve(__dirname, 'dist') // 这里的路径必须是绝对路径，所以需要path将相对路径转换为绝对路径
    },
    plugins: [
        extractSass,
        new UglifyJSPlugin({
            sourceMap: true
        }),
        new webpack.DefinePlugin({ // 指定环境 
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.HashedModuleIdsPlugin(), // 修复 vendor 的 hash 变化
        /* 此处需自己按需设置 */
        new webpack.optimize.CommonsChunkPlugin({ // 需要提取出的模块
            name: 'clipboard'
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: 'runtime' // 这里指定公共 bundle 的名称
        })
    ],
    devtool: 'source-map', // source-map
    module: {
        rules: [{
            test: /\.scss$/,
            use: extractSass.extract({
                use: [{
                    loader: "css-loader"
                }, {
                    loader: "sass-loader"
                }],
                // 在开发环境使用 style-loader
                fallback: "style-loader"
            })
        }, {
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/, // 忽略的文件
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['env']
                }
            }
        }]
    }
});