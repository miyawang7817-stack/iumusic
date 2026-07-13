/* IU Magazine —— WebGL 杂志首页
   移植自 J0SUKE/webgl-magazine（MIT 思路致敬）：
   26 页专辑封面像一本书一样旋开、摊平、散成一条无限纵深的纸带，
   滚轮 / 触摸滑动无限翻页，滚动速度让纸页产生波浪弯曲。
   零构建：three.js 使用本地 vendor 模块，GSAP/lenis 以少量原生代码替代。 */

import * as THREE from '../assets/vendor/three.module.min.js';

/* ---------- 页面素材：13 张专辑封面 ---------- */

const COVERS = [
  'growing-up.jpeg',            // Growing Up (2009)
  'last-fantasy.jpeg',          // Last Fantasy (2011)
  'spring-of-twenty.jpeg',      // 스무 살의 봄 (2012)
  'modern-times.jpeg',          // Modern Times (2013)
  'modern-times-epilogue.jpeg', // Modern Times – Epilogue (2013)
  'flower-bookmark.jpeg',       // 꽃갈피 (2014)
  'chat-shire.jpg',             // CHAT-SHIRE (2015)
  'flower-bookmark-2.jpeg',     // 꽃갈피 둘 (2017)
  'love-poem.jpeg',             // Love poem (2019)
  'celebrity.jpeg',             // Celebrity (2021)
  'lilac.jpeg',                 // LILAC (2021)
  'love-wins-all.jpeg',         // Love wins all (2024)
  'the-winning.jpeg',           // The Winning (2024)
].map((f) => 'assets/covers/' + f);

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
  constructor({ scene, sizes }) {
    this.scene = scene;
    this.sizes = sizes;

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
      u.uProgress.value = 1;
      u.uSplitProgress.value = 1;
      this.enableScroll();
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
  }

  onWheel(event) {
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
    if (!this.touch.isActive) return;
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

  render() {
    if (!this.material) return;
    this.scrollY.current = lerp(this.scrollY.current, this.scrollY.target, 0.12);
    this.material.uniforms.uScrollY.value = this.scrollY.current;
    this.material.uniforms.uSpeedY.value *= 0.835;    // 波浪随速度衰减回平
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
    this.magazine = new Magazine({ scene: this.scene, sizes: this.sizes });

    window.addEventListener('resize', this.onResize.bind(this));
    this.render();
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
