/* IU Magazine —— WebGL 杂志首页
   移植自 J0SUKE/webgl-magazine（MIT 思路致敬）：
   26 页专辑封面像一本书一样旋开、摊平、散成一条无限纵深的纸带，
   滚轮 / 触摸滑动无限翻页，滚动速度让纸页产生波浪弯曲。
   零构建：three.js 使用本地 vendor 模块，GSAP/lenis 以少量原生代码替代。 */

import * as THREE from '../assets/vendor/three.module.min.js';

/* ---------- 页面素材：13 张专辑封面 ---------- */

const ALBUMS = [
  { file: 'growing-up.jpeg',            name: 'Growing Up',              year: 2009 },
  { file: 'last-fantasy.jpeg',          name: 'Last Fantasy',            year: 2011 },
  { file: 'spring-of-twenty.jpeg',      name: '스무 살의 봄',              year: 2012 },
  { file: 'modern-times.jpeg',          name: 'Modern Times',            year: 2013 },
  { file: 'modern-times-epilogue.jpeg', name: 'Modern Times – Epilogue', year: 2013 },
  { file: 'flower-bookmark.jpeg',       name: '꽃갈피',                    year: 2014 },
  { file: 'chat-shire.jpg',             name: 'CHAT-SHIRE',              year: 2015 },
  { file: 'flower-bookmark-2.jpeg',     name: '꽃갈피 둘',                 year: 2017 },
  { file: 'love-poem.jpeg',             name: 'Love poem',               year: 2019 },
  { file: 'celebrity.jpeg',             name: 'Celebrity',               year: 2021 },
  { file: 'lilac.jpeg',                 name: 'LILAC',                   year: 2021 },
  { file: 'love-wins-all.jpeg',         name: 'Love wins all',           year: 2024 },
  { file: 'the-winning.jpeg',           name: 'The Winning',             year: 2024 },
];
const COVERS = ALBUMS.map((a) => 'assets/covers/' + a.file);

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 着色器（与参考项目一致，页面为正方形封面） ---------- */

