/* IU Magazine —— WebGL 首页
   开场（移植自 J0SUKE/webgl-magazine 的着色器）：专辑封面像一本书被风掀开、
   全速旋转、堆叠成摞、散成纸带亮相，随即收拢，交棒给 DOM 封面轮盘（塔罗式旋转）。
   零构建：three.js 使用本地 vendor 模块，补间用少量原生代码实现。 */

import * as THREE from '../assets/vendor/three.module.min.js';

/* ---------- 页面素材：13 张专辑封面 ---------- */

const ALBUMS = [
  { file: 'lost-and-found.png' ,        name: 'Lost and Found',          year: 2008,
    gallery: 'lost-and-found', galleryN: 6,
    tracks: ['미아 Lost Child', '가여워', '젖은 안경', '미운 오리', '기다려요', '미아 (Inst.)'] },
  { file: 'iu-im.png' ,                 name: 'IU…IM',                   year: 2009,
    gallery: 'iu-im', galleryN: 6,
    tracks: ['마쉬멜로우 Marshmallow', '바라보기', '졸업하는 날', '소나기', '마쉬멜로우 (Remix)', '마쉬멜로우 (Inst.)'] },
  { file: 'growing-up.jpeg',            name: 'Growing Up',              year: 2009,
    gallery: 'growing-up', galleryN: 14,
    tracks: ['Boo', '있잖아 Hey', '미아 (New Ver.)', '가여워', '아침 눈물', '졸업하는 날',
             '우연한 봄', '첫사랑', '소녀의 하루', '바람의 노래', '구두 우체통', '나 어떡해',
             'Boo (Remix)', '있잖아 (Inst.)'] },
  { file: 'real.png' ,                  name: 'Real',                    year: 2010,
    gallery: 'real', galleryN: 7,
    tracks: ['좋은 날 Good Day', '잔소리', '미리 메리 크리스마스', '첫 이별 그날 밤', '혼자 있는 방', '슬픈 미소', '좋은 날 (Inst.)'] },
  { file: 'last-fantasy.jpeg',          name: 'Last Fantasy',            year: 2011,
    gallery: 'last-fantasy', galleryN: 13,
    tracks: ['비밀 Secret', '잠자는 숲 속의 왕자', '너랑 나 You & I', '삼촌 Uncle', '사랑니', '벽지무늬',
             '라스트 판타지 Last Fantasy', '길 잃은 강아지', '라온제나', '4AM', '별처럼', '창가', '겨울 나무'] },
  { file: 'spring-of-twenty.jpeg',      name: '스무 살의 봄',              year: 2012,
    gallery: 'spring-of-twenty', galleryN: 3,
    tracks: ['복숭아 Peach', '하루 끝 Every End of the Day', '첫사랑이죠'] },
  { file: 'modern-times.jpeg',          name: 'Modern Times',            year: 2013,
    gallery: 'modern-times', galleryN: 13,
    tracks: ['을의 연애', '분홍신 The Red Shoes', 'Love of B', '우울시계', '싫은 날', '누구나 비밀은 있다',
             '입술 사이 (50cm)', '아이야 나랑 걷자', 'Havana', '한낮의 꿈', 'Modern Times', '기다려', '금요일에 만나요 Friday'] },
  { file: 'flower-bookmark.jpeg',       name: '꽃갈피',                    year: 2014,
    gallery: 'flower-bookmark', galleryN: 7,
    tracks: ['나의 옛날이야기', '너의 의미 The Meaning of You', '꽃', '삐에로는 우릴 보고 웃지',
             '사랑이 지나가면', '여름밤의 꿈', '꿍따리 샤바라'] },
  { file: 'chat-shire.jpg',             name: 'CHAT-SHIRE',              year: 2015,
    gallery: 'chat-shire', galleryN: 7,
    tracks: ['새 신발', 'Zezé', '스물셋 Twenty-three', '푸르던', 'Red Queen', '무릎 Knees', '안경'] },
  { file: 'palette.png' ,               name: 'Palette',                 year: 2017,
    gallery: 'palette', galleryN: 10,
    tracks: ['이 지금', '팔레트 Palette', '이런 엔딩', '잼잼', '밤편지 Through the Night',
             '그렇게 사랑은', '사랑이 잘', 'Black Out', '마침표', '이름에게'] },
  { file: 'flower-bookmark-2.jpeg',     name: '꽃갈피 둘',                 year: 2017,
    gallery: 'flower-bookmark-2', galleryN: 6,
    tracks: ['가을 아침 Autumn Morning', '비밀의 화원', '개여울', '어젯밤 이야기',
             '잠 못 드는 밤 비는 내리고', '매일 그대와'] },
  { file: 'love-poem.jpeg',             name: 'Love poem',               year: 2019,
    gallery: 'love-poem', galleryN: 6,
    tracks: ['unlucky', '그 사람', 'Blueming', '시간의 바깥', '자장가', 'Love poem'] },
  { file: 'lilac.jpeg',                 name: 'LILAC',                   year: 2021,
    gallery: 'lilac', galleryN: 10,
    tracks: ['라일락 LILAC', 'Flu', 'Coin', '봄 안녕 봄', 'Celebrity', '돌림노래',
             '빈 컵 Empty Cup', '아이와 나의 바다 My Sea', '어푸 Ah puh', '에필로그 Epilogue'] },
  { file: 'the-winning.jpeg',           name: 'The Winning',             year: 2024,
    gallery: 'the-winning', galleryN: 5,
    tracks: ['Love wins all', 'Shopper', '홀씨 Holssi', 'Shh..', '결국엔 너'] },
  { file: 'flower-bookmark-3.jpg',      name: '꽃갈피 셋',                 year: 2025,
    gallery: 'flower-bookmark-3', galleryN: 6,
    tracks: ['너에게로 또다시', '옛사랑', '가려진 시간 사이로', '사랑하기 때문에', '만남', '세월이 가면'] },
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

function gallerySrc(album, i) {
  return 'assets/covers/tracks/' + album.gallery + '/t' + String(i + 1).padStart(2, '0') + '.jpg';
}

const FOCUS = {"chat-shire/t01":[0.587,0.246],"chat-shire/t02":[0.705,0.593],"chat-shire/t03":[0.759,0.691],"chat-shire/t04":[0.764,0.134],"chat-shire/t05":[0.5,0.38],"chat-shire/t06":[0.412,0.32],"chat-shire/t07":[0.516,0.383],"flower-bookmark/t01":[0.289,0.165],"flower-bookmark/t02":[0.501,0.543],"flower-bookmark/t03":[0.5,0.38],"flower-bookmark/t04":[0.5,0.38],"flower-bookmark/t05":[0.37,0.918],"flower-bookmark/t06":[0.328,0.412],"flower-bookmark/t07":[0.141,0.376],"flower-bookmark-2/t01":[0.227,0.861],"flower-bookmark-2/t02":[0.5,0.38],"flower-bookmark-2/t03":[0.5,0.38],"flower-bookmark-2/t04":[0.735,0.234],"flower-bookmark-2/t05":[0.488,0.291],"flower-bookmark-2/t06":[0.416,0.388],"growing-up/t01":[0.383,0.362],"growing-up/t02":[0.524,0.827],"growing-up/t03":[0.5,0.38],"growing-up/t04":[0.507,0.308],"growing-up/t05":[0.506,0.313],"growing-up/t06":[0.501,0.329],"growing-up/t07":[0.409,0.394],"growing-up/t08":[0.434,0.384],"growing-up/t09":[0.5,0.38],"growing-up/t10":[0.512,0.417],"growing-up/t11":[0.381,0.094],"growing-up/t12":[0.545,0.243],"growing-up/t13":[0.442,0.152],"growing-up/t14":[0.383,0.514],"iu-im/t01":[0.386,0.447],"iu-im/t02":[0.549,0.212],"iu-im/t03":[0.492,0.162],"iu-im/t04":[0.53,0.152],"iu-im/t05":[0.437,0.364],"iu-im/t06":[0.5,0.38],"last-fantasy/t01":[0.665,0.206],"last-fantasy/t02":[0.5,0.38],"last-fantasy/t03":[0.661,0.32],"last-fantasy/t04":[0.543,0.383],"last-fantasy/t05":[0.614,0.303],"last-fantasy/t06":[0.342,0.334],"last-fantasy/t07":[0.606,0.487],"last-fantasy/t08":[0.424,0.14],"last-fantasy/t09":[0.43,0.218],"last-fantasy/t10":[0.555,0.28],"last-fantasy/t11":[0.491,0.382],"last-fantasy/t12":[0.367,0.344],"last-fantasy/t13":[0.195,0.837],"lilac/t01":[0.533,0.491],"lilac/t02":[0.848,0.078],"lilac/t03":[0.706,0.621],"lilac/t04":[0.837,0.628],"lilac/t05":[0.677,0.44],"lilac/t06":[0.545,0.498],"lilac/t07":[0.352,0.481],"lilac/t08":[0.582,0.509],"lilac/t09":[0.426,0.349],"lilac/t10":[0.483,0.379],"lost-and-found/t01":[0.502,0.361],"lost-and-found/t02":[0.44,0.237],"lost-and-found/t03":[0.5,0.38],"lost-and-found/t04":[0.5,0.38],"lost-and-found/t05":[0.809,0.655],"lost-and-found/t06":[0.551,0.311],"love-poem/t01":[0.659,0.233],"love-poem/t02":[0.476,0.405],"love-poem/t03":[0.602,0.361],"love-poem/t04":[0.5,0.38],"love-poem/t05":[0.338,0.235],"love-poem/t06":[0.482,0.265],"modern-times/t01":[0.666,0.28],"modern-times/t02":[0.504,0.198],"modern-times/t03":[0.495,0.518],"modern-times/t04":[0.507,0.244],"modern-times/t05":[0.529,0.291],"modern-times/t06":[0.51,0.271],"modern-times/t07":[0.48,0.266],"modern-times/t08":[0.524,0.161],"modern-times/t09":[0.531,0.223],"modern-times/t10":[0.572,0.307],"modern-times/t11":[0.545,0.384],"modern-times/t12":[0.5,0.38],"modern-times/t13":[0.492,0.337],"palette/t01":[0.547,0.435],"palette/t02":[0.262,0.676],"palette/t03":[0.5,0.38],"palette/t04":[0.292,0.518],"palette/t05":[0.337,0.061],"palette/t06":[0.648,0.531],"palette/t07":[0.775,0.71],"palette/t08":[0.514,0.788],"palette/t09":[0.707,0.573],"palette/t10":[0.5,0.38],"real/t01":[0.501,0.294],"real/t02":[0.284,0.249],"real/t03":[0.493,0.353],"real/t04":[0.805,0.536],"real/t05":[0.719,0.416],"real/t06":[0.5,0.38],"real/t07":[0.595,0.264],"spring-of-twenty/t01":[0.868,0.205],"spring-of-twenty/t02":[0.509,0.489],"spring-of-twenty/t03":[0.5,0.38],"the-winning/t01":[0.605,0.437],"the-winning/t02":[0.5,0.38],"the-winning/t03":[0.578,0.464],"the-winning/t04":[0.546,0.562],"the-winning/t05":[0.5,0.38],"flower-bookmark-3/t01":[0.435,0.316],"flower-bookmark-3/t02":[0.575,0.405],"flower-bookmark-3/t03":[0.23,0.205],"flower-bookmark-3/t04":[0.5,0.38],"flower-bookmark-3/t05":[0.757,0.432],"flower-bookmark-3/t06":[0.678,0.441]};

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 试听：iTunes Search 30 秒官方预览；拿不到则打开 YouTube 搜索 ---------- */

const player = { audio: new Audio(), title: null, cache: {} };
let activeField = null;          // 当前专辑的卡片场（用于同步卡面播放按钮）
player.audio.addEventListener('ended', () => {
  setNowPlaying(null);
  activeField?.setPlayingTitle(null);
});

function setNowPlaying(title, paused = false) {
  const bar = document.getElementById('now-playing');
  if (!title) { bar.hidden = true; player.title = null; return; }
  bar.hidden = false;
  document.getElementById('np-title').textContent = title;
  document.getElementById('np-toggle').textContent = paused ? '▶' : '⏸';
  document.querySelectorAll('.av-tracks li').forEach((li) =>
    li.classList.toggle('playing', li.textContent === title));
}

async function fetchPreview(title) {
  if (title in player.cache) return player.cache[title];
  const q = encodeURIComponent('IU ' + title.replace(/\(.*?\)/g, '').trim());
  const res = await fetch(`https://itunes.apple.com/search?term=${q}&media=music&limit=8&country=KR`);
  const data = await res.json();
  const hit = data.results.find((r) => /IU|아이유/i.test(r.artistName || '') && r.previewUrl)
           || data.results.find((r) => r.previewUrl);
  player.cache[title] = hit ? hit.previewUrl : null;
  return player.cache[title];
}

/* 本地音源优先：assets/audio/<专辑>/tNN.mp3|m4a|wav（个人使用，自行放置，不入公开仓库） */
async function tryLocalAudio(album, index) {
  if (album == null || index == null) return false;
  const nn = String(index + 1).padStart(2, '0');
  for (const ext of ['mp3', 'm4a', 'wav']) {
    try {
      player.audio.src = `assets/audio/${album.gallery || album.file.replace(/\.[^.]+$/, '')}/t${nn}.${ext}`;
      await player.audio.play();
      return true;
    } catch (_) { /* 下一个格式 */ }
  }
  return false;
}

function showNote(text) {
  const bar = document.getElementById('now-playing');
  bar.hidden = false;
  document.getElementById('np-toggle').style.display = 'none';
  document.getElementById('np-title').textContent = text;
  clearTimeout(showNote._t);
  showNote._t = setTimeout(() => {
    if (!player.title) bar.hidden = true;
    document.getElementById('np-toggle').style.display = '';
  }, 4000);
}

async function playTrack(title, album, index) {
  if (player.title === title) {              // 再点同一首：暂停/继续
    if (player.audio.paused) {
      player.audio.play().catch(() => {});
      setNowPlaying(title, false);
      activeField?.setPlayingTitle(title, false);
    } else {
      player.audio.pause();
      setNowPlaying(title, true);
      activeField?.setPlayingTitle(title, true);
    }
    return;
  }
  // 1) 本地音源
  if (await tryLocalAudio(album, index)) {
    player.title = title;
    setNowPlaying(title);
    activeField?.setPlayingTitle(title, false);
    return;
  }
  // 2) iTunes 30 秒官方试听
  try {
    const url = await fetchPreview(title);
    if (!url) throw new Error('no preview');
    player.audio.src = url;
    await player.audio.play();
    player.title = title;
    setNowPlaying(title);
    activeField?.setPlayingTitle(title, false);
  } catch (_) {
    // 3) 都不行：只提示，不跳转（artifact 预览环境禁外联，属预期）
    showNote('此预览环境无法出声 — 部署后点击即可播放');
  }
}

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
    window.__RING = this;             // 调试/测试用
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
      if (this.gestureActive) {                 // 手势接管：跳过全部自动/惯性/吸附，只排布
        if (this.dirty) { this.dirty = false; this.layout(); }
        this.loop = requestAnimationFrame(frame);
        return;
      }
      if (this.inertia && dt) {
        this.rot += this.vel * dt;
        this.vel *= Math.exp(-dt / this.FRICTION);
        this.dirty = true;
        if (Math.abs(this.vel) < 0.0004) {
          this.inertia = false;
          this.animateRotTo(Math.round(this.rot), 360);
        }
      } else if (!REDUCED_MOTION) {
        const idle = !this.dragging && !this.snapping && !this.inertia && !this.gestureActive
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

/* ---------- 摄像头手势控制（可选）：挥手转轮盘/平移，捏合(拇指+食指)选中 ----------
   手部识别用 MediaPipe Hands，模型与 wasm 全部自托管于 assets/vendor/mediapipe-hands/ */

const gesture = {
  on: false, loading: false, video: null, hands: null,
  hand: null,               // 最新识别：{x, y, pinchRatio, t}（归一化到屏幕像素）
  dotX: 0, dotY: 0, prevDotX: 0, prevDotY: 0, dotInit: false,
  pinch: false, dwell: 0, dwellFired: false,
  detTimer: null, ctrlLoop: null, tPrev: 0,
};

/* 识别回调只做一件事：记录最新手位。控制在独立的 60fps 循环里做，二者解耦 */
function onHandResults(res) {
  // 识别帧率统计（诊断用，显示在 GESTURE 按钮上）
  const t = performance.now();
  gesture.fpsCount = (gesture.fpsCount || 0) + 1;
  if (!gesture.fpsStamp) gesture.fpsStamp = t;
  if (t - gesture.fpsStamp >= 1000) {
    gesture.fps = gesture.fpsCount;
    gesture.fpsCount = 0;
    gesture.fpsStamp = t;
    const label = document.querySelector('#btn-gesture span');
    if (label && gesture.on) label.textContent = `GESTURE ${gesture.fps}FPS`;
  }
  const lm = res.multiHandLandmarks && res.multiHandLandmarks[0];
  if (!lm) { gesture.hand = null; return; }
  const palm = lm[9];
  const handSize = Math.hypot(lm[0].x - lm[9].x, lm[0].y - lm[9].y) || 1e-6;
  gesture.hand = {
    x: palm.x * window.innerWidth,
    y: palm.y * window.innerHeight,
    pinchRatio: Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y) / handSize,
    t: performance.now(),
  };
}

/* 中心目标是否可选 / 选中它（轮盘=中间专辑，专辑页=屏幕中心最近卡） */
function centerTarget() {
  if (document.body.classList.contains('field-on') && activeField) return activeField.centerCell() != null;
  if (document.body.classList.contains('ring-on') && window.__RING) return true;
  return false;
}
function selectCenter() {
  if (document.body.classList.contains('field-on') && activeField) {
    const cell = activeField.centerCell();
    if (cell != null) playTrack(activeField.album.tracks[cell % activeField.album.tracks.length], activeField.album, cell);
  } else if (document.body.classList.contains('ring-on') && window.__RING) {
    const r = window.__RING, n = r.cards.length;
    if (r.onOpen) r.onOpen(r.cards[((Math.round(r.rot) % n) + n) % n].album);
  }
}

/* 摇杆控制循环（60fps，与识别帧率无关）：手离屏幕中心的偏移 → 连续速度 */
function gestureControlLoop() {
  if (!gesture.on) { gesture.ctrlLoop = null; return; }
  gesture.ctrlLoop = requestAnimationFrame(gestureControlLoop);

  const now = performance.now();
  const dt = gesture.tPrev ? Math.min(0.05, (now - gesture.tPrev) / 1000) : 0.016;
  gesture.tPrev = now;

  const dot = document.getElementById('gesture-dot');
  const h = gesture.hand;
  const fresh = h && (now - h.t) < 400;
  if (!fresh) {
    if (dot) dot.hidden = true;
    gesture.dwell = 0;
    gesture.dotInit = false;
    gesture.anchor = null;                                    // 手离开：清锚点，下次重新锚定
    if (window.__RING) window.__RING.gestureActive = false;   // 恢复自动轮换
    return;
  }

  // 光点平滑跟随（轻微 EMA，低延迟）
  if (!gesture.dotInit) {
    gesture.dotX = h.x; gesture.dotY = h.y;
    gesture.prevDotX = h.x; gesture.prevDotY = h.y;   // 重捕捉时不产生跳变位移
    gesture.dotInit = true;
  }
  gesture.dotX += (h.x - gesture.dotX) * 0.5;
  gesture.dotY += (h.y - gesture.dotY) * 0.5;

  // 有新鲜手就立刻接管轮盘（在任何 dwell/移动判定之前），彻底断开自动轮换
  if (window.__RING && !window.__RING.gestureActive) {
    window.__RING.gestureActive = true;
    cancelAnimationFrame(window.__RING.anim);
    window.__RING.snapping = false;
    window.__RING.inertia = false;
  }

  const pinching = h.pinchRatio < (gesture.pinch ? 0.6 : 0.42);
  gesture.pinch = pinching;
  if (dot) {
    dot.hidden = false;
    dot.style.transform = `translate(${(gesture.dotX - 13).toFixed(1)}px, ${(gesture.dotY - 13).toFixed(1)}px)`;
    dot.classList.toggle('pinch', pinching);
  }

  // 绝对锚定：手出现的那一刻记录锚点，此后场景位置 = f(手相对锚点的位移)。
  // 像捏着实体旋钮——不累积误差，掉帧/抖动都不会漂。
  if (!gesture.anchor) {
    gesture.anchor = {
      x: gesture.dotX, y: gesture.dotY,
      rot: window.__RING ? window.__RING.rot : 0,
      dragX: activeField ? activeField.drag.xTarget : 0,
      scroll: activeField ? activeField.scrollY.target : 0,
    };
    gesture.moveStamp = now;
  }
  const offX = gesture.dotX - gesture.anchor.x;
  const offY = gesture.dotY - gesture.anchor.y;

  // 静止检测（用于吸附与选中）
  let ddx = gesture.dotX - gesture.prevDotX;
  let ddy = gesture.dotY - gesture.prevDotY;
  gesture.prevDotX = gesture.dotX;
  gesture.prevDotY = gesture.dotY;
  if (Math.hypot(ddx, ddy) > 0.8) gesture.moveStamp = now;
  const restedMs = now - (gesture.moveStamp || 0);
  const still = restedMs > 120;

  // 选中：光点移到画面中央、停住 0.8 秒（捏合立即）；停在别处只是停
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const nearCenter = Math.hypot(gesture.dotX - cx, gesture.dotY - cy) < Math.min(window.innerWidth, window.innerHeight) * 0.16;
  if (gesture.dwellFired) {
    if (!still && !pinching) gesture.dwellFired = false;
    gesture.dwell = 0;
  } else if ((pinching || (still && nearCenter)) && centerTarget()) {
    gesture.dwell += dt * 1000;
    if (pinching || gesture.dwell >= 800) { selectCenter(); gesture.dwellFired = true; gesture.dwell = 0; }
  } else {
    gesture.dwell = 0;
  }
  if (dot) dot.style.setProperty('--dwell', Math.min(1, gesture.dwell / 800).toFixed(2));

  // 绝对映射施加位置
  if (document.body.classList.contains('field-on') && activeField) {
    activeField.drag.xTarget = gesture.anchor.dragX + -offX * (activeField.sizes.width / window.innerWidth) * 2.2;
    activeField.scrollY.target = gesture.anchor.scroll + -offY * (activeField.sizes.height / window.innerHeight) * 4.2;
  } else if (document.body.classList.contains('ring-on') && window.__RING) {
    const r = window.__RING;
    r.rot = gesture.anchor.rot + -offX / r.geom.pxPerStep * 1.6;
    if (still && restedMs > 350) {
      // 真正静止后向最近专辑吸附：移动锚点而不是直接改 rot，与绝对映射不冲突
      gesture.anchor.rot += (Math.round(r.rot) - r.rot) * 0.25;
    }
    r.dirty = true;
  }
}

async function toggleGesture() {
  const btn = document.getElementById('btn-gesture');
  if (gesture.on) {                      // 关闭
    gesture.on = false;
    clearInterval(gesture.detTimer);
    cancelAnimationFrame(gesture.ctrlLoop);
    gesture.ctrlLoop = null;
    gesture.hand = null;
    gesture.dotInit = false;
    gesture.anchor = null;
    if (window.__RING) window.__RING.gestureActive = false;
    btn.classList.remove('on');
    const label = document.querySelector('#btn-gesture span');
    if (label) label.textContent = 'GESTURE';
    gesture.video?.srcObject?.getTracks().forEach((t) => t.stop());
    document.getElementById('gesture-dot').hidden = true;
    return;
  }
  if (gesture.loading) return;
  gesture.loading = true;
  btn.classList.add('loading');
  try {
    if (!window.Hands) {
      await new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'assets/vendor/mediapipe-hands/hands.js';
        sc.onload = res; sc.onerror = rej;
        document.head.appendChild(sc);
      });
    }
    const video = document.getElementById('gesture-cam');
    video.setAttribute('autoplay', '');

    // 等真正出画面（虚拟摄像头/被占用的设备会拿到流但没有帧）
    const firstFrame = (ms) => new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new DOMException('no frames', 'NoFramesError')), ms);
      const ok = () => { clearTimeout(to); resolve(); };
      if ('requestVideoFrameCallback' in video) video.requestVideoFrameCallback(ok);
      else {
        const iv = setInterval(() => {
          if (video.videoWidth > 0 && video.currentTime > 0) { clearInterval(iv); ok(); }
        }, 120);
      }
    });
    const tryStream = async (constraints) => {
      let stream;
      try { stream = await navigator.mediaDevices.getUserMedia(constraints); } catch (_) { return false; }
      video.srcObject = stream;
      try { await video.play(); await firstFrame(3500); return true; }
      catch (_) {
        stream.getTracks().forEach((t) => t.stop());
        video.srcObject = null;
        return false;
      }
    };

    // 1) 先试默认摄像头；2) 没画面则枚举全部设备，优先真实摄像头（跳过 Virtual/OBS 等虚拟设备）
    let opened = await tryStream({ video: { width: 640, height: 360, facingMode: 'user' } });
    const tried = [];
    if (!opened) {
      const devs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput');
      const isVirtual = (d) => /virtual|obs|snap ?camera|droidcam|iriun|ndi|unity/i.test(d.label);
      devs.sort((a, b) => isVirtual(a) - isVirtual(b));
      for (const d of devs) {
        tried.push(d.label || '(未命名摄像头)');
        opened = await tryStream({ video: { deviceId: { exact: d.deviceId } } });
        if (opened) break;
      }
    }
    if (!opened) {
      console.warn('尝试过的摄像头（均无画面）：', tried);
      const err = new DOMException('no frames', 'NoFramesError');
      err.tried = tried;
      throw err;
    }

    if (!gesture.hands) {
      gesture.hands = new window.Hands({ locateFile: (f) => 'assets/vendor/mediapipe-hands/' + f });
      gesture.hands.setOptions({ maxNumHands: 1, modelComplexity: 0, selfieMode: true,
                                 minDetectionConfidence: 0.6, minTrackingConfidence: 0.5 });
      gesture.hands.onResults(onHandResults);
      await gesture.hands.initialize();      // 等 wasm/模型就绪，避免边加载边送帧导致闪烁
    }
    gesture.video = video;
    gesture.on = true;
    btn.classList.remove('loading');
    btn.classList.add('on');
    showNote('手势已开启：移动手 = 转动/平移，上抬手 = 向前飞，手移到中央停住 = 选中');
    gesture.tPrev = 0;
    gesture.dotInit = false;
    gesture.dwell = 0;
    gesture.dwellFired = false;
    // 识别限速在独立定时器里跑（不占用渲染帧），控制单独 60fps
    let sending = false, fails = 0;
    gesture.detTimer = setInterval(() => {
      if (!gesture.on) { clearInterval(gesture.detTimer); return; }
      if (sending || video.readyState < 2) return;
      sending = true;
      gesture.hands.send({ image: video })
        .then(() => { fails = 0; })
        .catch(() => {
          if (++fails > 40) { toggleGesture(); showNote('手势识别失败，请刷新页面后重试'); }
        })
        .finally(() => { sending = false; });
    }, 70);
    gesture.ctrlLoop = requestAnimationFrame(gestureControlLoop);
  } catch (err) {
    console.error('手势启动失败：', err);
    const video = document.getElementById('gesture-cam');
    video.srcObject?.getTracks().forEach((t) => t.stop());   // 清理半开状态
    video.srcObject = null;
    video.hidden = true;
    btn.classList.remove('loading', 'on');
    gesture.on = false;
    gesture.loading = false;
    const msg = {
      NotAllowedError: '摄像头权限被拒绝 — 点地址栏右侧的相机图标允许后重试',
      NotReadableError: '摄像头被其他应用占用（微信/会议/OBS 等）— 关闭它们后重试',
      AbortError: '摄像头启动被中断 — 关闭占用相机的应用后重试',
      NoFramesError: `全部 ${err.tried?.length ?? ''} 个摄像头均无画面 — 请检查联想的相机隐私开关（F8 键/镜头滑盖/Lenovo Vantage）`,
      NotFoundError: '未检测到摄像头设备',
    }[err.name] || '无法启用摄像头（此环境可能不支持）';
    showNote(msg);
    return;
  }
  gesture.loading = false;
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

