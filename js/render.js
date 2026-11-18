/* render.js — 动态内容渲染
   - renderList()        身份页/档案页的卡片网格（读 body 的 data-tag）
   - fillEntryCounts()   首页入口卡片上的作品计数（读 [data-count-tag]）
   - renderDetail()      works.html?id=xxx 的通用详情页模板
   所有函数幂等：语言切换（langchange）时直接重新调用即可。
*/

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

/* ---------- 卡片 ---------- */
function cardHTML(w, lang) {
  const url = w.customPage || ('works.html?id=' + encodeURIComponent(w.id));
  const title = pickField(w, 'title', lang);
  const type = Works.typeLabel(w.type, lang);
  const date = String(w.date || '').replace('-', ' / ');
  // 卡片克制原则：封面 + 日期·类型 + 标题，其余信息留给详情页
  return `
  <a class="card" href="${esc(url)}">
    <div class="card-cover"><img src="${esc(w.cover)}" alt="${esc(title)}" loading="lazy"></div>
    <div class="card-body">
      <p class="card-meta mono"><span>${esc(date)}</span><span class="type">${esc(type)}</span></p>
      <h3>${esc(title)}</h3>
    </div>
  </a>`;
}

/* ---------- 身份页 / 档案页列表 ---------- */
async function renderList() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  const lang = i18n.lang;
  const tag = document.body.dataset.tag || '*';
  let works;
  try {
    works = await Works.byTag(tag);
  } catch (e) {
    grid.innerHTML = `<p class="error">${esc(i18n.t('err.load'))}</p>`;
    return;
  }
  grid.innerHTML = works.map(w => cardHTML(w, lang)).join('');
}

/* ---------- 首页入口计数 ---------- */
async function fillEntryCounts() {
  const els = document.querySelectorAll('[data-count-tag]');
  if (!els.length) return;
  let works;
  try { works = await Works.all(); } catch (e) { return; }
  els.forEach(el => {
    const tag = el.dataset.countTag;
    const n = tag === '*' ? works.length
      : works.filter(w => (w.tags || []).includes(tag)).length;
    const tpl = (i18n.lang === 'en' && n === 1) ? 'entry.countOne' : 'entry.count';
    el.textContent = i18n.t(tpl).replace('{n}', n);
  });
}

/* ---------- 详情页 ---------- */
function detailHTML(w, lang) {
  const title = pickField(w, 'title', lang);
  const type = Works.typeLabel(w.type, lang);
  const date = String(w.date || '').replace('-', ' / ');
  const role = pickField(w, 'role', lang);
  const desc = pickField(w, 'desc', lang);
  const detail = pickField(w, 'detail', lang);
  const paragraphs = String(detail).split(/\n{2,}/)
    .filter(p => p.trim())
    .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');

  // 视频：B站嵌入 + 站外链接；bvid 为空则整块隐藏（优雅降级）
  const bvid = w.video && w.video.bvid ? String(w.video.bvid).trim() : '';
  const yt = w.video && w.video.youtube ? String(w.video.youtube).trim() : '';
  let videoBlock = '';
  if (bvid) {
    videoBlock = `
    <div class="video-wrap">
      <iframe src="https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=1&high_quality=1&autoplay=0&danmaku=0"
              scrolling="no" frameborder="0" allowfullscreen
              allow="fullscreen; encrypted-media; picture-in-picture"></iframe>
    </div>
    <p class="video-links mono">
      <a href="https://www.bilibili.com/video/${encodeURIComponent(bvid)}" target="_blank" rel="noopener">${esc(i18n.t('detail.watchOnBili'))}</a>
      ${yt ? `<a href="https://www.youtube.com/watch?v=${encodeURIComponent(yt)}" target="_blank" rel="noopener">${esc(i18n.t('detail.watchOnYT'))}</a>` : ''}
    </p>`;
  }

  const shots = (w.shots || []).map(s =>
    `<img src="${esc(s)}" alt="${esc(title)} screenshot" loading="lazy">`).join('');

  const L = w.links || {};
  const linkDefs = [
    ['itch', i18n.t('detail.itch')],
    ['steam', i18n.t('detail.steam')],
    ['github', i18n.t('detail.github')],
    ['demo', i18n.t('detail.demo')],
  ];
  const linkBtns = linkDefs.filter(([k]) => L[k])
    .map(([k, label]) => `<a class="btn" href="${esc(L[k])}" target="_blank" rel="noopener">${esc(label)}</a>`).join('');

  const chips = (w.tech || []).map(t => `<span class="chip mono">${esc(t)}</span>`).join('');

  return `
  <p class="meta mono">${esc(date)} · ${esc(type)}${role ? ' · ' + esc(role) : ''}</p>
  <h1>${esc(title)}</h1>
  <p class="lead">${esc(desc)}</p>
  ${videoBlock}
  ${shots ? `<div class="gallery">${shots}</div>` : ''}
  ${paragraphs ? `<div class="detail-body">${paragraphs}</div>` : ''}
  ${chips ? `<div class="detail-tech"><div class="chips">${chips}</div></div>` : ''}
  ${linkBtns ? `<div class="detail-links">${linkBtns}</div>` : ''}`;
}