const vertexShader = /* glsl */ `
varying vec2 vUv;

attribute float aIndex;
attribute vec4 aTextureCoords;

uniform float uPageThickness;
uniform float uPageWidth;
uniform float uPageHeight;
uniform float uMeshCount;
uniform float uProgress;
uniform float uSplitProgress;
uniform float uPageSpacing;
uniform float uScrollY;
uniform float uSpeedY;

varying vec4 vTextureCoords;
varying float vIndex;
varying float vRotationProgress;

mat3 getYrotationMatrix(float angle)
{
    return mat3(
        cos(angle), 0.0, sin(angle),
        0.0, 1.0, 0.0,
        -sin(angle), 0.0, cos(angle)
    );
}

mat3 getXrotationMatrix(float angle)
{
    return mat3(
        1.0, 0.0, 0.0,
        0.0, cos(angle), -sin(angle),
        0.0, sin(angle), cos(angle)
    );
}

float remap(float value, float originMin, float originMax)
{
    return clamp((value - originMin) / (originMax - originMin), 0., 1.);
}

float getXwave(float x)
{
    return sin(x * 2.) * 0.4;
}

void main()
{
    float PI = 3.14159265359;

    // 以书脊（左缘）为旋转中心
    vec3 rotationCenter = vec3(-uPageWidth * 0.5, 0.0, 0.0);
    vec3 translatedPosition = position - rotationCenter;

    // 第一阶段：每页错峰起转，像风快速掀书
    float rotationAcclerationProgress = remap(uProgress, 0., 0.3);
    float delayBeforeStart = (aIndex / uMeshCount);
    float localRotAccelerationProgress = clamp((rotationAcclerationProgress - delayBeforeStart), 0.0, 1.0);

    float yAngle = -(position.x * 0.2 * smoothstep(0., 0.3, rotationAcclerationProgress)
                     - rotationAcclerationProgress * 2. * PI
                     - localRotAccelerationProgress * 2. * PI);

    // 第二阶段：全速旋转
    float fullSpeedRotationAngle = remap(uProgress, 0.3, 0.7);
    yAngle += fullSpeedRotationAngle * 4.2 * PI;

    // 第三阶段：减速堆叠成一摞
    float stackingAngle = remap(uProgress, 0.7, 1.);
    yAngle += position.x * 0.2 * stackingAngle
            + (1. - localRotAccelerationProgress) * 2. * PI * stackingAngle
            + PI * 1.7 * stackingAngle;

    float pageCrumple = (aIndex - (uMeshCount - 1.) * 0.5) * smoothstep(0.8, 1., stackingAngle)
                        * ((uPageWidth - translatedPosition.x - 1.) * 0.01);
    translatedPosition.z += pageCrumple * (1. - uSplitProgress);

    float pageCrumpleAngle = (aIndex - (uMeshCount - 1.) * 0.5) * smoothstep(0.8, 1., stackingAngle)
                             * ((-pow(translatedPosition.x, 2.)) * 0.002);
    yAngle += pageCrumpleAngle;

    float stackingPages = (uMeshCount - aIndex) * uPageThickness * smoothstep(0.8, 1., stackingAngle);
    translatedPosition.z += stackingPages * (1. - uSplitProgress);

    // 第四阶段：整摞散开成等距纸带
    yAngle -= pageCrumpleAngle * uSplitProgress;
    yAngle -= uSplitProgress * PI * 0.4;
    translatedPosition.z += uSplitProgress * uPageSpacing * (-(aIndex - (uMeshCount - 1.) * 0.5));

    // 纵深无限滚动：对每页中心取模回绕，滚动速度驱动波浪弯曲
    float boxCenterZ = uPageSpacing * (-(aIndex - (uMeshCount - 1.) * 0.5));
    float maxZ = uMeshCount * (uPageSpacing + uPageThickness) * 0.5;
    float centerZProgress = boxCenterZ - uScrollY;
    float wrappedCenterZ = mod(centerZProgress + maxZ, 2.0 * maxZ) - maxZ
                           - getXwave((position.y + uPageHeight * 0.5) / uPageHeight) * clamp(uSpeedY * 2., -2., 2.);
    float zOffset = wrappedCenterZ - boxCenterZ;
    translatedPosition.z += zOffset;

    vec3 rotatedPosition = getYrotationMatrix(yAngle) * translatedPosition;
    rotatedPosition.z -= uSplitProgress;

    float initialRotationProgress = remap(uProgress, 0., 0.15);
    rotatedPosition += rotationCenter;
    rotatedPosition.x += initialRotationProgress * uPageWidth * 0.5;

    float xAngle = -PI * 0.2 * initialRotationProgress;
    xAngle += uSplitProgress * PI * 0.2;

    vec3 newPosition = getXrotationMatrix(xAngle) * rotatedPosition;

    vec4 modelPosition = modelMatrix * instanceMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    gl_Position = projectionMatrix * viewPosition;

    vUv = uv;
    vTextureCoords = aTextureCoords;
    vIndex = aIndex;
    vRotationProgress = localRotAccelerationProgress;
}
`;

const fragmentShader = /* glsl */ `
varying vec2 vUv;
varying vec4 vTextureCoords;
uniform sampler2D uAtlas;

varying float vIndex;
varying float vRotationProgress;

void main()
{
    float xStart = vTextureCoords.x;
    float xEnd = vTextureCoords.y;
    float yStart = vTextureCoords.z;
    float yEnd = vTextureCoords.w;

    vec2 atlasUV = vec2(
        mix(xStart, xEnd, vUv.x),
        mix(yStart, yEnd, 1. - vUv.y)
    );

    // 尚未开始翻转的页保持隐藏（开场逐页登场）
    if (vRotationProgress == 0. && vIndex != 0.)
    {
        discard;
    }

    gl_FragColor = texture2D(uAtlas, atlasUV);
}
`;

/* ---------- 小工具：缓动 / 补间（替代 GSAP） ---------- */

