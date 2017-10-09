const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path'); // 提供路径处理

module.exports = merge(common, {
    // 文件出口
    output: {
        filename: '[name].bundle.js', // 输出文件名称
        chunkFilename: '[name].bundle.js', // 动态导入的输出文件名
        path: path.resolve(__dirname, 'dist') // 这里的路径必须是绝对路径，所以需要path将相对路径转换为绝对路径
    },
    devtool: 'inline-source-map', // source-map
    devServer: {
        contentBase: './dist',
        hot: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin() // 模块热更新
    ],
    module: {
        rules: [{
            test: /\.scss$/, // 检测文件类型
            use: [{
                loader: "style-loader" // 将 JS 字符串生成为 style 节点
            }, {
                loader: "css-loader" // 将 CSS 转化成 CommonJS 模块
            }, {
                loader: "sass-loader" // 将 Sass 编译成 CSS
            }]
        }]
    }
});