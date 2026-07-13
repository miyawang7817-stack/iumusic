/* IU Magazine —— WebGL 首页
   开场（移植自 J0SUKE/webgl-magazine 的着色器）：专辑封面像一本书被风掀开、
   全速旋转、堆叠成摞、散成纸带亮相，随即收拢，交棒给 DOM 封面轮盘（塔罗式旋转）。
   零构建：three.js 使用本地 vendor 模块，补间用少量原生代码实现。 */

import * as THREE from '../assets/vendor/three.module.min.js';

/* ---------- 页面素材：13 张专辑封面 ---------- */

const ALBUMS = [
  { file: 'lost-and-found.png' ,        name: 'Lost and Found',          year: 2008,
    tracks: ['미아 Lost Child'] },
  { file: 'iu-im.png' ,                 name: 'IU…IM',                   year: 2009,
    tracks: ['마쉬멜로우 Marshmallow'] },
  { file: 'growing-up.jpeg',            name: 'Growing Up',              year: 2009,
    tracks: ['Boo', '있잖아 Hey'] },
  { file: 'real.png' ,                  name: 'Real',                    year: 2010,
    tracks: ['좋은 날 Good Day'] },
  { file: 'last-fantasy.jpeg',          name: 'Last Fantasy',            year: 2011,
    tracks: ['너랑 나 You & I', '삼촌 Uncle', '사랑니', '잠자는 숲 속의 왕자'] },
  { file: 'spring-of-twenty.jpeg',      name: '스무 살의 봄',              year: 2012,
    tracks: ['복숭아 Peach', '하루 끝 Every End of the Day'] },
  { file: 'modern-times.jpeg',          name: 'Modern Times',            year: 2013,
    tracks: ['분홍신 The Red Shoes', '을의 연애', '우울시계'] },
  { file: 'modern-times-epilogue.jpeg', name: 'Modern Times – Epilogue', year: 2013,
    tracks: ['금요일에 만나요 Friday', '소원 Wish'] },
  { file: 'flower-bookmark.jpeg',       name: '꽃갈피',                    year: 2014,
    tracks: ['나의 옛날이야기', '너의 의미 The Meaning of You', '꽃'] },
  { file: 'chat-shire.jpg',             name: 'CHAT-SHIRE',              year: 2015,
    tracks: ['스물셋 Twenty-three', 'Zezé', '무릎 Knees', '푸르던'] },
  { file: 'palette.png' ,               name: 'Palette',                 year: 2017,
    tracks: ['팔레트 Palette', '밤편지 Through the Night', '이런 엔딩 Ending Scene'] },
  { file: 'flower-bookmark-2.jpeg',     name: '꽃갈피 둘',                 year: 2017,
    tracks: ['가을 아침 Autumn Morning', '개여울', '매일 그대와'] },
  { file: 'love-poem.jpeg',             name: 'Love poem',               year: 2019,
    tracks: ['Love poem', 'Blueming', 'unlucky', '시간의 바깥'] },
  { file: 'celebrity.jpeg',             name: 'Celebrity',               year: 2021,
    tracks: ['Celebrity'] },
  { file: 'lilac.jpeg',                 name: 'LILAC',                   year: 2021,
    tracks: ['라일락 LILAC', 'Coin', '아이와 나의 바다 My Sea', '에필로그 Epilogue'] },
  { file: 'pieces.png' ,                name: '조각집 Pieces',             year: 2021,
    tracks: ['겨울잠 Winter Sleep', '드라마 Drama'] },
  { file: 'love-wins-all.jpeg',         name: 'Love wins all',           year: 2024,
    tracks: ['Love wins all'] },
  { file: 'the-winning.jpeg',           name: 'The Winning',             year: 2024,
    tracks: ['Shopper', '홀씨 Holssi', 'Shh..'] },
];
const COVER_SRC = {};
ALBUMS.forEach((a) => { COVER_SRC[a.file] = 'assets/covers/' + a.file; });

// 预加载后填充：仅保留成功加载的专辑（缺图自动跳过，不影响其它封面）
let AVAILABLE = [];            // [{ file, name, year, src, img }]

