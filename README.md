# 💜 IU Magazine

> IU 音乐视觉站:15 张专辑、113+ 张歌曲照片、点卡片即可播放

**线上地址**:https://miyawang7817-stack.github.io/iumusic/

## 🎬 体验流程

1. **开场**——专辑封面像一本被风掀开的书:逐页起转、全速旋转、堆叠成摞、散成纸带,随即收拢
2. **封面轮盘**——15 张专辑封面聚成可旋转的轮盘(中间大、两侧渐次侧立虚化),自动轮换,支持拖拽(带惯性)、滚轮、方向键;底部显示专辑名与年份
3. **专辑页**——点中间的封面进入:该专辑的每首歌是一张漂浮在 3D 空间里的播放器卡片(歌曲照片 + 歌名 + 进度条),拖拽平移、滚轮向纵深无限穿行
4. **点歌播放**——点卡片或左下曲目列表即播,播放中的卡面 ▶ 变 ⏸,右下角出现播放条(可暂停);`← BACK` 返回轮盘
5. **不用鼠标**——手机上:拖动转轮盘、专辑页横划平移/竖划向纵深飞行;点右上 🖐 开启**摄像头手势**:挥手转轮盘/平移视野,指着目标**停住 1 秒**=选中(开专辑/播歌,捏合亦可),手部识别模型完全自托管、画面不上传

## 🎵 播放逻辑(页内直接放,不跳转)

按顺序尝试,命中即播:

1. **本地音源**(可选):`assets/audio/<专辑目录名>/tNN.mp3|m4a|wav`,与曲目序号对应。⚠️ 版权音频请勿提交到公开仓库,本地自用即可
2. **iTunes 官方 30 秒试听**:自动按歌名搜索,无需任何 key
3. 都不可用时仅在右下角提示,不做任何跳转

## 📁 项目结构

```
├── index.html                # 页面骨架(信息栏 / 专辑视图 / 播放条 / 画布)
├── css/style.css             # 全部样式
├── js/magazine.js            # 全部逻辑:开场着色器、轮盘、卡片场、点歌播放、人脸裁剪
├── assets/covers/            # 15 张专辑封面
│   └── tracks/<专辑>/tNN.jpg  # 各专辑歌曲照片(共 113+ 张)
└── assets/vendor/            # three.js 本地文件(无 CDN 依赖)
```

## ➕ 维护指南

- **加专辑**:封面放入 `assets/covers/`,在 `js/magazine.js` 顶部 `ALBUMS` 数组按年份加一行(`file/name/year/tracks`)
- **加歌曲照片**:放入 `assets/covers/tracks/<专辑目录>/t01.jpg…`,给该专辑加 `gallery`(目录名)与 `galleryN`(张数);照片会自动做人脸居中裁剪(`FOCUS` 表由 OpenCV 预扫描生成)
- **改曲目名**:直接改 `ALBUMS` 里的 `tracks` 数组,卡面与列表同步更新
- **部署**:push 到 `main` → GitHub Actions 自动发布到 `gh-pages` → Pages 上线;纯静态零构建,Vercel 直接导入也行

## 🔧 技术要点

- 零依赖构建:three.js 本地 vendor,补间/滚轮归一化手写,直接部署
- 开场动画全部在顶点着色器完成(InstancedMesh + 纹理图集),移植自 [J0SUKE/webgl-magazine](https://github.com/J0SUKE/webgl-magazine)
- 专辑卡片场参照 [J0SUKE/spotify-visualiser](https://github.com/J0SUKE/spotify-visualiser):播放器卡片框架由 Canvas 程序化绘制,封面挖孔由片元着色器按格填充,远处卡片带封面色模糊光晕
- 点卡片命中:CPU 侧复算着色器位移、投影成屏幕矩形判定,取最靠前一张
- 尊重 `prefers-reduced-motion`;WebGL 不可用时退回静态封面墙

---

*A15 · 2008 → 2025 · dlwlrma* 💜