const easePower2InOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// 极简补间：驱动 uniform.value 从 from 到 to
function tweenUniform(uniform, from, to, duration, delay, onComplete) {
  const t0 = performance.now() + delay;
  const tick = (now) => {
    const t = Math.min(1, Math.max(0, (now - t0) / duration));
    uniform.value = from + (to - from) * easePower2InOut(t);
    if (t < 1) requestAnimationFrame(tick);
    else onComplete && onComplete();
  };
  requestAnimationFrame(tick);
}

/* ---------- 杂志 ---------- */

class Magazine {
  constructor({ scene, sizes, onSettled }) {
    this.scene = scene;
    this.sizes = sizes;
    this.onSettled = onSettled;        // 杂志段落结束（用户停止翻阅）后的回调
    this.settled = false;
    this.lastInteraction = 0;

    this.meshCount = 26;                            // 13 张封面 × 2 轮
    this.pageThickness = 0.01;
    this.pageSpacing = 1;
    this.pageDimensions = { width: 2.4, height: 2.4 };   // 正方形 = 专辑封套

    this.scrollY = { target: 0, current: 0 };
    this.touch = { startX: 0, lastX: 0, isActive: false };

    this.geometry = new THREE.BoxGeometry(
      this.pageDimensions.width,
      this.pageDimensions.height,
      this.pageThickness,
      50, 50, 1
    );

    this.ready = this.loadTextureAtlas().then(() => {
      this.createMaterial();
      this.createMeshes();
      this.playIntro();
    });
  }