function preloadCovers() {
  return Promise.all(
    ALBUMS.map(
      (a) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ ...a, src: COVER_SRC[a.file], img });
          img.onerror = () => resolve(null);   // 缺图跳过
          img.src = COVER_SRC[a.file];
        })
    )
  ).then((list) => { AVAILABLE = list.filter(Boolean); });
}

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
  constructor({ scene, onSettled }) {
    this.scene = scene;
    this.onSettled = onSettled;        // 杂志段落结束后的回调
    this.settled = false;

    this.meshCount = Math.max(2, AVAILABLE.length) * 2;   // 每张封面在开场纸带上出现两轮
    this.pageThickness = 0.01;
    this.pageSpacing = 1;
    this.pageDimensions = { width: 2.4, height: 2.4 };   // 正方形 = 专辑封套

    this.geometry = new THREE.BoxGeometry(
      this.pageDimensions.width,
      this.pageDimensions.height,
      this.pageThickness,
      50, 50, 1
    );

    this.buildTextureAtlas();
    this.createMaterial();
    this.createMeshes();
    this.playIntro();
  }

  /* 已加载的封面绘入一张竖排图集：每格 512×512，居中裁切成正方形 */
  buildTextureAtlas() {
    const images = AVAILABLE.map((a) => a.img);
    const CELL = 512;
    const canvas = document.createElement('canvas');
    canvas.width = CELL;
    canvas.height = CELL * Math.max(1, images.length);
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
    tweenUniform(u.uSplitProgress, 0, 1, 1000, 4400, () => {
      // 纸带亮相一瞬，直接收拢交棒给轮盘
      setTimeout(() => {
        this.settled = true;
        this.onSettled && this.onSettled();
      }, 350);
    });
  }

  /* 收拢：纸带合拢成一摞（散开动画的倒放），为轮盘交棒做衔接 */
  gather(duration) {
    const u = this.material.uniforms;
    tweenUniform(u.uSplitProgress, u.uSplitProgress.value, 0, duration, 0);
  }
}

/* ---------- 封面轮盘（承接杂志段落的「塔罗旋转」效果） ----------
   移植自 Tarot 项目抽牌页的连续插值轮盘：rot 为连续旋转量（单位：张），
   每张卡按 rel = i - rot 在「中间大 → 两侧虚化 → 纵深隐没」的轨道上插值；
   拖动跟手、惯性滑行渐停、空闲时走一步停一拍地自动轮换 */

