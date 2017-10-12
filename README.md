# 个人webpack常用配置

简单项目的webpack配置，为了能看到实际效果，以 IFE2017 中的 color-picker 为demo，实际的功能有：

## 通用配置

* 提供 html 模版，生成 html 并自动插入`<script>`等外部资源
* 路径处理
* 自动清理dist目录
* 脚本中各类资源的导入（css，html， 图片，字体）

## 开发配置

* 合并通用配置与开发配置
* Inline-source-map
* 模块热更新
* scss 导入

## 生产配置

* 合并通用配置与生产配置
* 使用 ExtractTextPlugin 抽离 css 等不应依赖 js 环境的文件（此例中处理了scss并进行了抽离）
* 输出添加 hash 值，防止不必要的浏览器缓存
* 提取出公共模块，利于浏览器缓存
* 代码压缩
* source-map
* babel（忽略node_modules等无需处理的目录）