  /* 13 张封面绘入一张竖排图集：每格 512×512，居中裁切成正方形 */
  async loadTextureAtlas() {
    const images = await Promise.all(
      COVERS.map(
        (path) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = path;
          })
      )
    );

    const CELL = 512;
    const canvas = document.createElement('canvas');
    canvas.width = CELL;
    canvas.height = CELL * images.length;
    const ctx = canvas.getContext('2d');

    this.imageInfos = images.map((img, i) => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, i * CELL, CELL, CELL);
      return {
        uvs: {
          xStart: 0,
          xEnd: 1,
          yStart: 1 - (i * CELL) / canvas.height,
          yEnd: 1 - ((i + 1) * CELL) / canvas.height,
        },
      };
    });

    this.atlasTexture = new THREE.Texture(canvas);
    this.atlasTexture.colorSpace = THREE.SRGBColorSpace;
    this.atlasTexture.needsUpdate = true;
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uProgress: new THREE.Uniform(0),
        uSplitProgress: new THREE.Uniform(0),
        uPageThickness: new THREE.Uniform(this.pageThickness),
        uPageWidth: new THREE.Uniform(this.pageDimensions.width),
        uPageHeight: new THREE.Uniform(this.pageDimensions.height),
        uMeshCount: new THREE.Uniform(this.meshCount),
        uAtlas: new THREE.Uniform(this.atlasTexture),
        uScrollY: { value: 0 },
        uSpeedY: { value: 0 },
        uPageSpacing: new THREE.Uniform(this.pageSpacing),
      },
    });
  }

  createMeshes() {
    this.instancedMesh = new THREE.InstancedMesh(this.geometry, this.material, this.meshCount);

    const aTextureCoords = new Float32Array(this.meshCount * 4);
    const aIndex = new Float32Array(this.meshCount);
    for (let i = 0; i < this.meshCount; i++) {
      const info = this.imageInfos[i % this.imageInfos.length];
      aTextureCoords[i * 4 + 0] = info.uvs.xStart;
      aTextureCoords[i * 4 + 1] = info.uvs.xEnd;
      aTextureCoords[i * 4 + 2] = info.uvs.yStart;
      aTextureCoords[i * 4 + 3] = info.uvs.yEnd;
      aIndex[i] = i;
    }
    this.instancedMesh.geometry.setAttribute(
      'aTextureCoords',
      new THREE.InstancedBufferAttribute(aTextureCoords, 4)
    );
    this.instancedMesh.geometry.setAttribute(
      'aIndex',
      new THREE.InstancedBufferAttribute(aIndex, 1)
    );
    this.scene.add(this.instancedMesh);
  }

  /* 开场：书页旋开（5s）→ 散成纸带（1s，提前 0.6s 交叠）→ 接管滚动 */
  playIntro() {
    const u = this.material.uniforms;
    if (REDUCED_MOTION) {
      // 减少动态：跳过书页动画，直接进入轮盘
      u.uProgress.value = 1;
      u.uSplitProgress.value = 1;
      this.settled = true;
      this.onSettled && this.onSettled();
      return;
    }
    tweenUniform(u.uProgress, 0, 1, 5000, 0);
    tweenUniform(u.uSplitProgress, 0, 1, 1000, 4400, () => this.enableScroll());
  }

  enableScroll() {
    window.addEventListener('wheel', this.onWheel.bind(this), { passive: true });
    window.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    window.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    window.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    // 杂志段落收尾：停止翻阅 4 秒后交棒给旋转轮盘
    this.lastInteraction = performance.now();
    this.settleTimer = setInterval(() => {
      if (this.settled) return;
      if (performance.now() - this.lastInteraction > 4000) {
        this.settled = true;
        clearInterval(this.settleTimer);
        this.onSettled && this.onSettled();
      }
    }, 300);
  }

  onWheel(event) {
    if (this.settled) return;
    this.lastInteraction = performance.now();
    let pixelY = event.deltaY;
    if (event.deltaMode === 1) pixelY *= 16;                       // 行 → 像素
    else if (event.deltaMode === 2) pixelY *= window.innerHeight;  // 页 → 像素
    const scrollY = (pixelY * this.sizes.height) / window.innerHeight;
    this.scrollY.target += scrollY;
    this.material.uniforms.uSpeedY.value += scrollY;
  }

  onTouchStart(event) {
    event.preventDefault();
    const touch = event.touches[0];
    this.touch.startX = touch.clientX;
    this.touch.lastX = touch.clientX;
    this.touch.isActive = true;
  }

  onTouchMove(event) {
    if (!this.touch.isActive || this.settled) return;
    this.lastInteraction = performance.now();
    event.preventDefault();
    const touch = event.touches[0];
    const deltaX = this.touch.lastX - touch.clientX;
    const scrollY = ((deltaX * this.sizes.height) / window.innerHeight) * 2;
    this.scrollY.target += scrollY;
    this.material.uniforms.uSpeedY.value += scrollY;
    this.touch.lastX = touch.clientX;
  }

  onTouchEnd(event) {
    event.preventDefault();
    this.touch.isActive = false;
  }

  onResize(sizes) {
    this.sizes = sizes;
  }

  /* 收拢：纸带滑回原位并合拢成一摞（散开动画的倒放），为轮盘交棒做衔接 */
  gather(duration) {
    const u = this.material.uniforms;
    this.gathering = true;
    const period = this.meshCount * (this.pageSpacing + this.pageThickness);
    const snapped = Math.round(u.uScrollY.value / period) * period;
    this.scrollY.current = this.scrollY.target = snapped;
    tweenUniform(u.uScrollY, u.uScrollY.value, snapped, duration, 0);
    tweenUniform(u.uSplitProgress, u.uSplitProgress.value, 0, duration, 0);
  }

  render() {
    if (!this.material) return;
    if (!this.gathering) {
      this.scrollY.current = lerp(this.scrollY.current, this.scrollY.target, 0.12);
      this.material.uniforms.uScrollY.value = this.scrollY.current;
    }
    this.material.uniforms.uSpeedY.value *= 0.835;    // 波浪随速度衰减回平
  }
}

/* ---------- 封面轮盘（承接杂志段落的「塔罗旋转」效果） ----------
   移植自 Tarot 项目抽牌页的连续插值轮盘：rot 为连续旋转量（单位：张），
   每张卡按 rel = i - rot 在「中间大 → 两侧虚化 → 纵深隐没」的轨道上插值；
   拖动跟手、惯性滑行渐停、空闲时走一步停一拍地自动轮换 */

