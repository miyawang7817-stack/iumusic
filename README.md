# 💜 IU Magazine

> IU 的专辑封面，做成一本可以无限翻的 WebGL 杂志

打开页面，13 张专辑封面像一本书被风快速掀开，摊平、散成一条伸向纵深的纸带；滚动鼠标滚轮（或在手机上横向滑动）即可无限翻阅，滚得越快，纸页弯出的波浪越大。

视觉交互参照 [J0SUKE/webgl-magazine](https://github.com/J0SUKE/webgl-magazine)，并改造为**零构建纯静态**实现：不需要 Node、不需要打包器，直接部署即可。

## 🚀 使用

```bash
# 本地预览（ES Module 需要 http 协议，不能直接双击 index.html）
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 部署

- **GitHub Pages**：仓库 Settings → Pages → Source 选择分支根目录（仓库已带 `.github/workflows/pages.yml`，push 到 main 自动发布）
- **Vercel**：直接导入仓库即可（已带 `vercel.json`）

## 📁 项目结构

```
├── index.html                     # 页面入口（顶部/底部信息栏 + 全屏画布）
├── css/style.css                  # 覆层版式与备用封面墙样式
├── js/magazine.js                 # WebGL 杂志：图集、着色器、开场动画、无限滚动
├── assets/covers/                 # 13 张专辑封面（2009 Growing Up → 2024 The Winning）
└── assets/vendor/three.module.min.js   # three.js（本地 vendor，无 CDN 依赖）
```

## 🔧 技术说明

- **three.js InstancedMesh**：26 页共用一份几何体与着色器，所有页面动画都在顶点着色器里完成
- **纹理图集**：13 张封面在 Canvas 里居中裁切成 512×512 方格、竖排合成一张纹理，每页用 UV 区间取自己那格
- **开场动画**：顶点着色器按 `uProgress` 分四段插值——逐页起转 → 全速旋转 → 减速堆叠 → 散开成纸带
- **无限滚动**：每页中心 Z 坐标对总长度取模回绕，形成首尾相接的循环；滚动速度注入 `uSpeedY`，驱动 `sin` 波浪弯曲并按帧衰减
- **无依赖替代**：GSAP 补间 → 手写 `power2.inOut` 缓动；normalize-wheel → `deltaMode` 换算；lenis 不再需要
- 尊重 `prefers-reduced-motion`（跳过开场动画）；WebGL 不可用时退回静态封面墙

---

*A13 · 2008 → 2025 · dlwlrma*
