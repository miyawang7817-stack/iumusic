// 虚拟时钟逐帧捕获：接管页面全部计时（performance.now/rAF/setTimeout/CSS 动画），
// 每帧精确推进 1/30s 并截图 —— 输出数学上完美平滑的 30fps，与沙盒渲染性能无关。
// 用法: node demo/capture.mjs <W> <H> <outdir> <url>
import { chromium } from 'playwright';
import fs from 'fs';

const [W, H, OUT] = [parseInt(process.argv[2]), parseInt(process.argv[3]), process.argv[4]];
const URL = process.argv[5] || 'https://miyawang7817-stack.github.io/iumusic/';
const DRY = false;
const FPS = 30, TOTAL_S = 52, TOTAL = Math.round(TOTAL_S * FPS);
fs.mkdirSync(OUT, { recursive: true });

const HARNESS = `(() => {
  if (window.__vtInstalled) return; window.__vtInstalled = true;
  let vt = 0;
  const D0 = Date.now();
  performance.now = () => vt;
  Date.now = () => D0 + Math.round(vt);
  const rafQ = new Map(); let rid = 0;
  window.requestAnimationFrame = (cb) => { rafQ.set(++rid, cb); return rid; };
  window.cancelAnimationFrame = (id) => { rafQ.delete(id); };
  const timers = new Map(); let tid = 0;
  window.setTimeout = (cb, d = 0, ...a) => { if (typeof cb !== 'function') return 0; timers.set(++tid, { at: vt + (+d || 0), cb, a }); return tid; };
  window.clearTimeout = (id) => { timers.delete(id); };
  window.setInterval = (cb, d = 0, ...a) => { const iv = Math.max(1, +d || 1); timers.set(++tid, { at: vt + iv, cb, a, iv }); return tid; };
  window.clearInterval = window.clearTimeout;
  function runTimers() {
    for (let g = 0; g < 10000; g++) {
      let bid = null, bt = null;
      for (const [id, t] of timers) if (t.at <= vt && (bt === null || t.at < bt.at)) { bid = id; bt = t; }
      if (bid === null) return;
      if (bt.iv) bt.at = vt + bt.iv; else timers.delete(bid);
      try { bt.cb(...bt.a); } catch (e) { console.error('timer', e); }
    }
  }
  const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  function handAt(ts) {
    const D = window.__dir;
    if (!D || ts < D.handOn || ts >= D.handOff) return null;
    let x = D.hand[0].x0, y = D.hand[0].y0;
    for (const s of D.hand) {
      if (ts >= s.t1) { x = s.x1; y = s.y1; }
      else if (ts >= s.t0) { const u = ease((ts - s.t0) / (s.t1 - s.t0)); return { x: s.x0 + (s.x1 - s.x0) * u, y: s.y0 + (s.y1 - s.y0) * u }; }
      else break;
    }
    return { x, y };
  }
  window.__tick = (ms) => {
    vt += ms;
    runTimers();
    const D = window.__dir, ts = vt / 1000;
    if (D) {
      const hp = handAt(ts);
      const pin = D.pinch && D.pinch.some((g) => ts >= g.t0 && ts < g.t1);
      if (hp && window.__feedHand) window.__feedHand(hp.x * innerWidth, hp.y * innerHeight, pin ? 0.2 : 1.2);
      for (const a of D.actions) if (!a.done && ts >= a.t) { a.done = true; try { (0, eval)(a.js); } catch (e) { console.error('action', e); } }
      let cap = document.getElementById('vt-cap');
      if (!cap) {
        cap = document.createElement('div'); cap.id = 'vt-cap';
        cap.style.cssText = 'position:fixed;top:11.5%;left:50%;transform:translateX(-50%);z-index:40;font-size:max(13px,1.05vmax);letter-spacing:.32em;color:rgba(255,251,235,.88);text-shadow:0 2px 18px rgba(0,0,0,.75);opacity:0;transition:opacity .55s ease;pointer-events:none;white-space:nowrap;';
        document.body.appendChild(cap);
      }
      const c = D.captions.find((c) => ts >= c.t0 && ts < c.t1);
      if (c) { if (cap.textContent !== c.text) cap.textContent = c.text; cap.style.opacity = '1'; }
      else cap.style.opacity = '0';
      // 逐帧强制“正在播放”曲目：np 条 + 曲目高亮始终与 muxed 配乐一致，
      // 不受线上 iTunes 快慢/失败影响（保证“点哪首唱哪首”音画同步）
      if (D.nowPlaying) {
        const cur = D.nowPlaying.find((x) => ts >= x.t0 && ts < x.t1);
        const bar = document.getElementById('now-playing');
        const title = document.getElementById('np-title');
        if (cur && bar && title) {
          bar.hidden = false;
          const tog = document.getElementById('np-toggle'); if (tog) tog.style.display = '';
          if (title.textContent !== cur.name) title.textContent = cur.name;
          for (const li of document.querySelectorAll('.av-tracks li')) li.classList.toggle('playing', li.textContent.trim() === cur.name);
        }
      }
      // 相机运镜：在无限卡片隧道里【猛冲往里 → 急退往外】。大幅前冲让卡片呼啸掠过，
      // 随即后退让卡片急速退远 —— 场自身缓动(0.12/帧)把每次跳变化成有惯性的“嗖”。
      // 关键帧 [u(秒), 纵深(屏高倍，增=前冲/减=后退), 横移(屏宽倍)]，smoothstep 插值
      const cam = D.camera;
      if (cam && window.__FIELD && document.body.classList.contains('field-on') && ts >= cam.t0 && ts <= cam.t1) {
        const F = window.__FIELD;
        if (!cam._init) { cam._init = true; cam.s0 = F.scrollY.target; cam.x0 = F.drag.xTarget; cam.h = F.sizes.height; cam.w = F.sizes.width; }
        const u = ts - cam.t0, K = cam.keys;
        let i = 0; while (i < K.length - 1 && u > K[i + 1][0]) i++;
        const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
        const span = Math.max(1e-3, b[0] - a[0]);
        let p = Math.min(1, Math.max(0, (u - a[0]) / span)); p = p * p * (3 - 2 * p);
        F.scrollY.target = cam.s0 + (a[1] + (b[1] - a[1]) * p) * cam.h;
        F.drag.xTarget = cam.x0 + (a[2] + (b[2] - a[2]) * p) * cam.w;
      }
    }
    const q = [...rafQ.values()]; rafQ.clear();
    for (const cb of q) { try { cb(vt); } catch (e) { console.error('raf', e); } }
    for (const a of document.getAnimations()) {
      try {
        const end = a.effect.getComputedTiming().endTime;
        const ct = (typeof a.currentTime === 'number' ? a.currentTime : 0) + ms;
        if (typeof end === 'number' && isFinite(end) && ct >= end) { a.playbackRate = 1; a.finish(); }
        else a.currentTime = ct;
      } catch (e) {}
    }
    return vt;
  };
})();`;

