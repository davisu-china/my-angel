# 照片与音乐资源

按用户明确要求，`ziye-warm.jpg`、`ziye-daylight.jpg`、`ziye-evening.jpg` 三张照片纳入 Git 提交。这三张是压缩并清理元数据的网页版本，不是原始附件。其他媒体仍由 `.gitignore` 默认排除，不包含商业歌曲音源。

星光占位 SVG 仍保留，缺少照片时，源码页面与导出页面都使用占位图。公开仓库中的照片可以被他人下载和复制，请确认相关分享权限。

配乐已确认为尹美莱（Yoon Mi-rae）、徐正权（Tiger JK）和 Bizzy 演唱的《Angel》。仓库暂不附带原曲，仍需提供有权使用的音频文件。预览时可直接在页面选择本地歌曲；该操作不会上传或保存文件。

持有合法可分发音源时，把文件放在本目录，例如 `angel.mp3`，再设置 `experience/index.html` 中 `#background-music` 的 `data-src="assets/angel.mp3"`。导出脚本会将本地音源内嵌至离线 HTML，并同步至本机 `public/experience/`；这些生成文件同样默认不提交。公开发布前需确认照片同意与音源分发授权。