class CoverRing {
  constructor() {
    this.rot = 0;
    this.vel = 0;
    this.inertia = false;
    this.dragging = false;
    this.snapping = false;
    this.lastTouch = 0;
    this.lastAuto = 0;
    this.dirty = true;
    this.anim = null;
    this.loop = null;
    this.captionKey = '';

    this.VISIBLE_REL = 3;
    this.AUTO_STEP_MS = 950;
    this.AUTO_DWELL = 2400;
    this.IDLE_DELAY = 2200;
    this.FRICTION = 300;

    this.buildDom();
    this.measureGeom();
    this.bindInput();
    window.addEventListener('resize', () => { this.measureGeom(); this.dirty = true; });
  }

  buildDom() {
    this.root = document.createElement('div');
    this.root.className = 'ring';
    this.stage = document.createElement('div');
    this.stage.className = 'ring-stage';
    this.cards = ALBUMS.map((album, i) => {
      const el = document.createElement('div');
      el.className = 'ring-card';
      el.dataset.idx = i;
      el.innerHTML = `<img src="${COVERS[i]}" alt="${album.name}" draggable="false" /><span class="ring-dim"></span>`;
      this.stage.appendChild(el);
      return { album, el, hidden: undefined };
    });
    this.caption = document.createElement('p');
    this.caption.className = 'ring-caption';
    this.root.appendChild(this.stage);
    this.root.appendChild(this.caption);
    document.body.appendChild(this.root);
  }

  measureGeom() {
    const W = window.innerWidth;
    const mobile = W < 720;
    this.geom = {
      x1: W * (mobile ? 0.31 : 0.21),
      x2: W * (mobile ? 0.44 : 0.315),
      x3: W * (mobile ? 0.48 : 0.355),
      s1: 0.48,
      s2: 0.62,
      pxPerStep: W * (mobile ? 0.31 : 0.21),
    };
  }

  /* 关键帧插值：a = [中间, 侧位, 纵深, 隐没]，r = |rel| */
  kp(a, r) {
    const i = Math.min(2, Math.floor(r));
    const t = Math.min(1, r - i);
    return a[i] + (a[i + 1] - a[i]) * t;
  }

