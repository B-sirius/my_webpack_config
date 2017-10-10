const path = require('path'); // 提供路径处理
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 自动生成html
const CleanWebpackPlugin = require('clean-webpack-plugin'); // 清理 dist 目录

module.exports = {
    // 文件入口
    entry: {
        /* 此处需自己按需设置 */
        app: './src/script.js'
    },
    // 插件
    plugins: [
        new HtmlWebpackPlugin({
            /* 此处需自己按需设置 */
            title: 'colorPicker', // 网站标题
            template: './src/index.html'
        }),
        new CleanWebpackPlugin(['dist']),
    ],
    module: {
        // 文件处理
        rules: [{
                test: /\.css$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }]
            },
            {
                test: /\.html$/,
                use: [
                    'html-loader'
                ]
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader'
                ]
            }
        ]
    }
}