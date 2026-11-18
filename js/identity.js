/* identity.js — 身份页「摊牌」渲染（方案N 制式，四个身份页共用）
   - 数据：Works.byTag(body[data-tag])，置顶优先、日期倒序；第一件 = 主打卡，其余 = 同排行小卡
   - 同排行：hero 连浮字作整体占行首（左上第一），其余随行，放不下自动换行
   - 主打卡：出场拿进示竖排正面（浮字净空）→ 45° 斜轴翻一次落定横排满图；
     hover 翻回竖排正面（浮字同步净空），移出翻回——反转状态与浮字显隐完全联动
   - 小卡永远竖排正面；悬浮 = 判定原位的简单上浮（见 identity.css .lift）
   - 桌面织物：逐身份画场（节点网络 / 字符雨 / 极光浮斑 / 锈红墨痕），同种子稳定
   - 语言：i18n.js 广播 langchange 后原地重渲染；?lang 深链由 i18n.js 处理
   - ?shot=WxH 截图模式：终态直达，动画全关
*/
const SHOT_M = location.search.match(/shot=(\d+)x(\d+)/);
const SHOT = !!SHOT_M, SW = SHOT ? +SHOT_M[1] : 0, SH = SHOT ? +SHOT_M[2] : 0;
if (SHOT) {
  document.documentElement.style.setProperty('--sw', SW + 'px');
  document.documentElement.style.setProperty('--sh', SH + 'px');
  document.documentElement.classList.add('shot');
}
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = devicePixelRatio || 1;
const fmtDate = d => String(d || '').replace('-', ' / ');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ===== 当前身份（读 body data-tag；铭牌编号 01–04 直接写在页面 HTML 里）===== */
const PAGES = {
  '技术美术':   { key: 'ta',      seed: 11 },
  '游戏工程师': { key: 'program', seed: 22 },
  'AI场景美术': { key: 'ai',      seed: 33 },
  '申研作品集': { key: 'art',     seed: 44 },
};
const PAGE = PAGES[document.body.dataset.tag] || PAGES['技术美术'];

/* ===== 卡类组件：正面竖排 / 背面横排满图（45° 轴翻转） ===== */
function frontFace(w, idx, big) {
  const lang = i18n.lang;
  const role = big ? (pickField(w, 'role', lang) ? `<span>${esc(pickField(w, 'role', lang))}</span>` : '') : '';
  return `
    <span class="cidx tl">${idx}</span><span class="cidx br">${idx}</span>
    <span class="pbody">
      <span class="pcover"><img src="${esc(w.cover)}" alt="${esc(pickField(w, 'title', lang))}"></span>
      <span class="pname">${esc(pickField(w, 'title', lang))}</span>
      <span class="pmeta mono"><span>${esc(fmtDate(w.date))}</span><span class="type">${esc(Works.typeLabel(w.type, lang))}</span>${role}</span>
      <span class="ppip"></span>
    </span>`;
}
/* 背面 = 满图填充 + 遮罩，同款边框制式，无角标 */
function backFace(w) {
  return `<img class="bimg" src="${esc(w.cover)}" alt="${esc(pickField(w, 'title', i18n.lang))}"><span class="bscrim"></span>`;
}
/* 主打卡的字：浮在卡外桌面上（名 + meta，无链接行——整卡即入口） */
function labelHTML(w) {
  const lang = i18n.lang;
  const role = pickField(w, 'role', lang) ? `<span>${esc(pickField(w, 'role', lang))}</span>` : '';
  return `
    <div class="flabel">
      <p class="fname2">${esc(pickField(w, 'title', lang))}</p>
      <p class="fmeta2 mono"><span>${esc(fmtDate(w.date))}</span><span class="type">${esc(Works.typeLabel(w.type, lang))}</span>${role}</p>
    </div>`;
}
function workURL(w) {
  return w.customPage || ('works.html?id=' + encodeURIComponent(w.id));
}
function cardHTML(w, idx, opts) {
  const { cls = '', rv = '', deal = false, i = 0, rz = 0 } = opts || {};
  const url = workURL(w);
  const big = cls.includes('fcard3d');
  const inner = `
    <span class="lift">
      <span class="flip">
        <span class="face ffront">${frontFace(w, idx, big)}</span>
        <span class="face fback">${backFace(w)}</span>
      </span>
    </span>`;
  if (deal) {
    return `<span class="deal${rv}" style="--i:${i}"><a class="card3d wcard${rv}" style="--rz:${rz}deg" href="${esc(url)}">
      ${inner}</a></span>`;
  }
  return `<div class="fhold${rv}"><div class="card3d fcard3d${rv}" data-url="${esc(url)}" role="link" tabindex="0" aria-label="${esc(pickField(w, 'title', i18n.lang))}">
    ${inner}</div></div>`;
}
/* hero 连浮字 = 一个整体单元格（同排行制式） */
const RZ = [-1.7, 1.3, -1.1, 1.8, -1.4, 1.6, -1.9, 1.2];
const dealCard = (w, idx, i, rv) => cardHTML(w, idx, { deal: true, rv, i, rz: RZ[i % RZ.length] });
const heroColHTML = (w, rv) =>
  `<div class="hero-col"><div class="hero-raise">${cardHTML(w, '01', { cls: 'fcard3d', rv })}</div>${labelHTML(w)}</div>`;

