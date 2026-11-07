/* i18n.js — 语言状态管理 + 静态文案字典
   用法：
   - 静态文案：HTML 元素加 data-i18n="key"，i18n.apply() 自动填充
   - 动态文案：JS 里用 i18n.t('key')
   - 切换按钮：<button onclick="i18n.toggle()">EN</button>
   - 深链：网址加 ?lang=en 直接进英文版（申研分享用）
   优先级：?lang 参数 > localStorage > 默认中文。修改文案 zh / en 两处都要改。
   品牌规范：品牌位一律真名「李璟涵 / Jinghan Li」；
   B站 handle「李子最帅哒」只出现在页脚署名，不做品牌位。
*/
const I18N = {
  zh: {
    'site.name': '李璟涵',
    'page.home': '首页',
    'page.ta': '技术美术',
    'page.program': '游戏程序',
    'page.art': '艺术申研',
    'page.archive': '全部档案',
    'page.works': '作品详情',

    'nav.home': '首页',
    'nav.ta': '技术美术',
    'nav.program': '游戏程序',
    'nav.art': '艺术申研',
    'nav.archive': '全部档案',

    'home.questionL1': '你希望我是',
    'home.questionL2': '谁？',
    'entry.count': '{n} 件作品',

    'err.load': '作品数据加载失败，请刷新重试。',

    'detail.back': '← 返回全部档案',
    'detail.watchOnBili': '在 Bilibili 打开 ▸',
    'detail.watchOnYT': 'YouTube 版 ▸',
    'detail.itch': 'itch.io 页面 ▸',
    'detail.steam': 'Steam 页面 ▸',
    'detail.github': '源码仓库 ▸',
    'detail.demo': '试玩 / 下载 ▸',
    'detail.notFound': '找不到这件作品——链接里的 id 可能不对，或者它还没被录入档案。',
    'detail.notFoundHint': '去全部档案里找找 ▸',

    'footer.rights': '© 2026 李璟涵 · B站 @李子最帅哒',

    'nf.title': '404 · 页面不存在',
    'nf.desc': '地址可能输错了，或者这个页面还没做出来。',
    'nf.back': '回首页 ▸',
    'lightbox.close': '关闭 ✕',
  },
  en: {
    'site.name': 'Jinghan Li',
    'page.home': 'Home',
    'page.ta': 'Tech Art',
    'page.program': 'Game Programming',
    'page.art': 'Art Application',
    'page.archive': 'Archive',
    'page.works': 'Work',

    'nav.home': 'Home',
    'nav.ta': 'Tech Art',
    'nav.program': 'Programming',
    'nav.art': 'Art App',
    'nav.archive': 'Archive',

    'home.questionL1': 'Who do you',
    'home.questionL2': 'need me to be?',
    'entry.count': '{n} works',

    'err.load': 'Failed to load works data. Please refresh.',

    'detail.back': '← Back to archive',
    'detail.watchOnBili': 'Open on Bilibili ▸',
    'detail.watchOnYT': 'YouTube version ▸',
    'detail.itch': 'itch.io page ▸',
    'detail.steam': 'Steam page ▸',
    'detail.github': 'Source code ▸',
    'detail.demo': 'Play / Download ▸',
    'detail.notFound': "Can't find this work — the id in the link may be wrong, or it hasn't been archived yet.",
    'detail.notFoundHint': 'Browse the full archive ▸',

    'footer.rights': '© 2026 Jinghan Li · Bilibili @李子最帅哒',

    'nf.title': '404 · Page not found',
    'nf.desc': 'The address may be mistyped, or this page does not exist yet.',
    'nf.back': 'Back to home ▸',
    'lightbox.close': 'Close ✕',
  },
};

const i18n = {
  lang: 'zh',

  init() {
    const fromUrl = new URLSearchParams(location.search).get('lang');
    const stored = localStorage.getItem('portfolio-lang');
    this.lang = (fromUrl || stored) === 'en' ? 'en' : 'zh';
    if (fromUrl) localStorage.setItem('portfolio-lang', this.lang);
    this.apply();
  },

  t(key) {
    return (I18N[this.lang] && I18N[this.lang][key]) != null
      ? I18N[this.lang][key]
      : (I18N.zh[key] != null ? I18N.zh[key] : key);
  },

  /* 填充所有 data-i18n 静态文案 + 按钮/标题状态，并广播 langchange 让动态内容重渲染 */
  apply() {
    document.documentElement.lang = this.lang === 'en' ? 'en' : 'zh-CN';
    document.documentElement.dataset.lang = this.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = this.lang === 'zh' ? 'EN' : '中文';
    const titleKey = document.body.dataset.titleKey;
    if (titleKey) document.title = this.t(titleKey) + ' · ' + this.t('site.name');
    window.dispatchEvent(new CustomEvent('langchange', { detail: { lang: this.lang } }));
  },

  toggle() {
    this.lang = this.lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('portfolio-lang', this.lang);
    const url = new URL(location.href);
    url.searchParams.set('lang', this.lang);
    history.replaceState(null, '', url);
    this.apply();
  },
};
