# 本地 Pictogram 贴纸

## 来源边界

`claude-whiteboard` 属于 baoyu-design 的混合许可内容。其 NOTICE 说明：编辑器中来自 Anthropic 的素材不适用该项目的 MIT 许可。当前 Skill 只提供新编写的工作流和读取适配器，不包含上游图形路径、字体、编辑器、截图或导出的贴纸。

来源与说明：

- <https://github.com/JimLiu/baoyu-design>
- <https://github.com/JimLiu/baoyu-design/blob/main/NOTICE.md>

脚本读取用户本机已有的安装，不下载素材。生成文件可用于当前已授权的文稿制作；文稿或素材库的进一步分发仍按各自适用条款处理。不要将本地导出的图形加入 Skill 仓库。

## 脚本用法

需要 Node.js 22 或更新版本，不需要 npm 安装。以下 `scripts/` 相对本 Skill 目录。

```bash
node scripts/render-stickers.mjs --list
node scripts/render-stickers.mjs --icons magnifier,puzzle --output work/stickers
node scripts/render-stickers.mjs --source /path/to/claude-whiteboard --icons paper-plane --output work/stickers
node scripts/render-stickers.mjs --icons lightbulb --accent '#CD8292' --pale '#F5E1E7' --ink '#242424' --output work/stickers
```

`--source` 接受 Skill 目录或其中的 `scripts/editor/artifact-type/app.js`。不传时，在 `CODEX_HOME` 对应的缓存、`~/.codex` 缓存和常见 Skill 目录中查找，优先选择缓存中的最新版本。

`--list` 只列可用名称。默认输出四个物件：灯泡、放大镜、拼图和纸飞机。显式选择其他物件时，以列表实际存在的名称为准。

SVG 保留透明背景和白色模切边，只有贴纸自身的色块。默认采用本 Skill 的粉色深浅两档，原始路径与比例不变。支持 SVG 的幻灯片工具可直接插入；需要 PNG 时，用当前环境可用的 SVG 渲染工具转换，不改变比例。

## 兼容性

适配器针对包含 `STICKER_PACK_ART_IDS` 与 `PICTOGRAM_PATHS` 的本地编辑器数据模块。只在受限的 Node VM 中初始化该数据模块，不运行编辑器，不访问账号、网络或浏览器。

如果上游改了打包方式或字段，脚本会明确失败，不输出假贴纸。先检查用户给的安装目录和当前上游结构，再做有依据的窄范围适配；不要复制整个编辑器来兜底。
