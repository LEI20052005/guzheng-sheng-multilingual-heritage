# 声生不息 · 古筝与笙的多语种数字传承计划

> 梳理民乐源流，留存传世音律 —— 一个聚焦 **古筝** 与 **笙** 两大中国传统乐器的数字资料库网站。



## ✨ 功能板块

| 板块 | 说明 |
| --- | --- |
| 🏠 首页 | 项目简介与快速导航 |
| 📚 乐器资料库 | 古筝 / 笙的历史、形制、音色、名家与经典曲目（点击卡片查看详情） |
| 🎵 经典曲目库 | 《高山流水》《广陵散》《冬猎》《晋调》等传世名曲赏析与在线试听 |
| 🎬 视频展厅 | 高清演奏视频（古筝《渔舟唱晚》、笙《凤凰展翅》） |
| 🧊 建模展示 | 基于 Three.js 的乐器 3D 模型交互展示（古筝 / 笙，可旋转缩放） |
| 🎯 互动答题 | 「丝竹寻音」知识问答，8 题一轮，中英双语，称号挑战 |
| 🌍 多语言 | 全站中文 / 英文一键切换 |
| ℹ️ 项目介绍 | 项目背景与建设目标 |

## 📁 目录结构

```
├── index.html              # 首页（项目主入口）
├── model-show.html         # 建模展示 · 筝笙双模型页
├── model-guzheng.html      # 建模展示 · 古筝 3D 页
├── model-sheng.html        # 建模展示 · 笙 3D 页
├── favicon.svg             # 站点图标
├── assets/                 # 静态资源
│   ├── images/             # 图片素材
│   ├── videos/             # 演示视频
│   └── audio/              # 经典曲目音频
├── js/                     # 3D 查看器脚本
│   ├── model-viewer.js     #    模型渲染主逻辑
│   ├── plugin-check.js     #    WebGL / Three.js 环境检测
│   └── file-pick-viewer.js #    本地文件模式查看器
├── libs/                   # Three.js 及加载器等本地依赖
├── models/                 # 3D 模型文件（.glb / .fbx）
└── quiz/                   # 互动答题
    ├── index.html          #    答题页面
    └── quiz-data.js        #    中英双语题库
```

## 🚀 本地预览

网站为**纯静态页面**，无需安装任何依赖：

- **直接双击 `index.html`** 即可在浏览器中打开；
- 更推荐用本地服务器打开（部分浏览器对 `file://` 协议有安全限制）：

```bash
# 任选其一
python -m http.server 8000        # Python
npx serve .                       # Node.js
```

然后访问 <http://localhost:8000>。

## 🌐 部署到 GitHub Pages

1. 将本仓库推送到 GitHub；
2. 进入仓库 **Settings → Pages**；
3. Source 选择 `main` 分支 / 根目录，保存；
4. 稍候片刻即可通过 `https://<用户名>.github.io/<仓库名>/` 访问。

## 🛠️ 技术栈

- **Tailwind CSS**（CDN）+ 原生 JavaScript
- **Three.js**：3D 建模展示（GLB / FBX 模型加载、DRACO 解码、OrbitControls 交互）
- **Web Audio API**：答题音效合成（无音频文件依赖）
- 字体：Google Fonts · Noto Serif SC（思源宋体）

## 📄 版权说明

音频、视频素材用于教学展示，版权归原作者所有；代码部分仅供学习交流。
