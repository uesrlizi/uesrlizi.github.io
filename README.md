# 个人作品集网站

游戏开发作品集：**全量档案 + 按身份筛选**（技术美术 / 游戏程序 / 艺术申研）。
纯 HTML/CSS/JS，无框架无构建，中英双语，托管于 GitHub Pages。

## 本地预览

```bash
# 在项目根目录（列表页要 fetch 数据，file:// 直接打开会空白，必须走 HTTP）
python -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 目录结构

```
data/works.json   ★ 全部作品档案——加作品/改内容只动这一个文件
index.html        首页：身份入口
ta.html           技术美术视图（按标签「技术美术」过滤）
program.html      游戏程序视图（按标签「游戏程序」过滤）
art.html          艺术申研视图（按标签「艺术申研」过滤）
archive.html      全部档案
works.html        通用详情页模板：works.html?id=作品id
css/style.css     样式（主题色在 :root 的 --accent 一处）
js/               i18n（双语）、data（读取/过滤）、render（渲染）
img/covers/       封面图（现在是被占位 SVG）
img/works/<id>/   每件作品的截图
tools/            占位图生成脚本
```

## 加一件作品（推荐丢给 AI）

**本站约定的维护模式：用户不手改 JSON，一切数据改动交给 AI。** 完整字段规范在
**`data/SPEC.md`**（专为 AI 编写：标签词表、字段表、任务配方、自查清单）。
把 SPEC.md 里的提示词模板连同作品信息扔给任意 AI 即可，例如：

> 请阅读 data/SPEC.md，按规范在 data/works.json 新增一件作品：标题《……》、类型 game、
> 标签 [游戏程序, 技术美术]、BV号 BV1xx……、简介：……（中英）、图片先用占位。
> 改完按 SPEC.md 的自查清单核对。

手动路径（AI 同样适用）：

1. **图**：封面放 `img/covers/<id>.jpg`（16:10 横版），截图放 `img/works/<id>/1.jpg、2.jpg…`
2. **数据**：`data/works.json` 里**末尾追加**一条（字段含义见 SPEC.md）：

```json
{
  "id": "my-new-game",              ← 唯一 id，网址用（works.html?id=my-new-game）
  "title": "《新游戏》",
  "titleEn": "New Game",            ← 英文留空 "" 则英文版自动回退显示中文
  "desc": "一句话简介（列表卡片上）",
  "descEn": "",
  "detail": "详情段落，空一行分段。",
  "detailEn": "",
  "type": "game",                   ← game | shader | tool | artwork | course
  "tags": ["游戏程序", "技术美术"],   ← 出现在哪些身份页；纯归档就只写 "档案"
  "date": "2026-10",
  "role": "程序", "roleEn": "Programmer",
  "tech": ["Unity", "C#"],
  "cover": "img/covers/my-new-game.jpg",
  "shots": ["img/works/my-new-game/1.jpg", "img/works/my-new-game/2.jpg"],
  "video": { "bvid": "BV1xxxxxxxx", "youtube": "" },   ← B站视频的 BV 号；没视频就 ""
  "links": { "itch": "", "steam": "", "github": "", "demo": "" },
  "featured": false,                ← true 会置顶
  "customPage": ""                  ← 填 "custom/xxx.html" 则卡片链到手写定制页
}
```

3. **上传**：`git add -A && git commit -m "add: 新游戏" && git push`，约 1 分钟后生效。

## 视频怎么填

- **B站**：视频页网址里的 `BV1xx411c7xx` 就是 bvid，填进 `video.bvid`，详情页自动嵌入播放器
- **YouTube**（以后）：视频网址 `watch?v=` 后面那串填进 `video.youtube`，详情页自动多一个「YouTube 版」外链
- 没有 BV 号的作品视频区自动隐藏，不影响排版

## 双语机制

- 页面右上角 **EN / 中文** 按钮切换；`网址?lang=en` 直接进英文版（申研分享用）
- 作品文案：`xxx` 是中文，`xxxEn` 是英文；`xxxEn` 留空自动回退中文（echo-cavern 是演示例子）
- 页面固定文案在 `js/i18n.js` 的 `I18N` 字典里，zh/en 各一份

## 还需要替换的占位内容

| 位置 | 改什么 |
|---|---|
| `img/` | 占位 SVG 换成真实封面/截图（tools/gen_placeholders.py 可重跑生成占位） |
| 部分作品详情 | 标注「可再补充」的段落换成具体负责模块与技术点 |

## 设计说明

- **品牌位 = 真名**「李璟涵 / Jinghan Li」：全站 logo、首页标题、各页 `<title>` 都用它；
  头像 `img/avatar.jpg`（256px）是全站视觉标识，与各平台头像一致。
- **B站 handle「李子最帅哒」只出现在页脚署名**，不做品牌位（本人意愿，初中起的名有点羞耻）。
- **设计基调：克制**。不加副标题、装饰性小字、注释式文案；卡片只留 封面 / 日期·类型 / 标题，
  其余信息（简介、技术栈、链接）都在详情页。改版时延续这个基调，别往回加"解释性小字"。
- 主题色只在 `css/style.css` 的 `:root --accent` 一处。

## 旗舰作品定制页（可选）

想给重点作品做专属页面：在根目录建 `custom/xxx.html`（随意写，头部引用 `../css/style.css`），
然后把作品条目的 `customPage` 设为 `"custom/xxx.html"`——列表卡片就会链到它而不是通用模板页。

## 部署到 GitHub Pages（一次性）

1. GitHub 上新建仓库，名字必须是 `<用户名>.github.io`（如 `zhangsan.github.io`），Public
2. 本地初始化并推送：

```bash
git init
git add -A
git commit -m "init: portfolio site"
git branch -M main
git remote add origin https://github.com/<用户名>/<用户名>.github.io.git
git push -u origin main
```

3. 仓库 Settings → Pages 确认 Source 是 `main` 分支 `/ (root)`（`用户名.github.io` 仓库默认已开启）
4. 1~2 分钟后访问 `https://<用户名>.github.io`

想用自定义域名（如 `yourname.com`）：域名商买一个（一年几十块），仓库里加 `CNAME`
文件写上域名，DNS 加一条 CNAME 指向 `<用户名>.github.io`。

## 素材清单（每件作品）

- 封面 ×1（横版 16:10，压缩到 200KB 以内最好，可用 [TinyPNG](https://tinypng.com)）
- 截图 ×2~6
- B站 BV 号（成片；先留空后补也行）
- 一段介绍 + 几段详情（是什么 / 你负责什么 / 技术难点与解决）
- 外链：itch.io / Steam / GitHub / 试玩包（有就填）