// ---------- 分镜（虚拟时间轴，秒） ----------
const T_CELEB = 18.5;   // 点 Celebrity 的时刻（配乐第一首在此进）
const T_LILAC = 33.0;   // 点 라일락 LILAC 的时刻（配乐切第二首）
const hand = [];
let hx = 0.68, hy = 0.75;
const moveTo = (t0, x, y, dur) => { hand.push({ t0, t1: t0 + dur, x0: hx, y0: hy, x1: x, y1: y }); hx = x; hy = y; };

// 8–15s：三次右挥翻到 LILAC
for (let i = 0; i < 3; i++) {
  const t = 8.5 + i * 2.2;
  moveTo(t, 0.94, 0.72, 0.26);
  moveTo(t + 0.62, 0.68, 0.75, 0.85);
}
// 15.5 捏合 → 进入 LILAC 专辑。进专辑后手离场（handOff=16.2），改由相机运镜
// 直接驱动特效场穿行，点歌用列表点击 —— 让漂浮卡片特效当主角、音画同步

const clickTrack = (name) =>
  `for (const li of document.querySelectorAll('.av-tracks li')) { if (li.textContent.trim() === ${JSON.stringify(name)}) { li.click(); break; } }`;

const director = {
  handOn: 8.2,
  handOff: 16.2,                       // 进专辑后手离场，镜头交给相机运镜
  hand,
  pinch: [ { t0: 15.5, t1: 15.95 } ],
  camera: {                            // 特效场：无限隧道里猛冲往里 / 急退往外
    t0: 16.6, t1: 46.5,                // keys: [u(秒), 纵深(屏高倍，增=前冲/减=后退), 横移]
    keys: [
      [0.0, 0.0, 0.0],
      [2.8, 5.5, -0.30],   // 猛冲往里（卡片呼啸掠过）
      [5.5, 1.0, 0.40],    // 急退往外（卡片退远）
      [9.0, 7.8, -0.20],   // 深冲
      [12.0, 2.6, 0.45],   // 后退
      [16.0, 10.5, -0.10], // 巨冲（LILAC 切歌前后）
      [19.5, 4.6, -0.42],  // 急退
      [23.5, 13.0, 0.30],  // 终极冲刺
      [27.0, 8.0, 0.30],   // 缓冲
      [29.9, 10.0, 0.0],   // 收势
    ],
  },
  captions: [],
  nowPlaying: [
    { t0: T_CELEB + 0.15, t1: T_LILAC, name: 'Celebrity' },
    { t0: T_LILAC + 0.15, t1: 46.8, name: '라일락 LILAC' },
  ],
  actions: [
    { t: 8.2, js: `window.__testCtrlOnly(); document.getElementById('btn-gesture').classList.add('on');` },
    { t: T_CELEB, js: clickTrack('Celebrity') },
    { t: T_LILAC, js: clickTrack('라일락 LILAC') },
    { t: 46.8, js: `document.getElementById('btn-ring-back').click();` },
    { t: 49.2, js: `
      const o = document.createElement('div'); o.id = 'vt-end';
      o.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2vmax;background:rgba(19,19,19,0);transition:background 1.2s ease;pointer-events:none;';
      o.innerHTML = '<div style="font-size:max(30px,3.4vmax);letter-spacing:.18em;color:rgba(255,251,235,.95);opacity:0;transition:opacity 1.2s ease .3s;">IU · MAGAZINE</div>'
        + '<div style="font-size:max(11px,.9vmax);letter-spacing:.3em;color:rgba(255,251,235,.62);opacity:0;transition:opacity 1.2s ease .7s;">15 ALBUMS · 2008 — 2025</div>';
      document.body.appendChild(o);
      requestAnimationFrame(() => { o.style.background = 'rgba(19,19,19,.8)'; for (const d of o.children) d.style.opacity = '1'; });
    ` },
  ],
};

