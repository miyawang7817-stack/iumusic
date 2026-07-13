/* IU 音乐签 —— 页面流程：选择抽法 → 洗牌抽歌 → 翻牌听解 */
(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  const views = {
    home: $('#view-home'),
    draw: $('#view-draw'),
    reading: $('#view-reading'),
  };

  const state = {
    spread: null,      // 当前歌单阵模板
    deck: [],          // 洗好的歌曲卡
    picked: [],        // 已抽出的卡，按位置顺序
    flippedCount: 0,
  };

  /* ---------- 工具 ---------- */

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function coverSrc(card) {
    return 'assets/covers/' + ALBUMS[card.album].cover;
  }

  function freshShuffledDeck() {
    return shuffle(DECK).map((card) => ({ card }));
  }

  function showView(name) {
    Object.entries(views).forEach(([key, el]) =>
      el.classList.toggle('hidden', key !== name)
    );
    document.body.classList.toggle('on-home', name === 'home');
    $('#brand-btn').hidden = name !== 'home';
    $('#btn-back').hidden = name === 'home';
    if (window.__heroVideoCtl) {
      if (name === 'home') window.__heroVideoCtl.enter();
      else window.__heroVideoCtl.leave();
    }
    window.scrollTo({ top: 0 });
  }

  /* ---------- 首页：抽法选择 ---------- */

  const HOME_ICONS = {
    note: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    cards: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="7.5" y="3.5" width="9" height="14" rx="1.5" transform="rotate(-8 12 10.5)"/><rect x="9" y="6.5" width="9" height="14" rx="1.5" transform="rotate(8 13.5 13.5)"/></svg>',
    heart: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.6-9.2-8.6C1.2 8.6 3 5.5 6.2 5.5c2 0 3.3 1 4 2.2.3.5.9.5 1.2 0 .7-1.2 2-2.2 4-2.2 3.2 0 5 3.1 3.4 5.9C19 15.4 12 20 12 20z"/></svg>',
  };
  // 三张倒扣的牌入口（顺序对应 SPREADS）
  const HOME_ENTRIES = [
    { icon: 'note',  title: '今日一曲',   desc: '一首歌，配今天的心情', meta: '✦︎ 1 首 · 今日主打' },
    { icon: 'cards', title: '心情三部曲', desc: '回忆 · 此刻 · 期待',   meta: '✦︎ 3 首 · 一条心情线' },
    { icon: 'heart', title: '治愈歌单',   desc: '五首歌，把今天听完',   meta: '✦︎ 5 首 · 开场到安可' },
  ];

  function renderSpreadGrid() {
    const grid = $('#spread-grid');
    grid.innerHTML = '';
    HOME_ENTRIES.forEach((entry, i) => {
      const spread = SPREADS[i];
      const btn = document.createElement('button');
      btn.className = 'entry-card';
      btn.innerHTML = `
        <span class="entry-frame"></span>
        <span class="entry-corner tl">✦︎</span>
        <span class="entry-corner tr">✦︎</span>
        <span class="entry-corner bl">✦︎</span>
        <span class="entry-corner br">✦︎</span>
        <span class="entry-icon">${HOME_ICONS[entry.icon]}</span>
        <span class="entry-body">
          <span class="entry-title">${entry.title}</span>
          <span class="entry-desc" style="display:block">${entry.desc}</span>
          <span class="entry-meta" style="display:block">${entry.meta}</span>
        </span>
      `;
      btn.addEventListener('click', () => startDraw(spread));
      grid.appendChild(btn);
    });
  }

  /* 首页星尘 */
  function renderHomeSky() {
    const sky = $('#home-sky');
    if (!sky || sky.querySelector('.tw')) return;
    const rand = (a, b) => a + Math.random() * (b - a);
    for (let i = 0; i < 46; i++) {
      const s = document.createElement('span');
      s.className = 'tw';
      const size = rand(1.2, 2.8).toFixed(1);
      s.style.left = rand(2, 98).toFixed(1) + '%';
      s.style.top = rand(2, 94).toFixed(1) + '%';
      s.style.width = size + 'px';
      s.style.height = size + 'px';
      s.style.setProperty('--d', rand(2.5, 6).toFixed(1) + 's');
      s.style.setProperty('--dl', rand(0, 5).toFixed(1) + 's');
      sky.appendChild(s);
    }
  }

  /* 首页背景视频：原生 loop 循环，加载成功即淡入；失败保持纯黑星空 */
  function setupHeroVideo() {
    const video = $('#hero-video');
    if (!video) return;
    const onHome = () => !views.home.classList.contains('hidden');
    video.muted = true;
    video.addEventListener('loadeddata', () => {
      views.home.classList.add('video-on');
      if (onHome()) video.play().catch(() => {});
    });
    video.addEventListener('error', () => {
      views.home.classList.remove('video-on');   // 加载失败：保持纯黑星空
    });
    setInterval(() => {
      if (document.hidden || !onHome()) return;
      if (video.readyState >= 2 && video.paused) video.play().catch(() => {});
    }, 3000);
    window.__heroVideoCtl = {
      enter() { if (video.readyState >= 2) video.play().catch(() => {}); },
      leave() { video.pause(); },
    };
  }

  /* ---------- 抽牌页：命运轮盘（连续插值引擎） ----------
     rot 为连续旋转量（单位：张）。每张牌按相对位置 rel = i - rot 在
     「中间大 → 两侧虚化 → 纵深隐没」的轨道上连续插值；
     拖动跟手、惯性滑行渐停、空闲匀速漂移，逐帧只写 transform/opacity */

  const VISIBLE_REL = 3;                 // 相对位置超出 ±3 即隐藏
  const AUTO_STEP_MS = 950;              // 自动轮换：滑到下一张的时长（缓入缓出）
  const AUTO_DWELL = 2400;               // 自动轮换：每张卡在中间的停留时间
  const IDLE_DELAY = 2000;               // 交互后多久恢复漂移
  const FRICTION = 300;                  // 惯性摩擦时间常数（毫秒）
  const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const car = {
    rot: 0,            // 连续旋转量
    vel: 0,            // 惯性速度（张/毫秒）
    inertia: false,    // 惯性滑行中
    dragging: false,
    snapping: false,   // 吸附动画中
    locked: false,     // 抽牌动画期间锁定
    lastTouch: 0,
    dirty: false,
    loop: null,
    anim: null,
    cards: [],         // { entry, el, hidden }
    ghost: null,       // { idx, w, delay } 抽牌后的收拢槽位
    geom: null,
  };

  function startDraw(spread) {
    state.spread = spread;
    state.picked = [];
    state.deck = freshShuffledDeck();
    car.rot = 0;
    car.vel = 0;
    car.inertia = false;
    car.locked = false;
    car.snapping = false;
    car.lastTouch = performance.now() - IDLE_DELAY + 250;   // 进场即启动轮播（与发牌淡入重叠）
    car.lastAuto = 0;
    $('#draw-title').textContent = spread.nameZh;
    showView('draw');          // 先显示视图，保证测量到真实尺寸
    buildCarousel(true);
    renderTray();
    updateDrawProgress();
    startCarLoop();
  }

  function measureGeom() {
    const area = $('#ring-area');
    const W = area.clientWidth;
    const mobile = window.innerWidth < 720;
    car.geom = {
      // 五卡构图：|rel|=1 远处小卡，|rel|=2 近处门板侧立卡
      x1: W * (mobile ? 0.31 : 0.21),
      x2: W * (mobile ? 0.44 : 0.315),
      x3: W * (mobile ? 0.48 : 0.355),
      s1: 0.48,                               // 侧卡（稍小于主牌）
      s2: 0.62,                               // 门板卡（近乎侧立）
      pxPerStep: W * (mobile ? 0.31 : 0.21),  // 拖动一张牌对应的像素
    };
  }

  function buildCarousel(deal) {
    const stage = $('#ring-stage');
    stage.innerHTML = '';
    measureGeom();
    car.cards = state.deck.map((entry, i) => {
      const el = document.createElement('button');
      el.className = 'car-card' + (deal ? ' dealing' : '');
      el.dataset.idx = i;
      el.setAttribute('aria-label', '轮盘中的歌');
      el.innerHTML =
        '<span class="card-back"></span>' +
        '<span class="card-back card-blur"></span>' +
        '<span class="card-dim"></span>' +
        '<span class="card-glow"></span>' +
        '<span class="card-shine"></span>';
      if (deal) el.style.animationDelay = (i % 5) * 90 + 'ms';
      stage.appendChild(el);
      return { entry, el, hidden: undefined };
    });
    if (deal) setTimeout(() => car.cards.forEach((c) => c.el.classList.remove('dealing')), 1300);
    layoutCarousel();
    car.ambH = null;
    updateAmbient();
  }

  /* 关键帧插值：a = [中间, 侧位, 纵深, 隐没] 四个锚点，r = |rel| */
  function kp(a, r) {
    const i = Math.min(2, Math.floor(r));
    const t = Math.min(1, r - i);
    return a[i] + (a[i + 1] - a[i]) * t;
  }

  function layoutCarousel() {
    const n = car.cards.length;
    if (!n) return;
    const g = car.geom;
    const ghost = car.ghost;
    car.cards.forEach((c, i) => {
      if (ghost && i === ghost.idx) return;   // 升起中的牌不参与排布
      let eff = i;
      if (ghost) {
        // 幽灵槽位：被抽走的位置宽度从 1 收缩到 0，后面的牌被连续挤入
        const di = (((i - ghost.idx) % n) + n) % n;
        if (di > 0 && di < n / 2) eff = i - (1 - ghost.w);
      }
      let rel = (((eff - car.rot) % n) + n) % n;
      if (rel > n / 2) rel -= n;
      const el = c.el;
      const r = Math.abs(rel);
      if (r > VISIBLE_REL) {
        if (c.hidden !== true) {
          c.hidden = true;
          el.style.visibility = 'hidden';
          el.style.pointerEvents = 'none';
        }
        return;
      }
      if (c.hidden !== false) {
        c.hidden = false;
        el.style.visibility = 'visible';
        el.style.pointerEvents = 'auto';
      }
      const sign = rel < 0 ? -1 : 1;
      const x = sign * kp([0, g.x1, g.x2, g.x3], r);
      const s = kp([1, g.s1, g.s2, g.s2], r);
      const ry = sign * kp([0, 16, 80, 86], r);   // 远处小卡微侧，门板卡近乎 90° 侧立
      const fade = Math.max(0, Math.min(1, (3.0 - r) / 0.5));
      el.style.transform =
        `translate(calc(-50% + ${x.toFixed(1)}px), -50%) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      el.style.opacity = (kp([1, 0.95, 0.95, 0.95], r) * fade).toFixed(3);
      el.style.zIndex = String(100 - Math.round(r * 10));
      el.style.setProperty('--blur-o', kp([0, 0.18, 0.32, 0.6], r).toFixed(3));
      el.style.setProperty('--dim', kp([0, 0.24, 0.4, 0.58], r).toFixed(3));
      el.style.setProperty('--glow', Math.max(0, 1 - r * 1.8).toFixed(3));
      el.style.setProperty('--shine-o', Math.max(0, 1 - r * 1.3).toFixed(3));
      el.style.setProperty('--shine-t', (40 - rel * 180).toFixed(1) + '%');
    });
  }

  /* 氛围光晕：颜色随中心牌所属专辑的主色走 */
  function updateAmbient() {
    const n = car.cards.length;
    if (!n) return;
    const ci = ((Math.round(car.rot) % n) + n) % n;
    const entry = car.cards[ci] && car.cards[ci].entry;
    if (!entry) return;
    const h = ALBUMS[entry.card.album].hue;
    if (car.ambH === h) return;
    car.ambH = h;
    const blobs = document.querySelectorAll('#ring-area .amb i');
    if (!blobs.length) return;
    const cfg = [
      [h, 0.46], [(h + 22) % 360, 0.38], [(h + 338) % 360, 0.36],
      [(h + 34) % 360, 0.32], [h, 0.34],
    ];
    blobs.forEach((b, i) => {
      const [hh, al] = cfg[i % cfg.length];
      b.style.backgroundColor = `hsl(${hh} 58% 51% / ${al})`;
    });
  }

  /* 平滑吸附 / 转到目标位置
     opts.auto: 自动轮换的步进（不刷新交互时间戳，缓入缓出更从容） */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function animateRotTo(target, duration = 480, done, opts = {}) {
    cancelAnimationFrame(car.anim);
    car.inertia = false;
    const from = car.rot;
    const delta = target - from;
    if (Math.abs(delta) < 0.001) { car.rot = target; car.snapping = false; car.dirty = true; done && done(); return; }
    car.snapping = true;
    const t0 = performance.now();
    const ease = opts.auto ? easeInOutCubic : easeOutCubic;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      car.rot = from + delta * ease(t);
      car.dirty = true;
      if (t < 1) car.anim = requestAnimationFrame(tick);
      else {
        car.snapping = false;
        if (!opts.auto) car.lastTouch = performance.now();
        done && done();
      }
    };
    car.anim = requestAnimationFrame(tick);
  }

  /* 主循环：惯性滑行 → 吸附；空闲时「走一步、停一拍」自动轮换 */
  function startCarLoop() {
    if (car.loop) return;
    let last = 0;
    const frame = (now) => {
      if (views.draw.classList.contains('hidden')) { car.loop = null; return; }
      const dt = last ? Math.min(50, now - last) : 0;
      last = now;

      if (car.inertia && dt) {           // 惯性滑行，摩擦渐停
        car.rot += car.vel * dt;
        car.vel *= Math.exp(-dt / FRICTION);
        car.dirty = true;
        if (Math.abs(car.vel) < 0.0004) {
          car.inertia = false;
          animateRotTo(Math.round(car.rot), 360);
        }
      } else {
        // 每张卡在中间停留 AUTO_DWELL，然后用缓入缓出滑到下一张
        const idle = !car.dragging && !car.snapping && !car.locked && !car.inertia
          && now - car.lastTouch > IDLE_DELAY
          && now - (car.lastAuto || 0) > AUTO_DWELL
          && !REDUCED_MOTION;
        if (idle) {
          car.lastAuto = now;
          animateRotTo(Math.round(car.rot) + 1, AUTO_STEP_MS, null, { auto: true });
        }
      }
      if (car.ghost && dt) {              // 幽灵槽位收拢
        const gh = car.ghost;
        if (gh.delay > 0) gh.delay -= dt;
        else if (gh.w > 0) {
          gh.w = Math.max(0, gh.w - dt / 380);
          car.dirty = true;
          if (gh.w === 0) finalizeGhost();
        }
      }
      if (car.dirty) {
        car.dirty = false;
        layoutCarousel();
        updateAmbient();
      }
      car.loop = requestAnimationFrame(frame);
    };
    car.loop = requestAnimationFrame(frame);
  }

  /* 拖动跟手 + 惯性 + 轻点选卡 */
  function setupCarouselInput() {
    const area = $('#ring-area');
    let sx = 0, lastX = 0, lastT = 0, startRot = 0, moved = 0;

    area.addEventListener('pointerdown', (e) => {
      if (car.locked) return;
      car.dragging = true;
      car.inertia = false;
      cancelAnimationFrame(car.anim);
      car.snapping = false;
      moved = 0;
      sx = lastX = e.clientX;
      lastT = performance.now();
      startRot = car.rot;
      car.vel = 0;
      car.lastTouch = lastT;
      area.classList.add('grabbing');
      area.setPointerCapture(e.pointerId);
    });

    area.addEventListener('pointermove', (e) => {
      if (!car.dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      car.vel = -(dx / car.geom.pxPerStep) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      moved = Math.max(moved, Math.abs(e.clientX - sx));
      car.rot = startRot - (e.clientX - sx) / car.geom.pxPerStep;
      car.lastTouch = now;
      car.dirty = true;
    });

    const finish = (e) => {
      if (!car.dragging) return;
      car.dragging = false;
      car.lastTouch = performance.now();
      area.classList.remove('grabbing');

      if (moved < 8) {                   // 轻点：中间抽牌，两侧转过去
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const t = hit && hit.closest('.car-card');
        if (!t) { animateRotTo(Math.round(car.rot), 360); return; }
        const i = Number(t.dataset.idx);
        const n = car.cards.length;
        let rel = (((i - car.rot) % n) + n) % n;
        if (rel > n / 2) rel -= n;
        if (Math.abs(rel) < 0.5) drawCarCard(t);
        else animateRotTo(car.rot + rel, 520);
        return;
      }
      // 惯性滑行；速度太小就直接吸附
      if (Math.abs(car.vel) > 0.0006) {
        car.vel = Math.max(-0.02, Math.min(0.02, car.vel));
        car.inertia = true;
      } else {
        animateRotTo(Math.round(car.rot), 360);
      }
    };
    area.addEventListener('pointerup', finish);
    area.addEventListener('pointercancel', () => {
      car.dragging = false;
      area.classList.remove('grabbing');
      animateRotTo(Math.round(car.rot), 360);
    });

    // 键盘可达性
    area.tabIndex = 0;
    area.addEventListener('keydown', (e) => {
      if (car.locked) return;
      car.lastTouch = performance.now();
      if (e.key === 'ArrowLeft') { e.preventDefault(); animateRotTo(Math.round(car.rot) - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); animateRotTo(Math.round(car.rot) + 1); }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const n = car.cards.length;
        const c = car.cards[((Math.round(car.rot) % n) + n) % n];
        if (c) drawCarCard(c.el);
      }
    });

    window.addEventListener('resize', () => {
      if (!views.draw.classList.contains('hidden')) {
        measureGeom();
        car.dirty = true;
      }
    });
  }

  function drawCarCard(el) {
    if (car.locked || state.picked.length >= state.spread.positions.length) return;
    car.locked = true;
    cancelAnimationFrame(car.anim);
    car.snapping = false;
    car.inertia = false;
    const idx = Number(el.dataset.idx);
    const cardObj = car.cards[idx];

    el.classList.add('rise');            // 主牌升起，带金尘尾迹
    spawnBurst(el, 'drift', 12);
    state.picked.push(cardObj.entry);
    state.deck.splice(idx, 1);
    renderTray();
    updateDrawProgress();

    const finished = state.picked.length === state.spread.positions.length;

    if (!finished) {
      animateRotTo(idx, 160);            // 先对正（漂移中可能有小数偏移）
      car.ghost = { idx, w: 1, delay: 240 };
    }

    setTimeout(() => {
      el.remove();
      if (finished) { startReading(); return; }
      car.locked = false;
      car.lastTouch = performance.now() - IDLE_DELAY + 900;
    }, 780);
  }

  /* 幽灵槽位收拢完毕：真正移除该牌并归一化 rot */
  function finalizeGhost() {
    const gh = car.ghost;
    if (!gh) return;
    car.ghost = null;
    car.cards.splice(gh.idx, 1);
    car.cards.forEach((c, i) => { c.el.dataset.idx = i; });
    const n = car.cards.length;
    car.rot = n ? ((gh.idx % n) + n) % n : 0;
    car.dirty = true;
  }

  function renderTray() {
    const tray = $('#drawn-tray');
    tray.innerHTML = '';
    state.spread.positions.forEach((pos, i) => {
      const filled = i < state.picked.length;
      const slot = document.createElement('div');
      slot.className = 'tray-slot' + (filled ? ' filled' : '');
      slot.innerHTML = `
        <div class="tray-card">${filled ? '<span class="card-back"></span>' : ''}</div>
        <div class="tray-label">${pos.name}</div>
      `;
      tray.appendChild(slot);
    });
  }

  function updateDrawProgress() {
    const total = state.spread.positions.length;
    const n = state.picked.length;
    const next = state.spread.positions[n];
    $('#draw-progress').innerHTML = next
      ? `已抽 <b>${n}</b> / ${total} ✦ 滑动换牌 · 点击中间的牌抽歌`
      : `已抽 <b>${n}</b> / ${total}，今天的歌已经就位……`;
    const pos = $('#draw-pos');
    const txt = next ? next.name : '静候旋律';
    if (pos.textContent !== txt) {
      pos.textContent = txt;
      pos.style.animation = 'none';
      void pos.offsetWidth;               // 重新触发入场动画
      pos.style.animation = '';
    }
  }

  /* ---------- 揭晓页 ---------- */

  function startReading() {
    state.flippedCount = 0;
    $('#reading-title').textContent = state.spread.nameZh;
    $('#btn-flip-all').disabled = false;
    $('#reading-actions').classList.remove('gone', 'done-hide');
    $('#interpretations').innerHTML = '';
    renderBoard();
    showView('reading');
  }

  function renderBoard() {
    const board = $('#board');
    board.className = 'board';
    board.innerHTML = '';

    state.spread.positions.forEach((pos, i) => {
      const entry = state.picked[i];
      const card = entry.card;
      const album = ALBUMS[card.album];
      const slot = document.createElement('div');
      slot.className = `slot slot-${i + 1} materialize`;
      slot.style.setProperty('--mat-delay', (i * 320) + 'ms');
      slot.innerHTML = `
        <div class="slot-label"><span class="slot-order">${i + 1}</span><b>${pos.name}</b></div>
        <button class="flip-card" aria-label="翻开「${pos.name}」位置的歌">
          <span class="mat-halo" aria-hidden="true"></span>
          <span class="flip-flash"></span>
          <span class="flip-ring" aria-hidden="true"></span>
          <span class="mat-veil" aria-hidden="true"></span>
          <span class="mat-smoke" aria-hidden="true"><b class="s1"></b><b class="s2"></b><b class="s3"></b><b class="s4"></b><b class="s5"></b></span>
          <span class="idle-sparks" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i></span>
          <div class="flip-inner">
            <div class="flip-face flip-back"><span class="card-back"></span></div>
            <div class="flip-face flip-front" style="--album-h:${album.hue}">
              <span class="ff-cover"><img src="${coverSrc(card)}" alt="${card.title} 专辑封面" loading="lazy" /></span>
              <span class="ff-title">${card.title}</span>
              <span class="ff-sub">${album.name.split(' · ')[0]} · ${album.year}</span>
            </div>
          </div>
        </button>
        <div class="slot-name"></div>
      `;
      const flipBtn = slot.querySelector('.flip-card');
      flipBtn.addEventListener('click', () => flipCard(i, slot, flipBtn));
      board.appendChild(slot);
      // 凝聚过程中伴随金尘向右上飘散
      setTimeout(() => spawnBurst(flipBtn, 'drift', 26), i * 320 + 150);
    });
  }

  /* 金色光尘粒子。radial：翻牌时向四周迸散；drift：凝聚/升起时向右上飘散。
     圆点火星与 ✦ 星形火花混合，分 2-3 波错峰出场（等光罩衰减后登场，不与闪光抢戏），
     一半粒子带忽明忽暗的闪烁飞行 */
  function spawnBurst(host, mode = 'radial', count = 18) {
    if (REDUCED_MOTION) return;
    const burst = document.createElement('span');
    burst.className = 'flip-burst';
    for (let i = 0; i < count; i++) {
      const isStar = Math.random() < 0.38;
      const p = document.createElement('i');
      if (isStar) { p.className = 'star'; p.textContent = '✦'; }
      let px, py, delay;
      const wave = i % 3;
      if (mode === 'drift') {
        const ang = Math.PI * (0.08 + Math.random() * 0.42);   // 右上扇区
        const dist = 50 + Math.random() * 115;
        px = Math.cos(ang) * dist;
        py = -Math.sin(ang) * dist;
        delay = 350 + wave * 220 + Math.random() * 260;
      } else {
        const ang = Math.random() * Math.PI * 2;
        const dist = 70 + Math.random() * 180;
        px = Math.cos(ang) * dist;
        py = Math.sin(ang) * dist;
        delay = 200 + wave * 190 + Math.random() * 200;
      }
      p.style.setProperty('--px', px.toFixed(0) + 'px');
      p.style.setProperty('--py', py.toFixed(0) + 'px');
      p.style.setProperty('--ps', (3 + Math.random() * 5.5).toFixed(1) + 'px');
      p.style.setProperty('--pfs', (10 + Math.random() * 9).toFixed(0) + 'px');
      p.style.setProperty('--pd', (750 + Math.random() * 750).toFixed(0) + 'ms');
      p.style.setProperty('--pdelay', delay.toFixed(0) + 'ms');
      if (Math.random() < 0.5) p.style.animationName = 'particle-fly-tw';
      burst.appendChild(p);
    }
    host.appendChild(burst);
    setTimeout(() => burst.remove(), 2600);
  }

  function flipCard(index, slot, flipBtn) {
    if (flipBtn.classList.contains('flipped')) return;
    flipBtn.classList.add('flipped');
    slot.classList.add('revealed');
    spawnBurst(flipBtn, 'radial', 30);

    const entry = state.picked[index];
    const album = ALBUMS[entry.card.album];
    slot.querySelector('.slot-name').innerHTML =
      `${entry.card.title}<span class="era-tag">${album.year}</span>`;

    appendInterpretation(index);

    state.flippedCount++;
    if (state.flippedCount === state.spread.positions.length) {
      const actions = $('#reading-actions');
      actions.classList.add('gone');
      setTimeout(() => actions.classList.add('done-hide'), 450);
      setTimeout(renderSummary, 500);
    }
  }

  /* ---------- 推荐语生成 ----------
     三层结构：位置引子 → 歌曲推荐语正文 → 「这样听」建议 → （全部翻开后）歌单总语。
     引子模板按曲目做确定性轮换，同一次抽歌里语气不重复。 */

  const pick = (arr, seed) => arr[((seed % arr.length) + arr.length) % arr.length];

  const LEADS = {
    '今日主打': [
      (t) => `今天替你按下播放键的是《${t}》。不问为什么是它——先听一遍，你大概就懂了。`,
      (t) => `《${t}》抽中了你。今天遇到的某个瞬间，会刚好接上这首歌的某一句。`,
    ],
    '回忆': [
      (t) => `落在「回忆」位置的是《${t}》——有些日子过去了，但它的背景音乐一直没停。`,
      (t) => `「回忆」抽到《${t}》。前奏一响，你会想起某个具体的人、某条走过的路。`,
    ],
    '此刻': [
      (t) => `「此刻」是《${t}》——它描述的多半就是你现在的心情，比你自己说得还准。`,
      (t) => `此时此刻，配乐是《${t}》。听听看它把光打在了你今天的哪件事上。`,
    ],
    '期待': [
      (t) => `指向「期待」的是《${t}》——接下来的日子，也许就是这首歌的样子。`,
      (t) => `「期待」翻出《${t}》。把它设成这段时间的主题曲，走着走着就到了。`,
    ],
    '开场曲': [
      (t) => `歌单的开场交给《${t}》——第一首歌定基调，今天的基调就是它。`,
      (t) => `以《${t}》开场。深呼吸，接下来的五首歌都是为你排的。`,
    ],
    '心事': [
      (t) => `「心事」的位置翻出《${t}》——它大概唱中了你最近没跟人说的那件事。`,
      (t) => `《${t}》站在「心事」的位置上。有些话自己说不出口，就让歌替你说。`,
    ],
    '转折': [
      (t) => `歌单在《${t}》这里换气——情绪不能一路沉下去，这首歌负责把窗户推开。`,
      (t) => `「转折」是《${t}》。从这里开始，歌单的天色慢慢变亮。`,
    ],
    '治愈': [
      (t) => `负责接住你的是《${t}》——这一首别快进，让它把该说的话说完。`,
      (t) => `「治愈」的位置属于《${t}》。今天所有的疲惫，到这首歌为止。`,
    ],
    '安可': [
      (t) => `安可曲是《${t}》——散场前最后一首，也是明天开始前的第一份余韵。`,
      (t) => `最后留在耳边的是《${t}》。听完就休息吧，今天已经很完整了。`,
    ],
  };

  function buildLead(posName, entry, seed) {
    const templates = LEADS[posName] || [
      (t) => `这个位置上翻出了《${t}》——`,
    ];
    return pick(templates, seed)(entry.card.title);
  }

  function appendInterpretation(index) {
    const pos = state.spread.positions[index];
    const entry = state.picked[index];
    const { card } = entry;
    const album = ALBUMS[card.album];
    const seed = card.id.length + index * 3;

    const titleFull = card.titleZh ? `${card.title} · ${card.titleZh}` : card.title;
    const item = document.createElement('article');
    item.className = 'interp-card';
    item.innerHTML = `
      <div class="interp-head">
        <span class="interp-pos">${index + 1} · ${pos.name}</span>
        <span class="interp-title">${titleFull}</span>
        <span class="interp-en">${album.name} · ${album.label} · ${album.year}</span>
      </div>
      <p class="interp-lead">${buildLead(pos.name, entry, seed)}</p>
      <div class="keywords">${card.moods.map((k) => `<span class="kw">${k}</span>`).join('')}</div>
      <p class="interp-desc">${card.desc}</p>
      <p class="interp-advice">${card.scene}</p>
    `;
    $('#interpretations').appendChild(item);
  }

  /* 歌单总语：全部翻开后，把几首歌串成一段话 */
  function buildSummary() {
    const picks = state.picked;
    const total = picks.length;
    const out = [];

    // 时代跨度
    const albums = picks.map((p) => ALBUMS[p.card.album]);
    const years = albums.map((a) => a.year);
    const minY = Math.min(...years);
    const maxY = Math.max(...years);
    const eras = new Set(albums.map((a) => a.era));
    if (total > 1 && eras.size === 1) {
      out.push(`这次抽到的歌全部来自同一个时期——${ERA_NAME[albums[0].era]}。今天的你，大概正需要那个时候的 IU。`);
    } else if (total > 1 && maxY - minY >= 8) {
      out.push(`这份歌单横跨了 ${maxY - minY} 年：从 ${minY} 年一路listened到 ${maxY} 年。按顺序听下来，等于陪 IU 把这段路重新走了一遍。`);
    }

    // 同专辑聚集
    const byAlbum = {};
    picks.forEach((p) => { byAlbum[p.card.album] = (byAlbum[p.card.album] || 0) + 1; });
    const dom = Object.entries(byAlbum).sort((x, y) => y[1] - x[1])[0];
    if (dom && dom[1] >= 2) {
      out.push(`其中 ${dom[1]} 首都来自《${ALBUMS[dom[0]].name.split(' · ')[0]}》——牌在提醒你：这张专辑值得今天完整重听一次。`);
    }

    // 心情关键词
    const moodSet = [];
    picks.forEach((p) => p.card.moods.forEach((m) => { if (!moodSet.includes(m)) moodSet.push(m); }));
    out.push(`今日歌单的关键词：${moodSet.slice(0, Math.min(5, moodSet.length)).join(' · ')}。`);

    // 阵型专属结语
    if (state.spread.id === 'three-card' && total === 3) {
      const [a, b, c] = years;
      if (a <= b && b <= c) {
        out.push(`三首歌恰好按时间顺序排开——从过去听到现在，像一次不经意的成长回放。别跳歌，让它们按顺序讲完。`);
      } else if (a >= b && b >= c) {
        out.push(`三首歌逆着时间往回走——今天适合怀旧。听到最后一首时，回头看看自己已经走了多远。`);
      } else {
        out.push(`三首歌在不同年份之间来回跳——心情本来就不是直线。哪一首停留得最久，答案就在哪里。`);
      }
    }
    if (state.spread.id === 'playlist' && total === 5) {
      out.push(`五首连播大约二十分钟。找一副耳机、一段不被打扰的时间，从开场听到安可——今天就算被认真收尾了。`);
    }
    if (state.spread.id === 'single') {
      out.push(`一首歌不多，但单曲循环从来不是将就——今天就把这一首听旧，明天再来抽新的。`);
    }
    return out;
  }

  function renderSummary() {
    const paras = buildSummary();
    if (!paras.length) return;
    const item = document.createElement('article');
    item.className = 'interp-card summary-card';
    item.innerHTML = `
      <div class="summary-title">✦ 歌单总语</div>
      <div class="summary-body">${paras.map((p) => `<p>${p}</p>`).join('')}</div>
    `;
    $('#interpretations').appendChild(item);
  }

  function flipAll() {
    const slots = document.querySelectorAll('#board .slot');
    let delay = 0;
    slots.forEach((slot) => {
      const btn = slot.querySelector('.flip-card');
      if (btn.classList.contains('flipped')) return;
      setTimeout(() => btn.click(), delay);
      delay += 280;
    });
  }

  /* ---------- 事件绑定 ---------- */

  $('#brand-btn').addEventListener('click', () => showView('home'));
  $('#btn-back').addEventListener('click', () => showView('home'));
  $('#btn-reshuffle').addEventListener('click', () => {
    state.picked = [];
    state.deck = freshShuffledDeck();
    car.rot = 0;
    car.vel = 0;
    car.inertia = false;
    car.locked = false;
    car.snapping = false;
    car.lastTouch = performance.now() - IDLE_DELAY + 250;
    car.lastAuto = 0;
    buildCarousel(true);
    renderTray();
    updateDrawProgress();
  });
  $('#btn-flip-all').addEventListener('click', flipAll);

  renderSpreadGrid();
  renderHomeSky();
  setupHeroVideo();
  document.body.classList.add('on-home');
  setupCarouselInput();
})();