  layout() {
    const n = this.cards.length;
    const g = this.geom;
    this.cards.forEach((c, i) => {
      let rel = (((i - this.rot) % n) + n) % n;
      if (rel > n / 2) rel -= n;
      const r = Math.abs(rel);
      const el = c.el;
      if (r > this.VISIBLE_REL) {
        if (c.hidden !== true) { c.hidden = true; el.style.visibility = 'hidden'; }
        return;
      }
      if (c.hidden !== false) { c.hidden = false; el.style.visibility = 'visible'; }
      const sign = rel < 0 ? -1 : 1;
      const x = sign * this.kp([0, g.x1, g.x2, g.x3], r);
      const s = this.kp([1, g.s1, g.s2, g.s2], r);
      const ry = sign * this.kp([0, 16, 80, 86], r);
      const fade = Math.max(0, Math.min(1, (3.0 - r) / 0.5));
      el.style.transform =
        `translate(calc(-50% + ${x.toFixed(1)}px), -50%) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      el.style.opacity = (0.97 * fade).toFixed(3);
      el.style.zIndex = String(100 - Math.round(r * 10));
      el.style.setProperty('--dim', this.kp([0, 0.32, 0.5, 0.66], r).toFixed(3));
    });
    // 底部标注跟随中间那张
    const ci = ((Math.round(this.rot) % n) + n) % n;
    const a = this.cards[ci].album;
    const key = a.name + a.year;
    if (key !== this.captionKey) {
      this.captionKey = key;
      this.caption.textContent = `${a.name} — ${a.year}`;
    }
  }

  easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  animateRotTo(target, duration = 480, opts = {}) {
    cancelAnimationFrame(this.anim);
    this.inertia = false;
    const from = this.rot;
    const delta = target - from;
    if (Math.abs(delta) < 0.001) { this.rot = target; this.snapping = false; this.dirty = true; return; }
    this.snapping = true;
    const t0 = performance.now();
    const ease = opts.auto ? this.easeInOutCubic : this.easeOutCubic;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      this.rot = from + delta * ease(t);
      this.dirty = true;
      if (t < 1) this.anim = requestAnimationFrame(tick);
      else {
        this.snapping = false;
        if (!opts.auto) this.lastTouch = performance.now();
      }
    };
    this.anim = requestAnimationFrame(tick);
  }

  start() {
    // 入场：所有可见卡先堆在屏幕中心（接住 WebGL 里刚收拢的纸堆），再扇出到轨道位置
    const n = this.cards.length;
    this.cards.forEach((c, i) => {
      let rel = (((i - this.rot) % n) + n) % n;
      if (rel > n / 2) rel -= n;
      const r = Math.abs(rel);
      const el = c.el;
      if (r > this.VISIBLE_REL) {
        c.hidden = true;
        el.style.visibility = 'hidden';
        return;
      }
      c.hidden = false;
      el.style.transform = 'translate(-50%, -50%) rotateX(26deg) scale(0.8)';
      el.style.opacity = '0';
      el.style.zIndex = String(100 - Math.round(r * 10));
      el.style.setProperty('--dim', '0');
      el.style.setProperty('--deal-delay', Math.round(r * 110) + 'ms');
    });
    document.body.classList.add('ring-on');
    this.stage.classList.add('enter');
    // 双 rAF：确保初始堆叠状态先渲染一帧，随后的 layout() 走 transition 扇出
    requestAnimationFrame(() => requestAnimationFrame(() => this.layout()));
    setTimeout(() => {
      this.stage.classList.remove('enter');
      this.lastTouch = performance.now();     // 落定后先稳一拍，再开始自动轮换
      this.startLoop();
    }, 1600);
  }

  startLoop() {
    if (this.loop) return;
    let last = 0;
    const frame = (now) => {
      const dt = last ? Math.min(50, now - last) : 0;
      last = now;
      if (this.inertia && dt) {
        this.rot += this.vel * dt;
        this.vel *= Math.exp(-dt / this.FRICTION);
        this.dirty = true;
        if (Math.abs(this.vel) < 0.0004) {
          this.inertia = false;
          this.animateRotTo(Math.round(this.rot), 360);
        }
      } else if (!REDUCED_MOTION) {
        const idle = !this.dragging && !this.snapping && !this.inertia
          && now - this.lastTouch > this.IDLE_DELAY
          && now - this.lastAuto > this.AUTO_DWELL;
        if (idle) {
          this.lastAuto = now;
          this.animateRotTo(Math.round(this.rot) + 1, this.AUTO_STEP_MS, { auto: true });
        }
      }
      if (this.dirty) { this.dirty = false; this.layout(); }
      this.loop = requestAnimationFrame(frame);
    };
    this.loop = requestAnimationFrame(frame);
  }

  bindInput() {
    const area = this.root;
    let sx = 0, lastX = 0, lastT = 0, startRot = 0, moved = 0;

    area.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.inertia = false;
      cancelAnimationFrame(this.anim);
      this.snapping = false;
      moved = 0;
      sx = lastX = e.clientX;
      lastT = performance.now();
      startRot = this.rot;
      this.vel = 0;
      this.lastTouch = lastT;
      area.classList.add('grabbing');
      area.setPointerCapture(e.pointerId);
    });

    area.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      this.vel = -(dx / this.geom.pxPerStep) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      moved = Math.max(moved, Math.abs(e.clientX - sx));
      this.rot = startRot - (e.clientX - sx) / this.geom.pxPerStep;
      this.lastTouch = now;
      this.dirty = true;
    });

    const finish = (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      this.lastTouch = performance.now();
      area.classList.remove('grabbing');
      if (moved < 8) {
        // 轻点侧边的卡：转到它
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const t = hit && hit.closest('.ring-card');
        if (t) {
          const i = Number(t.dataset.idx);
          const n = this.cards.length;
          let rel = (((i - this.rot) % n) + n) % n;
          if (rel > n / 2) rel -= n;
          if (Math.abs(rel) >= 0.5) { this.animateRotTo(this.rot + rel, 520); return; }
        }
        this.animateRotTo(Math.round(this.rot), 360);
        return;
      }
      if (Math.abs(this.vel) > 0.0006) {
        this.vel = Math.max(-0.02, Math.min(0.02, this.vel));
        this.inertia = true;
      } else {
        this.animateRotTo(Math.round(this.rot), 360);
      }
    };
    area.addEventListener('pointerup', finish);
    area.addEventListener('pointercancel', () => {
      this.dragging = false;
      area.classList.remove('grabbing');
      this.animateRotTo(Math.round(this.rot), 360);
    });

    // 滚轮：注入惯性，沿用摩擦渐停 + 吸附
    area.addEventListener('wheel', (e) => {
      let pixelY = e.deltaY;
      if (e.deltaMode === 1) pixelY *= 16;
      else if (e.deltaMode === 2) pixelY *= window.innerHeight;
      cancelAnimationFrame(this.anim);
      this.snapping = false;
      this.vel = Math.max(-0.02, Math.min(0.02, this.vel + pixelY * 0.00003));
      this.inertia = true;
      this.lastTouch = performance.now();
    }, { passive: true });

    // 键盘可达性
    area.tabIndex = 0;
    area.addEventListener('keydown', (e) => {
      this.lastTouch = performance.now();
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.animateRotTo(Math.round(this.rot) - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); this.animateRotTo(Math.round(this.rot) + 1); }
    });
  }
}

/* ---------- 画布 ---------- */

class Canvas {
  constructor() {
    this.element = document.getElementById('webgl');

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.z = 6;
    this.scene.add(this.camera);

    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    };
    this.renderer = new THREE.WebGLRenderer({ canvas: this.element, alpha: true, antialias: true });
    this.renderer.setSize(this.dimensions.width, this.dimensions.height);
    this.renderer.setPixelRatio(this.dimensions.pixelRatio);

    this.setSizes();
    this.magazine = new Magazine({
      scene: this.scene,
      sizes: this.sizes,
      onSettled: () => this.handoffToRing(),
    });

    window.addEventListener('resize', this.onResize.bind(this));
    this.render();
  }

  /* 杂志段落结束：纸带收拢成一摞 → 交叉淡化 → 轮盘从中心扇出接棒 */
  handoffToRing() {
    const GATHER_MS = 1050;
    this.magazine.gather(GATHER_MS);
    this.ring = new CoverRing();
    // 纸堆基本合拢时开始交棒：画布淡出与轮盘扇出交叠进行
    setTimeout(() => {
      this.ring.start();                                // body.ring-on 触发画布 CSS 淡出
      setTimeout(() => { this.stopped = true; }, 1300); // 淡出完成后停掉 WebGL 渲染
    }, GATHER_MS - 250);
  }

  /* 相机在 z=0 平面看到的世界尺寸 */
  setSizes() {
    const fov = this.camera.fov * (Math.PI / 180);
    const height = this.camera.position.z * Math.tan(fov / 2) * 2;
    const width = height * this.camera.aspect;
    this.sizes = { width, height };
  }

  onResize() {
    this.dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    };
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.setSizes();
    this.renderer.setPixelRatio(this.dimensions.pixelRatio);
    this.renderer.setSize(this.dimensions.width, this.dimensions.height);
    this.magazine?.onResize(this.sizes);
  }

  render() {
    if (this.stopped) return;                 // 轮盘接管后不再排帧
    this.renderer.render(this.scene, this.camera);
    this.magazine?.render();
    requestAnimationFrame(this.render.bind(this));
  }
}

/* ---------- 启动（WebGL 不可用则退回封面墙） ---------- */

try {
  new Canvas();
} catch (err) {
  console.error('WebGL 初始化失败，退回封面墙：', err);
  const fb = document.getElementById('fallback');
  fb.innerHTML = COVERS.map((src) => `<img src="${src}" alt="IU album cover" loading="lazy" />`).join('');
  fb.hidden = false;
  document.body.style.overflow = 'auto';
}