/* ===== 渲染（幂等；开场演出只播首次） ===== */
async function render() {
  const first = !document.body.classList.contains('on');
  const rv = first ? ' rv0' : '';
  const front = document.getElementById('front');

  let works;
  try {
    works = await Works.byTag(document.body.dataset.tag || '*');
  } catch (e) {
    front.innerHTML = `<p class="error mono">${esc(i18n.t('err.load'))}</p>`;
    document.body.classList.add('on');
    return;
  }

  const cnt = document.getElementById('plaque-cnt');
  if (cnt) cnt.textContent =
    i18n.t(i18n.lang === 'en' && works.length === 1 ? 'entry.countOne' : 'entry.count').replace('{n}', works.length);

  if (!works.length) { front.innerHTML = ''; document.body.classList.add('on'); return; }
  const [lead, ...rest] = works;
  /* 同排行：hero 连浮字整体占行首（左上第一），其余随行，放不下自动换行 */
  const cells = [heroColHTML(lead, rv),
    ...rest.map((w, i) => dealCard(w, String(i + 2).padStart(2, '0'), i + 1, rv))];
  front.innerHTML = `<div class="stage-line">${cells.join('')}</div>`;
  document.body.classList.add('on');
  const card = front.querySelector('.fcard3d');
  if (!card) return;
  const label = front.querySelector('.flabel');
  let entered = !first;                  /* 开场演出未结束前，hover 不干预翻面 */
  if (first && !SHOT && !REDUCE) {
    /* 出场演出：拿进（示竖排正面，浮字净空）→ 45° 翻到横排满图面，浮字随翻面渐显 */
    label.classList.add('hold');
    setTimeout(() => {
      card.classList.add('open');
      label.classList.remove('hold');
      entered = true;
    }, 1000);
  } else {
    card.classList.add('open');          /* 非首次/截图/减弱动态：直接落定横排 */
  }
  /* hover 翻回竖排正面（看得出台是牌），移出翻回横排满图——浮字完全跟随反转状态 */
  card.addEventListener('mouseenter', () => {
    if (!entered) return;
    card.classList.remove('open');
    label.classList.add('hold');
  });
  card.addEventListener('mouseleave', () => {
    if (!entered) return;
    card.classList.add('open');
    label.classList.remove('hold');
  });
}

/* ===== 主打卡整块 = 一个点击目标 ===== */
document.addEventListener('click', e => {
  const hero = e.target.closest('.fcard3d');
  if (!hero || e.target.closest('a')) return;
  location.href = hero.dataset.url;
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter') return;
  if (!(e.target instanceof Element) || e.target.closest('a')) return;
  const hero = e.target.closest('.fcard3d');
  if (hero) location.href = hero.dataset.url;
});

/* ===== 桌面织物（全页画场：同首页卡语言、同种子；低姿态） ===== */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0;
  let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const cv = document.getElementById('felt'), g = cv.getContext('2d');
