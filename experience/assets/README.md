# 照片与音乐资源

按用户明确要求，`ziye-warm.jpg`、`ziye-daylight.jpg`、`ziye-evening.jpg` 三张照片和用户提供的 `bgm.mp3` 纳入 Git。这三张是压缩并清理元数据的网页版本，不是原始附件。其他媒体仍由 `.gitignore` 默认排除。

星光占位 SVG 仍保留，缺少照片时，源码页面与导出页面都使用占位图。公开仓库中的照片可以被他人下载和复制，请确认相关分享权限。

配乐为尹美莱（Yoon Mi-rae）、徐正权（Tiger JK）和 Bizzy 演唱的《Angel》。`bgm.mp3` 来自用户提供的文件，约 4 分 15 秒、320 kbps，原样复制、未转码；它是默认背景音乐，通过右上角音乐开关手动播放后循环。底部配乐卡片与本地选曲入口已删除。

`experience/index.html` 中 `#background-music` 已设置 `data-src="assets/bgm.mp3"`。导出脚本将音源内嵌至离线 HTML，并同步至本机 `public/experience/`；这些生成文件默认不提交。照片与歌曲版权仍归原权利人，仓库不授予额外使用许可，公开发布前请确认分享与音源分发授权。