class CoverRing {
  constructor({ onOpen } = {}) {
    this.onOpen = onOpen;
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
    this.AUTO_STEP_MS = 600;
    this.AUTO_DWELL = 1700;
    this.IDLE_DELAY = 1500;
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
    this.cards = AVAILABLE.map((album, i) => {
      const el = document.createElement('div');
      el.className = 'ring-card';
      el.dataset.idx = i;
      el.innerHTML = `<img src="${album.src}" alt="${album.name}" draggable="false" /><span class="ring-dim"></span>`;
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
        // 轻点：中间的卡 → 打开专辑；侧边的卡 → 转到它
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const t = hit && hit.closest('.ring-card');
        if (t) {
          const i = Number(t.dataset.idx);
          const n = this.cards.length;
          let rel = (((i - this.rot) % n) + n) % n;
          if (rel > n / 2) rel -= n;
          if (Math.abs(rel) >= 0.5) { this.animateRotTo(this.rot + rel, 520); return; }
          if (this.onOpen) { this.onOpen(this.cards[i].album); return; }
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
      if (e.key === 'Enter' && this.onOpen) {
        e.preventDefault();
        const n = this.cards.length;
        this.onOpen(this.cards[((Math.round(this.rot) % n) + n) % n].album);
      }
    });
  }
}

/* ---------- 专辑播放器卡片场（参照 J0SUKE/spotify-visualiser） ----------
   点开轮盘中间的专辑后进入：数百张「播放器卡片」漂浮在 3D 空间里缓缓横移，
   拖拽平移视野、滚轮向纵深穿行（Z 轴取模无限循环），远处卡片淡入并带模糊光晕。
   播放器卡片框架由 Canvas 程序化绘制（不依赖外部素材）。 */

// 卡片艺术区（封面挖孔）在贴图 UV 里的位置，JS 与着色器共用
const CARD_W = 640, CARD_H = 1082;
const HOLE = { x: 38, y: 64, size: 564 };
const HOLE_UV = {
  u0: HOLE.x / CARD_W,
  w:  HOLE.size / CARD_W,
  v0: 1 - (HOLE.y + HOLE.size) / CARD_H,
  h:  HOLE.size / CARD_H,
};

/* 程序化绘制播放器卡片框架：车体 #161616（b>0.02），封面挖孔纯黑（b<0.02 触发着色器采样封面） */
function drawPlayerCard() {
  const c = document.createElement('canvas');
  c.width = CARD_W; c.height = CARD_H;
  const ctx = c.getContext('2d');
  const rr = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  // 卡体
  rr(0, 0, CARD_W, CARD_H, 52); ctx.fillStyle = '#161616'; ctx.fill();
  // 顶部提手
  rr(CARD_W / 2 - 70, 20, 140, 10, 5); ctx.fillStyle = '#e8e8e8'; ctx.fill();
  // 封面挖孔（纯黑 = 着色器里替换成封面）
  rr(HOLE.x, HOLE.y, HOLE.size, HOLE.size, 28); ctx.fillStyle = '#000'; ctx.fill();
  // 进度条
  rr(38, 742, 564, 6, 3); ctx.fillStyle = '#4d4d4d'; ctx.fill();
  rr(38, 742, 92, 6, 3); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.fillStyle = '#c9c9c9'; ctx.font = '26px sans-serif';
  ctx.textAlign = 'left';  ctx.fillText('0:10', 38, 798);
  ctx.textAlign = 'right'; ctx.fillText('-3:36', 602, 798);
  // 控制键：上一首 / 暂停 / 下一首
  ctx.fillStyle = '#fff';
  const tri = (cx, cy, s, dir) => {
    ctx.beginPath();
    ctx.moveTo(cx + dir * s, cy - s * 0.8);
    ctx.lineTo(cx + dir * s, cy + s * 0.8);
    ctx.lineTo(cx - dir * s, cy);
    ctx.closePath(); ctx.fill();
  };
  const cy = 890;
  tri(172, cy, 26, 1); tri(214, cy, 26, 1);            // ⏮（双三角向左）
  rr(296, cy - 36, 18, 72, 6); ctx.fill();             // ⏸
  rr(330, cy - 36, 18, 72, 6); ctx.fill();
  tri(468, cy, 26, -1); tri(426, cy, 26, -1);          // ⏭
  // 音量条
  ctx.fillStyle = '#4d4d4d'; rr(120, 1004, 400, 5, 2.5); ctx.fill();
  ctx.beginPath(); ctx.moveTo(78, 1006); ctx.lineTo(98, 992); ctx.lineTo(98, 1020); ctx.closePath();
  ctx.fillStyle = '#c9c9c9'; ctx.fill();
  ctx.beginPath(); ctx.arc(368, 1006, 15, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  return c;
}

const fieldVertexShader = /* glsl */ `
attribute vec3 aInitialPosition;
attribute float aMeshSpeed;

uniform float uTime;
uniform vec2 uMaxDisp;
uniform vec2 uDrag;
uniform float uScrollY;

varying vec2 vUv;
varying float vVisibility;

float remap(float value, float originMin, float originMax)
{
    return clamp((value - originMin) / (originMax - originMin), 0., 1.);
}

void main()
{
    vec3 newPosition = position + aInitialPosition;

    float maxYoffset = distance(aInitialPosition.y, uMaxDisp.y);
    float minYoffset = distance(aInitialPosition.y, -uMaxDisp.y);
    float maxXoffset = distance(aInitialPosition.x, uMaxDisp.x);
    float minXoffset = distance(aInitialPosition.x, -uMaxDisp.x);

    // 横向缓漂 + 拖拽平移，出界取模回绕
    float xDisplacement = mod(minXoffset - uDrag.x + uTime * aMeshSpeed, maxXoffset + minXoffset) - minXoffset;
    float yDisplacement = mod(minYoffset - uDrag.y, maxYoffset + minYoffset) - minYoffset;

    // 纵深穿行：Z 取模无限循环
    float maxZ = 12.;
    float minZ = -30.;
    float maxZoffset = distance(aInitialPosition.z, maxZ);
    float minZoffset = distance(aInitialPosition.z, minZ);
    float zDisplacement = mod(uScrollY + minZoffset, maxZoffset + minZoffset) - minZoffset;

    newPosition.x += xDisplacement;
    newPosition.y += yDisplacement;
    newPosition.z += zDisplacement;

    vVisibility = remap(newPosition.z, minZ, minZ + 5.);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(newPosition, 1.0);
    vUv = uv;
}
`;

const fieldFragmentShader = /* glsl */ `
varying vec2 vUv;
varying float vVisibility;

uniform sampler2D uWrapper;
uniform sampler2D uCover;
uniform sampler2D uBlurry;

void main()
{
    vec4 texel = texture2D(uWrapper, vUv);
    if (texel.a < 0.01) discard;

    vec2 artUV = vec2(
        (vUv.x - ${HOLE_UV.u0.toFixed(5)}) / ${HOLE_UV.w.toFixed(5)},
        (vUv.y - ${HOLE_UV.v0.toFixed(5)}) / ${HOLE_UV.h.toFixed(5)}
    );
    artUV = clamp(artUV, 0., 1.);

    vec4 color = texel.b < 0.02
        ? texture2D(uCover, artUV)                  // 挖孔区：封面
        : texel + texture2D(uBlurry, artUV) * 0.8;  // 卡体：叠加封面模糊光晕

    color.a *= vVisibility;
    color.rgb = min(color.rgb, vec3(1.));
    gl_FragColor = color;
}
`;

class PlayerField {
  constructor({ scene, sizes, album }) {
    this.scene = scene;
    this.sizes = sizes;
    this.active = true;
    this.meshCount = 300;
    this.maxDisp = { x: sizes.width * 2, y: sizes.height * 2 };
    this.drag = { xCurrent: 0, xTarget: 0, yCurrent: 0, yTarget: 0, isDown: false, lastX: 0, lastY: 0 };
    this.scrollY = { target: 0, current: 0 };

    this.geometry = new THREE.PlaneGeometry(2, 2 * (CARD_H / CARD_W), 1, 1);
    this.createTextures(album);
    this.createMaterial();
    this.createMesh();

    this.onWheelBound = this.onWheel.bind(this);
    window.addEventListener('wheel', this.onWheelBound, { passive: true });
  }

  /* 封面居中裁方 + 模糊光晕版 */
  createTextures(album) {
    const CELL = 512;
    const img = album.img;
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2, sy = (img.height - side) / 2;

    const cover = document.createElement('canvas');
    cover.width = cover.height = CELL;
    cover.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, CELL, CELL);
    this.coverTexture = new THREE.Texture(cover);
    this.coverTexture.colorSpace = THREE.SRGBColorSpace;
    this.coverTexture.needsUpdate = true;

    const blurry = document.createElement('canvas');
    blurry.width = blurry.height = CELL;
    const bctx = blurry.getContext('2d');
    bctx.filter = 'blur(60px)';
    bctx.drawImage(cover, 0, 0);
    this.blurryTexture = new THREE.Texture(blurry);
    this.blurryTexture.needsUpdate = true;

    this.wrapperTexture = new THREE.Texture(drawPlayerCard());
    this.wrapperTexture.needsUpdate = true;
  }

  createMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: fieldVertexShader,
      fragmentShader: fieldFragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uMaxDisp: { value: new THREE.Vector2(this.maxDisp.x, this.maxDisp.y) },
        uDrag: { value: new THREE.Vector2(0, 0) },
        uScrollY: { value: 0 },
        uWrapper: new THREE.Uniform(this.wrapperTexture),
        uCover: new THREE.Uniform(this.coverTexture),
        uBlurry: new THREE.Uniform(this.blurryTexture),
      },
    });
  }

  createMesh() {
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.meshCount);
    const initialPosition = new Float32Array(this.meshCount * 3);
    const meshSpeed = new Float32Array(this.meshCount);
    for (let i = 0; i < this.meshCount; i++) {
      initialPosition[i * 3 + 0] = (Math.random() - 0.5) * this.maxDisp.x * 2;
      initialPosition[i * 3 + 1] = (Math.random() - 0.5) * this.maxDisp.y * 2;
      initialPosition[i * 3 + 2] = Math.random() * (7 - -30) - 30;
      meshSpeed[i] = Math.random() * 0.5 + 0.5;
    }
    this.geometry.setAttribute('aInitialPosition', new THREE.InstancedBufferAttribute(initialPosition, 3));
    this.geometry.setAttribute('aMeshSpeed', new THREE.InstancedBufferAttribute(meshSpeed, 1));
    this.scene.add(this.mesh);
  }

  bindDrag(element) {
    this.dragElement = element;
    this.onDown = (e) => {
      this.drag.isDown = true;
      this.drag.lastX = e.clientX;
      this.drag.lastY = e.clientY;
      element.setPointerCapture(e.pointerId);
    };
    this.onMove = (e) => {
      if (!this.drag.isDown || !this.active) return;
      const dx = e.clientX - this.drag.lastX;
      const dy = e.clientY - this.drag.lastY;
      this.drag.lastX = e.clientX;
      this.drag.lastY = e.clientY;
      this.drag.xTarget += -dx * (this.sizes.width / window.innerWidth);
      this.drag.yTarget += dy * (this.sizes.height / window.innerHeight);
    };
    this.onUp = (e) => {
      this.drag.isDown = false;
      try { element.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    element.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
  }

  onWheel(event) {
    if (!this.active) return;
    let pixelY = event.deltaY;
    if (event.deltaMode === 1) pixelY *= 16;
    else if (event.deltaMode === 2) pixelY *= window.innerHeight;
    this.scrollY.target += (pixelY * this.sizes.height) / window.innerHeight;
  }

  render(delta) {
    this.material.uniforms.uTime.value += delta * 0.015;
    this.drag.xCurrent += (this.drag.xTarget - this.drag.xCurrent) * 0.1;
    this.drag.yCurrent += (this.drag.yTarget - this.drag.yCurrent) * 0.1;
    this.material.uniforms.uDrag.value.set(this.drag.xCurrent, this.drag.yCurrent);
    this.scrollY.current += (this.scrollY.target - this.scrollY.current) * 0.12;
    this.material.uniforms.uScrollY.value = this.scrollY.current;
  }

  dispose() {
    this.active = false;
    window.removeEventListener('wheel', this.onWheelBound);
    if (this.dragElement) {
      this.dragElement.removeEventListener('pointerdown', this.onDown);
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerup', this.onUp);
    }
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
    this.coverTexture.dispose();
    this.blurryTexture.dispose();
    this.wrapperTexture.dispose();
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
      onSettled: () => this.handoffToRing(),
    });

    window.addEventListener('resize', this.onResize.bind(this));
    this.render();
  }

  /* 杂志段落结束：纸带收拢成一摞 → 交叉淡化 → 轮盘从中心扇出接棒 */
  handoffToRing() {
    const GATHER_MS = 1050;
    this.magazine.gather(GATHER_MS);
    this.ring = new CoverRing({ onOpen: (album) => this.openAlbum(album) });
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
  }

  /* 点开轮盘中间的专辑：进入播放器卡片场 */
  openAlbum(album) {
    if (this.field) return;
    // 开场的书页网格不再需要，让出画布
    if (this.magazine?.instancedMesh) {
      this.scene.remove(this.magazine.instancedMesh);
      this.magazine.instancedMesh = null;
    }
    this.field = new PlayerField({ scene: this.scene, sizes: this.sizes, album });
    this.field.bindDrag(this.element);

    const view = document.getElementById('album-view');
    view.querySelector('.av-title').textContent = album.name;
    view.querySelector('.av-meta').textContent = `IU · ${album.year}`;
    view.querySelector('.av-tracks').innerHTML =
      album.tracks.map((t) => `<li>${t}</li>`).join('');
    view.hidden = false;
    document.body.classList.add('field-on');

    if (this.stopped) { this.stopped = false; this.render(); }
  }

  closeAlbum() {
    if (!this.field) return;
    this.field.active = false;
    document.body.classList.remove('field-on');
    const view = document.getElementById('album-view');
    setTimeout(() => {
      view.hidden = true;
      this.field.dispose();
      this.field = null;
      this.stopped = true;               // 画布已淡出，停止排帧
    }, 1000);
  }

  render() {
    if (this.stopped) return;                 // 轮盘接管后不再排帧
    const now = performance.now();
    const delta = this.lastT ? Math.min(50, now - this.lastT) : 16;
    this.lastT = now;
    this.field?.render(delta);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }
}

/* ---------- 启动：先预加载封面（缺图跳过），再起 WebGL；失败退回封面墙 ---------- */

function showFallbackWall() {
  const fb = document.getElementById('fallback');
  fb.innerHTML = AVAILABLE.map((a) => `<img src="${a.src}" alt="${a.name}" loading="lazy" />`).join('');
  fb.hidden = false;
  document.body.style.overflow = 'auto';
}

preloadCovers().then(() => {
  if (!AVAILABLE.length) { showFallbackWall(); return; }   // 一张封面都没加载出来
  try {
    const canvas = new Canvas();
    document.getElementById('btn-ring-back').addEventListener('click', () => canvas.closeAlbum());
  } catch (err) {
    console.error('WebGL 初始化失败，退回封面墙：', err);
    showFallbackWall();
  }
});