let fw = 0, fh = 0, FIELD = null;
const AI_SPRITES = ['167,139,250', '138,180,255', '196,150,255', '148,124,236'].map(mkSprite);
const ART_SPRITES = ['224,106,78', '164,74,54', '232,140,96', '150,64,48'].map(mkStroke);
const RAIN_CHARS = '01{}<>/;=+*#%&$@!?|:.'.split('');
const KWS = ['GODOT 4', 'UE 5', 'GDSCRIPT', 'C++', '蓝图', '轨道力学'];

function mkSprite(rgb) {
  const s = 320, c = document.createElement('canvas'); c.width = c.height = s;
  const x = c.getContext('2d');
  const gr = x.createRadialGradient(s / 2, s / 2, s * .03, s / 2, s / 2, s / 2);
  gr.addColorStop(0, `rgba(${rgb},.8)`); gr.addColorStop(.32, `rgba(${rgb},.36)`);
  gr.addColorStop(.68, `rgba(${rgb},.09)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, s, s); return c;
}
function mkStroke(rgb) {
  const s = 320, c = document.createElement('canvas'); c.width = c.height = s;
  const x = c.getContext('2d');
  x.translate(s / 2, s / 2); x.rotate(-.55); x.scale(1, .3);
  const gr = x.createRadialGradient(0, 0, s * .04, 0, 0, s / 2);
  gr.addColorStop(0, `rgba(${rgb},.75)`); gr.addColorStop(.5, `rgba(${rgb},.26)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = gr; x.fillRect(-s / 2, -s / 2, s, s); return c;
}
function buildField() {
  const R = mulberry32(PAGE.seed * 7919 + 13);
  const { w, h } = FIELD;
  if (PAGE.key === 'ta') {
    const n = Math.max(14, Math.min(30, Math.round(w * h / 48000)));
    FIELD.nodes = Array.from({ length: n }, () => ({
      x: R(), y: R(), vx: (R() < .5 ? -1 : 1) * (.006 + R() * .012), vy: (R() < .5 ? -1 : 1) * (.006 + R() * .012),
      r: 1 + R() * 1.4, hub: R() < .24 }));
  } else if (PAGE.key === 'program') {
    const n = Math.max(12, Math.round(w / 64));
    FIELD.cols = Array.from({ length: n }, () => {
      const kw = R() < .18;
      const str = kw ? KWS[Math.floor(R() * KWS.length)] : null;
      const len = str ? str.length : 5 + Math.floor(R() * 8);
      return { x: R() * .94 + .03, y: R() * (h + 140) - 70, sp: 12 + R() * 26, rowH: 13 + R() * 3,
        kw, gs: str ? str.split('') : Array.from({ length: len }, () => RAIN_CHARS[Math.floor(R() * RAIN_CHARS.length)]) };
    });
  } else {
    const sprites = PAGE.key === 'ai' ? AI_SPRITES : ART_SPRITES;
    const n = PAGE.key === 'ai' ? 5 : 6;
    FIELD.blobs = Array.from({ length: n }, (_, i) => ({
      sp: sprites[i % sprites.length],
      x: .08 + R() * .84, y: .05 + R() * .7,
      ax: 16 + R() * 34, ay: 12 + R() * 26,
      s1: .1 + R() * .22, s2: .1 + R() * .22,
      p1: R() * 6.28, p2: R() * 6.28,
      sc: .55 + R() * .85, al: .24 + R() * .2,
      rot: PAGE.key === 'art' ? R() * 6.28 : undefined,
      rs: (R() - .5) * .05 }));
  }
}
function rebuild() {
  const w = innerWidth, h = innerHeight;
  if (fw && Math.abs(w - fw) < 2 && Math.abs(h - fh) < 2) return false;
  fw = w; fh = h;
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  FIELD = { w, h };
  buildField();
  return true;
}
function drawNodes(tS, dt, e) {
  const { w, h, nodes } = FIELD, sp = 1 + 2 * e;
  for (const n of nodes) {
    n.x += n.vx * sp * dt; n.y += n.vy * sp * dt;
    if (n.x < -.03) n.x = 1.03; if (n.x > 1.03) n.x = -.03;
    if (n.y < -.03) n.y = 1.03; if (n.y > 1.03) n.y = -.03;
  }
  const L = Math.min(w, h) * .3;
  g.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i], b = nodes[j];
    const d = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
    if (d < L) {
      g.strokeStyle = `rgba(94,234,212,${((1 - d / L) * .16 * (.55 + .6 * e)).toFixed(3)})`;
      g.beginPath(); g.moveTo(a.x * w, a.y * h); g.lineTo(b.x * w, b.y * h); g.stroke();
    }
  }
  for (const n of nodes) {
    g.fillStyle = `rgba(94,234,212,${((n.hub ? .5 : .3) + .18 * e).toFixed(3)})`;
    g.beginPath(); g.arc(n.x * w, n.y * h, n.r * (1 + .3 * e), 0, 7); g.fill();
  }
}
function drawRain(dt, e) {
  const { w, h, cols } = FIELD, sp = 1 + 1.8 * e;
  g.font = '11.5px ui-monospace,Consolas,monospace';
  g.textAlign = 'center';
  for (const c of cols) {
    c.y += c.sp * sp * dt;
    if (c.y - 6 > h + 40) { c.y = -20 - Math.random() * 160; }
    const n = c.gs.length;
    for (let i = 0; i < n; i++) {
      const ch = c.gs[i]; if (ch === ' ') continue;
      const gy = c.y - i * c.rowH; if (gy < -12 || gy > h + 12) continue;
      const fall = 1 - i / n;
      const a = (c.kw ? .34 : .2) * (.45 + .7 * e) * (.35 + .65 * fall);
      g.fillStyle = c.kw ? `rgba(255,180,84,${a.toFixed(3)})` : `rgba(214,201,182,${a.toFixed(3)})`;
      g.fillText(ch, c.x * w, gy);
    }
  }
}
function drawBlobs(tS, e) {
  const { w, h, blobs } = FIELD, base = Math.min(w, h);
  g.globalCompositeOperation = 'lighter';
  for (const b of blobs) {
    const x = b.x * w + Math.sin(tS * b.s1 + b.p1) * b.ax;
    const y = b.y * h + Math.sin(tS * b.s2 + b.p2) * b.ay;
    const s = base * b.sc * 1.5;
    g.globalAlpha = Math.min(1, b.al * (.5 + .6 * e));
    if (b.rot !== undefined) { g.save(); g.translate(x, y); g.rotate(b.rot + tS * b.rs); g.drawImage(b.sp, -s / 2, -s / 2, s, s); g.restore(); }
    else g.drawImage(b.sp, x - s / 2, y - s / 2, s, s);
  }
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
}
function drawAll(t, dt) {
  if (!FIELD) return;
  const e = (SHOT || REDUCE) ? .6 : .3 + .1 * Math.sin(t * .0004);
  g.clearRect(0, 0, FIELD.w, FIELD.h);
  if (PAGE.key === 'ta') drawNodes(t / 1000, dt, e);
  else if (PAGE.key === 'program') drawRain(dt, e);
  else drawBlobs(t / 1000, e);
}
function startFelt() {
  if (SHOT) {
    fw = SW; fh = SH;
    cv.width = Math.round(SW * DPR); cv.height = Math.round(SH * DPR);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    FIELD = { w: SW, h: SH };
    buildField();
    drawAll(2600, 0);
  } else if (REDUCE) {
    rebuild();
    if (FIELD) drawAll(2600, 0);
    addEventListener('resize', () => { fw = 0; rebuild(); if (FIELD) drawAll(2600, 0); });
  } else {
    let last = performance.now();
    requestAnimationFrame(function frame(t) {
      const dt = Math.min((t - last) / 1000, .05); last = t;
      rebuild();
      drawAll(t, dt);
      requestAnimationFrame(frame);
    });
    addEventListener('resize', rebuild);
  }
}

/* ===== 启动 ===== */
document.addEventListener('DOMContentLoaded', async () => {
  i18n.init();
  window.addEventListener('langchange', render);
  await render();
  startFelt();
});
