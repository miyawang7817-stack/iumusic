# 💜 IU Magazine

> IU 的 16 张专辑封面:开场像一本被风掀开的书,散落后聚成可旋转的封面轮盘

打开页面:封面逐页起转、全速旋转、堆叠成摞、散成纸带亮相,随即收拢、从纸堆中扇出成一个**塔罗式旋转轮盘**——中间一张大、两侧渐次侧立虚化,自动轮换(每张停留约 1.7 秒),支持拖拽(带惯性)、滚轮、方向键,底部跟随显示专辑名与年份。

开场着色器移植自 [J0SUKE/webgl-magazine](https://github.com/J0SUKE/webgl-magazine),整体为**零构建纯静态**实现:不需要 Node、不需要打包器,直接部署即可。

## 🚀 使用

```bash
# 本地预览(ES Module 需要 http 协议,不能直接双击 index.html)
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 部署

- **GitHub Pages**:push 到 main 后 `.github/workflows/pages.yml` 自动发布到 `gh-pages` 分支;Settings → Pages → Source 选 `gh-pages` / root
- **Vercel**:直接导入仓库即可(已带 `vercel.json`)

## 📁 项目结构

```
├── index.html                     # 页面入口(顶部/底部信息栏 + 全屏画布)
├── css/style.css                  # 覆层版式、轮盘样式、备用封面墙
├── js/magazine.js                 # 开场着色器动画 + 封面轮盘 + 交棒衔接
├── assets/covers/                 # 16 张专辑封面(2008 Lost and Found → 2024 The Winning)
└── assets/vendor/three.module.min.js   # three.js(本地 vendor,无 CDN 依赖)
```

## 🔧 技术说明

- **开场**:three.js InstancedMesh,所有页面动画在顶点着色器里按 `uProgress` 分段插值(逐页起转 → 全速旋转 → 减速堆叠 → 散开亮相),随后 `uSplitProgress` 倒放收拢
- **纹理图集**:封面在 Canvas 里居中裁切成 512×512 方格、竖排合成一张纹理,每页取自己的 UV 区间
- **轮盘**:DOM + CSS transform 的连续插值轨道(中间大 → 两侧侧立 → 纵深隐没),拖拽跟手、惯性渐停、空闲自动轮换;交棒时卡片从中心纸堆位置错峰扇出,与 WebGL 收拢动作交叉淡化
- **封面容错**:预加载时缺图自动跳过,新增专辑只需把图放进 `assets/covers/` 并在 `js/magazine.js` 的 `ALBUMS` 里加一行
- 尊重 `prefers-reduced-motion`(跳过开场直进轮盘);WebGL 不可用时退回静态封面墙

---

*A16 · 2008 → 2025 · dlwlrma*
