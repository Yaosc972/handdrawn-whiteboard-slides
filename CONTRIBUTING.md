# Contributing / 参与贡献

Thanks for helping improve the examples, writing and artwork. A focused change with a clear before/after explanation is easy to review.

## Checks

Use Node.js 22 or newer. No dependency installation is needed.

```bash
npm test
npm run check
```

Open changed example pages in a browser. Check the affected slides, keyboard navigation, narrow-screen scaling and print layout. If you change artwork or layout, refresh the relevant preview images in `assets/previews/`.

## Stickers

Add original SVG artwork to `assets/stickers/` and register it in `manifest.json`, with a unique ID and Chinese and English labels. Keep the transparent background, 256 × 256 viewBox, readable silhouette, round ink contours and three shared palette colors. Preserve the white cut edge. Update the catalog and asset-count references if the pack grows.

Do not submit artwork copied or traced from another icon pack. Contributions to the bundled code and artwork are submitted under this repository's MIT license.

## Examples and documentation

Keep scenarios understandable without private project context. Label fictional examples, and use factual figures only when a public source supports them. Update both `README.md` and `README.en.md` when changing installation, commands or included capabilities.

## 中文

欢迎改进排版、示例、贴纸与翻译。提交时说明具体问题和修改后的效果。使用 Node.js 22+ 运行上面的两项检查；改动页面后，在浏览器里查看受影响的幻灯片、键盘翻页、窄屏缩放和打印布局，并更新对应预览图。

新增贴纸需要原创 SVG、中英文名称和唯一 ID，保持透明背景、256 × 256 画布、圆角墨线、统一色板和白色模切边。不要复制或描摹其他图标包。提交的代码与原创素材沿用本仓库的 MIT 许可。

示例采用可公开的材料，虚构场景应明确标注。涉及安装方式、命令或能力的变更，同时更新中英文 README。
