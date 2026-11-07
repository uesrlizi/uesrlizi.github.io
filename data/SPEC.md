# data/works.json 维护规范（写给 AI）

> 本文件是 `works.json` 的**唯一权威规范**。用户不手改 JSON——所有新增/修改作品的任务由 AI 执行，
> AI 必须先读完本文件再动手。改完后执行文末的自查清单。

## 硬规则（违反即产生线上 bug）

1. **id**：小写字母/数字/连字符组成的 slug（如 `starfall`、`level-toolkit`）。
   创建后**永不更改**（它是网址 `works.html?id=<id>` 的一部分，外部简历/申请材料里可能已引用）。
2. **tags 必须精确匹配词表**，一个字都不能差（页面按字符串过滤，写错 = 作品从该页消失）：
   - `技术美术` — 出现在技术美术实习向的视图
   - `游戏程序` — 出现在游戏程序向的视图
   - `艺术申研` — 出现在艺术类研究生申请向的视图
   - `档案` — 只归档、不主动展示（可与其他标签共存：有它不排斥别的页，它只是标记"不作为主打"）
3. **type 枚举**：`game` | `shader` | `tool` | `artwork` | `course`（页面上会翻译成中/英类型名）。
4. **date 格式** `YYYY-MM`，表示作品完成/发布月份。列表排序：`featured` 置顶，其余按 date 倒序（自动，无需手动排序数组）。
5. **双语回退**：`xxxEn` 字段留空 `""` = 英文版显示对应中文。不确定英文译文时宁可留空，不要机翻硬翻。
6. **图片路径必须真实存在**：封面 `img/covers/<id>.jpg`（或 png/webp），截图 `img/works/<id>/1.jpg、2.jpg…`。
   还没有真实图就先用占位：在 `tools/gen_placeholders.py` 的 `WORKS` 字典加 `"id": ("标题", 色相0-360)` 重跑脚本。
7. **JSON 语法**：无注释、无尾逗号、UTF-8。需要给人类留注释时，加一个**没有 id 字段**的对象条目
   （如 `{"_readme": "..."}`），网站渲染时会自动忽略——已有条目不要动。
8. **不要重排或删除**已有条目，除非用户明确要求。新条目追加到数组末尾即可。

## 字段表

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | ✅ | 唯一 slug，见硬规则 1；缺失或以 `_` 开头的条目被网站忽略 |
| `title` / `titleEn` | string | ✅ / 可空 | 作品名称（详情页与卡片标题） |
| `desc` / `descEn` | string | ✅ / 可空 | 一句话简介，显示在列表卡片 |
| `detail` / `detailEn` | string | ✅ / 可空 | 详情正文，**空一行 = 分段**（渲染成多个 `<p>`） |
| `type` | string | ✅ | 枚举见硬规则 3 |
| `tags` | string[] | ✅ | 词表见硬规则 2，可多选 |
| `date` | string | ✅ | `YYYY-MM` |
| `role` / `roleEn` | string | 建议 / 可空 | 担任角色（如 "程序 / 技术"） |
| `tech` | string[] | 建议 | 技术栈小标签（引擎、语言、工具名，原文即可不用翻译） |
| `cover` | string | ✅ | 封面图路径，建议 16:10 横版、<200KB |
| `shots` | string[] | 建议 | 截图路径数组，0~6 张 |
| `video.bvid` | string | 可空 | B站视频 BV 号（如 `BV1GJ411x7h7`）；空 = 详情页视频区隐藏 |
| `video.youtube` | string | 可空 | YouTube 视频 id（`watch?v=` 后那串）；空 = 不显示 YouTube 链接 |
| `links.itch` / `links.steam` / `links.github` / `links.demo` | string | 可空 | 外链，空的不渲染按钮；`demo` 是试玩/下载包 |
| `featured` | boolean | 可空 | `true` 置顶（每个身份页最多 1~2 个置顶） |
| `customPage` | string | 可空 | 手写定制页路径（如 `custom/xxx.html`）；填了卡片就链过去而不走通用模板 |

## 常见任务配方

- **新增作品**：确认图片已就位（或先生成占位）→ 在数组**末尾**追加完整条目 → 自查清单
- **改文案**：只动对应字段；改中文记得问用户是否同步 `xxxEn`
- **补视频**：填 `video.bvid`；以后注册了 YouTube 再补 `video.youtube`
- **换封面**：图片放进 `img/covers/`，更新 `cover` 路径
- **置顶**：目标条目 `featured: true`，同时把原来置顶的改回 `false`
- **挂定制页**：定制页放在 `custom/` 下（头部引用 `../css/style.css`），条目里 `customPage` 填相对路径

## 用户提示词模板（人类直接粘给 AI 用）

```
请阅读 data/SPEC.md，按规范在 data/works.json 新增一件作品：
标题：…… / 类型：…… / 标签：…… / 日期：…… / 担任：……
技术栈：…… / B站BV号：…… / 外链：……
一句话简介：……
详情（分段写好）：……
图片：已经放在 ……（或：先用占位图）
改完按 SPEC.md 末尾的自查清单核对。
```

## 自查清单（每次改完必过）

- [ ] `python -c "import json; json.load(open('data/works.json', encoding='utf-8'))"` 无报错
- [ ] 新条目 `id` 与现有条目不重复、不含中文/空格/大写
- [ ] 每个 `tags` 值都在词表里（逐字符核对）
- [ ] `cover` / `shots` 里所有路径在 `img/` 下真实存在
- [ ] `date` 是 `YYYY-MM` 格式
- [ ] 若改了已有条目：只改了用户要求改的字段
- [ ] 本地 `python -m http.server` 打开对应页面确认渲染正常