/* 程序化绘制播放器卡片图集：每首歌一格（歌名/进度/时长各不相同）。
   卡体 #161616（b>0.02），封面挖孔纯黑（b<0.02 触发着色器采样封面） */
function drawPlayerCards(tracks, playingIdx = -1) {
  const n = Math.max(1, tracks.length);
  const c = document.createElement('canvas');
  c.width = CARD_W; c.height = CARD_H * n;
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
  const fmt = (sec) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

  tracks.forEach((track, i) => {
    const hasTitle = track != null;
    ctx.save();
    ctx.translate(0, CARD_H * i);
    // 卡体 + 顶部提手
    rr(0, 0, CARD_W, CARD_H, 52); ctx.fillStyle = '#161616'; ctx.fill();
    rr(CARD_W / 2 - 70, 20, 140, 10, 5); ctx.fillStyle = '#e8e8e8'; ctx.fill();
    // 封面挖孔（纯黑 = 着色器里替换成封面）
    rr(HOLE.x, HOLE.y, HOLE.size, HOLE.size, 28); ctx.fillStyle = '#000'; ctx.fill();
    // 歌名（每格不同；无对应曲名时留白）
    if (hasTitle) {
      ctx.fillStyle = '#f2f2f2'; ctx.font = '600 30px sans-serif'; ctx.textAlign = 'left';
      let title = track;
      while (ctx.measureText(title).width > 500 && title.length > 2) title = title.slice(0, -2);
      if (title !== track) title += '…';
      ctx.fillText(title, 38, 706);
    }
    // 进度条：进度与时长按曲目序号确定性变化
    const total = 172 + ((i * 47) % 118);            // 2:52 ~ 4:50
    const frac = 0.12 + ((i * 149) % 60) / 100;      // 12% ~ 71%
    rr(38, 742, 564, 6, 3); ctx.fillStyle = '#4d4d4d'; ctx.fill();
    rr(38, 742, Math.round(564 * frac), 6, 3); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.fillStyle = '#c9c9c9'; ctx.font = '26px sans-serif';
    ctx.textAlign = 'left';  ctx.fillText(fmt(total * frac), 38, 798);
    ctx.textAlign = 'right'; ctx.fillText('-' + fmt(total * (1 - frac)), 602, 798);
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
    tri(172, cy, 26, 1); tri(214, cy, 26, 1);            // ⏮
    if (i === playingIdx) {                              // 播放中 → ⏸
      rr(296, cy - 36, 18, 72, 6); ctx.fill();
      rr(330, cy - 36, 18, 72, 6); ctx.fill();
    } else {                                             // 默认 → ▶
      ctx.beginPath();
      ctx.moveTo(298, cy - 36);
      ctx.lineTo(298, cy + 36);
      ctx.lineTo(360, cy);
      ctx.closePath(); ctx.fill();
    }
    tri(468, cy, 26, -1); tri(426, cy, 26, -1);          // ⏭
    // 音量条
    ctx.fillStyle = '#4d4d4d'; rr(120, 1004, 400, 5, 2.5); ctx.fill();
    ctx.beginPath(); ctx.moveTo(78, 1006); ctx.lineTo(98, 992); ctx.lineTo(98, 1020); ctx.closePath();
    ctx.fillStyle = '#c9c9c9'; ctx.fill();
    ctx.beginPath(); ctx.arc(368, 1006, 15, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.restore();
  });
  return { canvas: c, count: n };
}

const fieldVertexShader = /* glsl */ `
attribute vec3 aInitialPosition;
attribute float aMeshSpeed;
attribute float aCell;
varying float vCell;

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
    vCell = aCell;
}
`;

const fieldFragmentShader = /* glsl */ `
varying vec2 vUv;
varying float vVisibility;
varying float vCell;

uniform sampler2D uWrapper;
uniform sampler2D uCover;
uniform sampler2D uBlurry;
uniform float uCells;

void main()
{
    vec2 wrapperUV = vec2(vUv.x, (uCells - 1. - vCell + vUv.y) / uCells);
    vec4 texel = texture2D(uWrapper, wrapperUV);
    if (texel.a < 0.01) discard;

    vec2 artUV = vec2(
        (vUv.x - ${HOLE_UV.u0.toFixed(5)}) / ${HOLE_UV.w.toFixed(5)},
        (vUv.y - ${HOLE_UV.v0.toFixed(5)}) / ${HOLE_UV.h.toFixed(5)}
    );
    artUV = clamp(artUV, 0., 1.);
    vec2 artAtlasUV = vec2(artUV.x, (uCells - 1. - vCell + artUV.y) / uCells);

    vec4 color = texel.b < 0.02
        ? texture2D(uCover, artAtlasUV)                  // 挖孔区：该格的歌曲照片/封面
        : texel + texture2D(uBlurry, artAtlasUV) * 0.8;  // 卡体：叠加对应图的模糊光晕

    color.a *= vVisibility;
    color.rgb = min(color.rgb, vec3(1.));
    gl_FragColor = color;
}
`;

class PlayerField {
  constructor({ scene, sizes, album, gallery = [], camera, onPlay }) {
    this.gallery = gallery;
    this.camera = camera;
    this.onPlay = onPlay;
    this.album = album;
    this.scene = scene;
    this.sizes = sizes;
    this.active = true;
    this.meshCount = 70;
    this.maxDisp = { x: sizes.width * 2.4, y: sizes.height * 2.4 };
    this.drag = { xCurrent: 0, xTarget: 0, yCurrent: 0, yTarget: 0, isDown: false, lastX: 0, lastY: 0 };
    this.scrollY = { target: 0, current: 0 };

    this.geometry = new THREE.PlaneGeometry(2, 2 * (CARD_H / CARD_W), 1, 1);
    this.createTextures(album);
    this.createMaterial();
    this.createMesh();

    this.onWheelBound = this.onWheel.bind(this);
    window.addEventListener('wheel', this.onWheelBound, { passive: true });
  }

  /* 每格一张图：歌曲照片（无照片集则用专辑封面），居中裁方 + 逐格模糊光晕 */
  createTextures(album) {
    const CELL = 512;
    const arts = this.gallery.length ? this.gallery : [album.img];
    const tracks = album.tracks || [''];
    // 卡格数：有照片集按照片数；否则按曲目数
    const n = this.gallery.length ? arts.length : Math.max(1, tracks.length);
    // 歌名：数量对得上才逐格印（照片集与曲目数不一致时留白，避免张冠李戴）
    const titles = Array.from({ length: n }, (_, i) =>
      (this.gallery.length && arts.length !== tracks.length)
        ? 'Track ' + String(i + 1).padStart(2, '0')
        : tracks[i % tracks.length]
    );

    const crop = (img) => {
      const c = document.createElement('canvas');
      c.width = c.height = CELL;
      const side = Math.min(img.width, img.height);
      // 以检测到的人脸为裁剪中心（FOCUS 由 OpenCV 预扫描生成），保证脸不被切
      const [fx, fy] = (img.__key && FOCUS[img.__key]) || [0.5, 0.45];
      const sx = Math.min(Math.max(fx * img.width - side / 2, 0), img.width - side);
      const sy = Math.min(Math.max(fy * img.height - side / 2, 0), img.height - side);
      c.getContext('2d').drawImage(img, sx, sy, side, side, 0, 0, CELL, CELL);
      return c;
    };

    const cover = document.createElement('canvas');
    cover.width = CELL; cover.height = CELL * n;
    const cctx = cover.getContext('2d');
    const blurry = document.createElement('canvas');
    blurry.width = CELL; blurry.height = CELL * n;
    const bctx = blurry.getContext('2d');
    for (let i = 0; i < n; i++) {
      const cell = crop(arts[i % arts.length]);
      cctx.drawImage(cell, 0, i * CELL);
      bctx.save();
      bctx.beginPath(); bctx.rect(0, i * CELL, CELL, CELL); bctx.clip();   // 防止模糊渗到相邻格
      bctx.filter = 'blur(60px)';
      bctx.drawImage(cell, 0, i * CELL);
      bctx.restore();
    }
    this.coverTexture = new THREE.Texture(cover);
    this.coverTexture.colorSpace = THREE.SRGBColorSpace;
    this.coverTexture.needsUpdate = true;
    this.blurryTexture = new THREE.Texture(blurry);
    this.blurryTexture.needsUpdate = true;

    this.titles = titles;
    const wrapper = drawPlayerCards(titles);
    this.cellCount = wrapper.count;
    this.wrapperTexture = new THREE.Texture(wrapper.canvas);
    this.wrapperTexture.needsUpdate = true;
  }

  /* 播放状态变化时重绘卡面：播放中的那首显示 ⏸，其余 ▶ */
  setPlayingTitle(title, paused = false) {
    const idx = (!title || paused) ? -1 : this.titles.indexOf(title);
    this.wrapperTexture.image = drawPlayerCards(this.titles, idx).canvas;
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
        uCells: { value: this.cellCount },
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
    const cell = new Float32Array(this.meshCount);
    for (let i = 0; i < this.meshCount; i++) {
      initialPosition[i * 3 + 0] = (Math.random() - 0.5) * this.maxDisp.x * 2;
      initialPosition[i * 3 + 1] = (Math.random() - 0.5) * this.maxDisp.y * 2;
      initialPosition[i * 3 + 2] = Math.random() * (7 - -30) - 30;
      meshSpeed[i] = Math.random() * 0.5 + 0.5;
      cell[i] = i % this.cellCount;                  // 每张卡对应专辑里的一首歌
    }
    this.geometry.setAttribute('aInitialPosition', new THREE.InstancedBufferAttribute(initialPosition, 3));
    this.geometry.setAttribute('aMeshSpeed', new THREE.InstancedBufferAttribute(meshSpeed, 1));
    this.geometry.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 1));
    this.scene.add(this.mesh);
  }

  bindDrag(element) {
    this.dragElement = element;
    let downX = 0, downY = 0, moved = 0;
    this.onDown = (e) => {
      this.drag.isDown = true;
      this.drag.lastX = downX = e.clientX;
      this.drag.lastY = downY = e.clientY;
      moved = 0;
      element.setPointerCapture(e.pointerId);
    };
    this.onTapUp = (e) => {
      moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      if (moved < 8 && this.active) {
        const cell = this.pickCell(e.clientX, e.clientY);
        if (cell != null && this.onPlay) this.onPlay(this.album.tracks[cell % this.album.tracks.length]);
      }
    };
    element.addEventListener('pointerup', this.onTapUp);
    this.onMove = (e) => {
      if (!this.drag.isDown || !this.active) return;
      moved = Math.max(moved, Math.hypot(e.clientX - downX, e.clientY - downY));
      const dx = e.clientX - this.drag.lastX;
      const dy = e.clientY - this.drag.lastY;
      this.drag.lastX = e.clientX;
      this.drag.lastY = e.clientY;
      this.drag.xTarget += -dx * (this.sizes.width / window.innerWidth);
      if (e.pointerType === 'touch') {
        // 触屏：竖划 = 向纵深飞行（手机没有滚轮）
        this.scrollY.target += dy * (this.sizes.height / window.innerHeight) * 2.2;
      } else {
        this.drag.yTarget += dy * (this.sizes.height / window.innerHeight);
      }
    };
    this.onUp = (e) => {
      this.drag.isDown = false;
      try { element.releasePointerCapture(e.pointerId); } catch (_) {}
    };
    element.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
  }

  /* 复算着色器位移，把每张卡中心投影到屏幕，找点击点附近最靠前的卡 */
  pickCell(clientX, clientY) {
    const attr = this.geometry.getAttribute('aInitialPosition');
    const spd = this.geometry.getAttribute('aMeshSpeed');
    const u = this.material.uniforms;
    const wrap = (a, m) => ((a % m) + m) % m;
    let best = null, bestZ = -Infinity;
    const v = new THREE.Vector3();
    const hw = 1, hh = CARD_H / CARD_W;                      // 卡片半宽/半高（世界单位）
    for (let i = 0; i < this.meshCount; i++) {
      const ix = attr.getX(i), iy = attr.getY(i), iz = attr.getZ(i);
      const maxXo = Math.abs(ix - this.maxDisp.x), minXo = Math.abs(ix + this.maxDisp.x);
      const maxYo = Math.abs(iy - this.maxDisp.y), minYo = Math.abs(iy + this.maxDisp.y);
      const maxZo = Math.abs(iz - 12), minZo = Math.abs(iz + 30);
      const x = ix + wrap(minXo - u.uDrag.value.x + u.uTime.value * spd.getX(i), maxXo + minXo) - minXo;
      const y = iy + wrap(minYo - u.uDrag.value.y, maxYo + minYo) - minYo;
      const z = iz + wrap(u.uScrollY.value + minZo, maxZo + minZo) - minZo;
      if (z > 5.2 || z < -26) continue;                      // 贴脸/太远的不算
      v.set(x, y, z).project(this.camera);
      if (v.z > 1) continue;
      const sx = (v.x + 1) / 2 * window.innerWidth;
      const sy = (1 - v.y) / 2 * window.innerHeight;
      // 卡片在屏幕上的真实半宽/半高（投影角点求得）
      v.set(x + hw, y + hh, z).project(this.camera);
      const rw = Math.abs((v.x + 1) / 2 * window.innerWidth - sx);
      const rh = Math.abs((1 - v.y) / 2 * window.innerHeight - sy);
      if (Math.abs(clientX - sx) < rw && Math.abs(clientY - sy) < rh && z > bestZ) {
        bestZ = z; best = i;
      }
    }
    return best == null ? null : best % this.cellCount;
  }

  /* 屏幕中心最靠前的一张卡（手势选中用，不要求落在卡矩形内） */
  centerCell() {
    const attr = this.geometry.getAttribute('aInitialPosition');
    const spd = this.geometry.getAttribute('aMeshSpeed');
    const u = this.material.uniforms;
    const wrap = (a, m) => ((a % m) + m) % m;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let best = null, bestScore = Infinity;
    const v = new THREE.Vector3();
    for (let i = 0; i < this.meshCount; i++) {
      const ix = attr.getX(i), iy = attr.getY(i), iz = attr.getZ(i);
      const maxXo = Math.abs(ix - this.maxDisp.x), minXo = Math.abs(ix + this.maxDisp.x);
      const maxYo = Math.abs(iy - this.maxDisp.y), minYo = Math.abs(iy + this.maxDisp.y);
      const maxZo = Math.abs(iz - 12), minZo = Math.abs(iz + 30);
      const x = ix + wrap(minXo - u.uDrag.value.x + u.uTime.value * spd.getX(i), maxXo + minXo) - minXo;
      const y = iy + wrap(minYo - u.uDrag.value.y, maxYo + minYo) - minYo;
      const z = iz + wrap(u.uScrollY.value + minZo, maxZo + minZo) - minZo;
      if (z > 4 || z < -18) continue;
      v.set(x, y, z).project(this.camera);
      if (v.z > 1) continue;
      const sx = (v.x + 1) / 2 * window.innerWidth;
      const sy = (1 - v.y) / 2 * window.innerHeight;
      const score = Math.hypot(sx - cx, sy - cy) - z * 40;   // 离中心近、且靠前者优先
      if (score < bestScore) { bestScore = score; best = i; }
    }
    return best == null ? null : best % this.cellCount;
  }

  onWheel(event) {
    if (!this.active) return;
    let pixelY = event.deltaY;
    if (event.deltaMode === 1) pixelY *= 16;
    else if (event.deltaMode === 2) pixelY *= window.innerHeight;
    this.scrollY.target += (pixelY * this.sizes.height) / window.innerHeight;
  }

  render(delta) {
    const nd = delta / (1000 / 60);          // 毫秒 → 归一化帧（60fps ≈ 1.0）
    this.material.uniforms.uTime.value += nd * 0.015;
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
      this.dragElement.removeEventListener('pointerup', this.onTapUp);
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

  /* 点开轮盘中间的专辑：先加载歌曲照片集（若有），再进入播放器卡片场 */
  openAlbum(album) {
    if (this.field || this.loadingField) return;
    this.loadingField = true;
    const urls = Array.from({ length: album.galleryN || 0 }, (_, i) => gallerySrc(album, i));
    Promise.all(urls.map((u, i) => new Promise((res) => {
      const im = new Image();
      im.__key = album.gallery + '/t' + String(i + 1).padStart(2, '0');
      im.onload = () => res(im);
      im.onerror = () => res(null);       // 缺图跳过
      im.src = u;
    }))).then((imgs) => {
      this.loadingField = false;
      this.startField(album, imgs.filter(Boolean));
    });
  }

  startField(album, gallery) {
    if (this.field) return;
    // 开场的书页网格不再需要，让出画布
    if (this.magazine?.instancedMesh) {
      this.scene.remove(this.magazine.instancedMesh);
      this.magazine.instancedMesh = null;
    }
    this.field = new PlayerField({
      scene: this.scene, sizes: this.sizes, album, gallery,
      camera: this.camera, onPlay: (t) => playTrack(t, album, album.tracks.indexOf(t)),
    });
    activeField = this.field;
    window.__FIELD = this.field;      // 调试/测试用
    this.field.bindDrag(this.element);

    const view = document.getElementById('album-view');
    view.querySelector('.av-title').textContent = album.name;
    view.querySelector('.av-meta').textContent = `IU · ${album.year}`;
    const trackList = view.querySelector('.av-tracks');
    trackList.innerHTML = album.tracks.map((t) => `<li>${t}</li>`).join('');
    trackList.classList.toggle('two-col', album.tracks.length > 6);
    trackList.onclick = (e) => {
      const li = e.target.closest('li');
      if (li) playTrack(li.textContent, album, [...trackList.children].indexOf(li));
    };
    view.hidden = false;
    document.body.classList.add('field-on');

    if (this.stopped) { this.stopped = false; this.render(); }
  }

  closeAlbum() {
    if (!this.field) return;
    player.audio.pause();
    player.title = null;
    setNowPlaying(null);
    activeField = null;
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
    document.getElementById('np-toggle').addEventListener('click', () => player.title && playTrack(player.title));
    document.getElementById('btn-gesture').addEventListener('click', toggleGesture);
  } catch (err) {
    console.error('WebGL 初始化失败，退回封面墙：', err);
    showFallbackWall();
  }
});
