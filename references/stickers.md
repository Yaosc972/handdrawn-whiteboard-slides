# 内置物件贴纸 / Bundled object stickers

`assets/stickers/` 包含 12 张为本项目独立绘制的 SVG，采用 MIT 许可。透明背景、近黑粗线、粉色深浅两档和白色模切边。它们是可以直接使用和修改的资源，不需要另装贴纸库。

| ID | 中文 | English | 用途 |
|---|---|---|---|
| `lightbulb` | 灵感灯泡 | Idea bulb | 想法与发现 |
| `magnifier` | 查证放大镜 | Magnifier | 观察与证据 |
| `puzzle` | 组合拼图 | Puzzle pieces | 复用与适配 |
| `paper-plane` | 试飞纸飞机 | Paper plane | 原型与首次尝试 |
| `pencil` | 草稿铅笔 | Draft pencil | 写作与修改 |
| `compass` | 方向罗盘 | Compass | 方向与取舍 |
| `book` | 展开的笔记 | Open notebook | 理解与学习 |
| `checklist` | 完成清单 | Checklist | 检查与交付 |
| `flask` | 验证烧瓶 | Experiment flask | 假设与实验 |
| `seedling` | 生长幼苗 | Seedling | 维护与持续改进 |
| `chat` | 讨论气泡 | Discussion bubble | 反馈与沟通 |
| `layers` | 系统层次 | System layers | 架构与关系 |

完整机器可读目录：`assets/stickers/manifest.json`。可离线打开 `assets/stickers/index.html` 浏览。

## 使用与改色

直接把 SVG 插入支持该格式的演示工具，保持比例。需要 PNG 的工具可以用现有 SVG 渲染工具转换。原图画布为 256 × 256，默认显示尺寸 512 × 512。

以下命令相对 Skill 目录执行；输出目录相对当前工作目录。Node.js 22+ 即可，不需要 npm 安装或网络。

```bash
node scripts/render-stickers.mjs --list
node scripts/render-stickers.mjs --icons magnifier,puzzle --output work/stickers
node scripts/render-stickers.mjs --icons all --output work/stickers
node scripts/render-stickers.mjs --icons lightbulb --accent '#649AB6' --pale '#E8F1F7' --ink '#242424' --output work/blue-stickers
```

脚本不修改原始素材。未知名称或无效颜色会在输出前报错，避免留下部分导出。更换主题时同步调整幻灯片强调色，白色边缘保持白色。

## English

All 12 SVG stickers are original artwork bundled with this repository under the MIT license. Use the files directly, or export a selection with the dependency-free Node.js script above. The script can recolor the accent, pale fill and ink while preserving the white cut edge and original geometry. It never downloads assets or modifies the source folder.
