# 私人媒体（默认不提交）

本目录的照片和音频默认由 `.gitignore` 排除。公开仓库只包含星光占位 SVG，没有真人照片或商业歌曲音源。

经本人同意后，可在本机放入 `ziye-warm.jpg`、`ziye-daylight.jpg`、`ziye-evening.jpg`。缺少照片时，源码页面与导出页面都使用占位图。

歌曲提案为 EXO 的《Angel（너의 세상으로）》韩语版，歌手版本仍待用户确认，仓库不附带原曲。预览时可直接在页面选择有权使用的本地歌曲；该操作不会上传或保存文件。

持有合法可分发音源时，把文件放在本目录，例如 `angel.mp3`，再设置 `experience/index.html` 中 `#background-music` 的 `data-src="assets/angel.mp3"`。导出脚本会将本地音源内嵌至离线 HTML，并同步至本机 `public/experience/`；这些生成文件同样默认不提交。公开发布前需确认照片同意与音源分发授权。