/* 详情页顶栏"返回列表"：目标是来源列表页（读 referrer）；
   直接打开/来源不明则按作品首个身份标签落分类，纯档案作品落全部档案。*/
const ROUTE_PAGES = {
  'ta.html': 'ta.html',
  'program.html': 'program.html',
  'ai-art.html': 'ai-art.html',
  'art.html': 'art.html',
};
const TAG_LIST = {
  '技术美术': 'ta.html',
  '游戏工程师': 'program.html',
  'AI场景美术': 'ai-art.html',
  '申研作品集': 'art.html',
};
function backTarget(w) {
  try {
    const from = new URL(document.referrer).pathname.split('/').pop();
    if (ROUTE_PAGES[from]) return ROUTE_PAGES[from];
  } catch (e) { /* referrer 不可用 → 标签回落 */ }
  if (w) for (const t of (w.tags || [])) if (TAG_LIST[t]) return TAG_LIST[t];
  return 'archive.html';
}
function applyBackLink(w) {
  const href = backTarget(w);
  document.querySelectorAll('.back, .back-top').forEach(el => {
    el.href = href;
    el.textContent = i18n.t('detail.backList');
  });
}

async function renderDetail() {
  const app = document.getElementById('detail');
  if (!app) return;
  const lang = i18n.lang;
  const id = new URLSearchParams(location.search).get('id');

  let w = null;
  try {
    w = id ? await Works.byId(id) : null;
  } catch (e) {
    app.innerHTML = `<p class="error">${esc(i18n.t('err.load'))}</p>`;
    return;
  }

  if (!w) {
    app.innerHTML = `
    <div class="notfound">
      <p>${esc(i18n.t('detail.notFound'))}</p>
      <a class="btn" href="archive.html">${esc(i18n.t('detail.notFoundHint'))}</a>
    </div>`;
    document.title = i18n.t('page.works') + ' · ' + i18n.t('site.name');
    applyBackLink(null);
    return;
  }

  /* 详情页强调色跟随作品的第一条身份标签 */
  const TAG_ACCENT = { '技术美术': 'teal', '游戏工程师': 'amber', 'AI场景美术': 'violet', '申研作品集': 'rust' };
  const acc = (w.tags || []).map(t => TAG_ACCENT[t]).find(Boolean);
  if (acc) document.body.dataset.accent = acc;

  app.innerHTML = detailHTML(w, lang);
  document.title = pickField(w, 'title', lang) + ' · ' + i18n.t('site.name');
  applyBackLink(w);
  bindLightbox(app);
}

/* ---------- 截图灯箱：点开放大，点背景/关闭键收起 ---------- */
function bindLightbox(scope) {
  const dlg = document.getElementById('lightbox');
  if (!dlg) return;
  const big = dlg.querySelector('img');
  scope.querySelectorAll('.gallery img').forEach(img => {
    img.addEventListener('click', () => {
      big.src = img.src;
      big.alt = img.alt;
      dlg.showModal();
    });
  });
  dlg.querySelectorAll('.lightbox-close').forEach(btn =>
    btn.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); }); // 点背景关闭
}