// ---------- 捕获 ----------
const LAUNCH_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-renderer-backgrounding'];
let b;
try { b = await chromium.launch({ channel: 'chrome', args: LAUNCH_ARGS }); }       // 系统 Chrome：带 AAC 解码，可播 iTunes 试听
catch { b = await chromium.launch({ args: LAUNCH_ARGS }); }
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message));
const cdp = await ctx.newCDPSession(p);
await cdp.send('Animation.enable');
try { await cdp.send('Animation.setPlaybackRate', { playbackRate: 0 }); }
catch { await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.0001 }); }
await p.addInitScript(HARNESS);
await p.goto(URL, { waitUntil: 'load' });
await new Promise((r) => setTimeout(r, 8000));    // 真实时间等资源（封面图走公网）加载
await p.evaluate((d) => { window.__dir = d; }, director);

const t0 = Date.now();
const marks = {};
for (let f = 0; f < TOTAL; f++) {
  await p.evaluate(() => window.__tick(1000 / 30));
  await p.screenshot({ path: `${OUT}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  if (f === Math.round(17.5 * FPS)) marks.albumOpened = await p.evaluate(() => ({ field: document.body.classList.contains('field-on'), title: document.querySelector('.av-title')?.textContent }));
  if (f === Math.round(28.0 * FPS)) marks.npCelebrity = await p.evaluate(() => document.getElementById('np-title').textContent);
  if (f === Math.round(42.0 * FPS)) marks.npLilac = await p.evaluate(() => document.getElementById('np-title').textContent);
  if (f === Math.round(48.5 * FPS)) marks.backToRing = await p.evaluate(() => document.body.classList.contains('ring-on'));
  if (DRY && f % 150 === 0) console.error(`f${f} ${(Date.now() - t0) / 1000 | 0}s`);
}
console.log(JSON.stringify({ frames: TOTAL, realSec: (Date.now() - t0) / 1000 | 0, marks, errors: errs.slice(0, 5) }));
await b.close();
