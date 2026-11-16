# 手绘白板演示

一个 Codex Skill，用白底、中文手写字、粉色强调和物件贴纸制作演讲型幻灯片。支持从材料新建几页试作，也支持保留原有文字与图解，只替换插画。

## 使用

把本仓库放到 Codex 的 Skills 目录，例如：

```bash
git clone https://github.com/Yaosc972/handdrawn-whiteboard-slides.git ~/.codex/skills/handdrawn-whiteboard-slides
```

私有仓库需要当前 GitHub 账号有访问权限。若 Codex 尚未发现新 Skill，重新打开会话后调用：

```text
使用 $handdrawn-whiteboard-slides，把这份材料做成 4 页手绘白板演示。
保留白底、手写字和粉色强调，用物件贴纸，不用人物。
```

也可以用于局部修改：

```text
使用 $handdrawn-whiteboard-slides，把现有演示里的插画换成物件贴纸。
保留原有文字、图解、背景与页数。
```

## 包含什么

- `SKILL.md`：内容取舍、视觉规则、现有文稿修改和交付检查。
- `references/layouts.md`：四类构图、字号与物件语义。
- `scripts/render-stickers.mjs`：从用户本机已安装的 `claude-whiteboard` 读取 Pictogram，导出独立 SVG。
- `references/stickers.md`：本地依赖、兼容性和素材来源说明。

演示生成和导出使用当前环境可用的工具，不绑定某个账号、云端文稿或文件格式。字体与贴纸没有随仓库打包。

## 本地贴纸

适配器需要 Node.js 22+，不需要 npm 安装。若已安装 baoyu-whiteboard：

```bash
node scripts/render-stickers.mjs --list
node scripts/render-stickers.mjs --icons lightbulb,magnifier,puzzle,paper-plane --output work/stickers
```

找不到安装时，通过 `--source /path/to/claude-whiteboard` 指定。未安装贴纸库也可以使用 Skill 的内容和排版方法，改用已有素材或原创物件贴纸。

## 素材来源

Pictogram 来自 [baoyu-design](https://github.com/JimLiu/baoyu-design) 本地白板编辑器。其[混合许可说明](https://github.com/JimLiu/baoyu-design/blob/main/NOTICE.md)区分了维护者代码和 Anthropic 内容。本仓库不包含上游编辑器、图形路径、字体或导出的贴纸。参见 [NOTICE.md](NOTICE.md)。
