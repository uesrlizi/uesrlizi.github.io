/* data.js — 作品档案的读取、过滤与双语取值
   works.json 是唯一需要常改的数据文件；这里只提供访问工具。
*/
const TYPE_LABELS = {
  game:    { zh: '游戏',     en: 'Game' },
  shader:  { zh: '着色器',   en: 'Shader' },
  tool:    { zh: '工具',     en: 'Tool' },
  artwork: { zh: '艺术作品', en: 'Artwork' },
  course:  { zh: '课程项目', en: 'Course Project' },
};

/* 排序：置顶（featured）优先，其余按日期倒序（新的在前） */
function worksSort(a, b) {
  if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
  return String(b.date || '').localeCompare(String(a.date || ''));
}

/* 双语取值：lang 为 en 且 XxxEn 字段非空时用英文，否则回退中文原字段 */
function pickField(work, base, lang) {
  if (lang === 'en') {
    const v = work[base + 'En'];
    if (v != null && String(v).trim() !== '') return v;
  }
  return work[base] != null ? work[base] : '';
}

const Works = {
  _cache: null,

  async all() {
    if (!this._cache) {
      const res = await fetch('data/works.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error('works.json ' + res.status);
      // 忽略没有 id 或 id 以 _ 开头的条目：允许在 JSON 里放 "_readme" 之类的注释对象
      this._cache = (await res.json()).filter(
        w => w && typeof w.id === 'string' && !w.id.startsWith('_')
      );
    }
    return this._cache;
  },

  /* tag === '*' 返回全部（archive 页用），否则按 tags 数组过滤 */
  async byTag(tag) {
    const works = await this.all();
    const list = tag === '*' ? works.slice() : works.filter(w => (w.tags || []).includes(tag));
    return list.sort(worksSort);
  },

  async byId(id) {
    const works = await this.all();
    return works.find(w => w.id === id) || null;
  },

  typeLabel(type, lang) {
    return TYPE_LABELS[type] ? TYPE_LABELS[type][lang] : (type || '');
  },
};
