/**
 * 3D 建模展示 — 插件检测与安装模块
 *
 * 用法：
 *   <script src="js/plugin-check.js" data-theme-color="#e8a34b"
 *           data-viewer-src="js/viewer.js" defer></script>
 *
 * 功能：
 *   1. 在页面上显示「启动」覆盖层，避免直接拉起 3D 场景。
 *   2. 用户点击「启动」后，依次检测 WebGL / ES Module / Three.js CDN。
 *   3. 检测通过 → 动态注入 importmap 与 viewer script。
 *   4. 检测失败 → 弹出「立即安装」/「暂不安装」对话框：
 *      - 立即安装：自动下载 Three.js 等库到本地 Blob，本地化加载；
 *      - 暂不安装：显示「建模功能因缺少插件而无法启用」提示。
 */

(function () {
  'use strict';

  if (window.__pluginCheckLoaded) return;
  window.__pluginCheckLoaded = true;

  /* ========= 读取配置 ========= */
  const scriptEl = document.currentScript || (function () {
    return document.querySelector('script[data-viewer-src]');
  })();
  const themeColor = (scriptEl && scriptEl.dataset.themeColor) || '#e8a34b';
  const themeColor2 = (scriptEl && scriptEl.dataset.themeColor2) || '#c97f2c';
  const themeText = (scriptEl && scriptEl.dataset.themeText) || '#1a1208';
  const viewerSrc = (scriptEl && scriptEl.dataset.viewerSrc) || 'js/viewer.js';
  const modelTitle = (scriptEl && scriptEl.dataset.modelTitle) || '3D 模型';

  /* ========= 注入 CSS ========= */
  const style = document.createElement('style');
  style.textContent = `
    #pluginLaunchMask {
      position: fixed; inset: 0; z-index: 80;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(ellipse at center, rgba(20,28,46,.92), rgba(8,12,22,.96));
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: opacity .4s ease;
    }
    #pluginLaunchMask.hidden { opacity: 0; pointer-events: none; }
    .plugin-launch-card {
      width: min(420px, 86vw);
      padding: 38px 32px;
      border-radius: 22px;
      background: rgba(20,28,46,.75);
      border: 1px solid rgba(255,255,255,.08);
      box-shadow: 0 20px 60px rgba(0,0,0,.55);
      text-align: center;
      color: #e8edf5;
    }
    .plugin-launch-card .icon {
      width: 76px; height: 76px; margin: 0 auto 20px;
      border-radius: 50%;
      background: linear-gradient(135deg, ${themeColor}, ${themeColor2});
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 30px ${themeColor}40;
    }
    .plugin-launch-card .icon svg { width: 38px; height: 38px; }
    .plugin-launch-card h2 {
      font-size: 22px; font-weight: 600; letter-spacing: 2px; margin-bottom: 12px;
    }
    .plugin-launch-card p {
      font-size: 13px; line-height: 1.8; color: #9aa7c0; margin-bottom: 24px; letter-spacing: 1px;
    }
    .plugin-launch-card .actions {
      display: flex; gap: 10px; justify-content: center;
    }
    .plugin-btn {
      padding: 12px 28px; border-radius: 10px; cursor: pointer;
      font-size: 14px; letter-spacing: 1.5px; font-weight: 500;
      transition: all .2s; border: none;
      font-family: inherit;
    }
    .plugin-btn.primary {
      background: linear-gradient(135deg, ${themeColor}, ${themeColor2});
      color: ${themeText}; font-weight: 600;
    }
    .plugin-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px ${themeColor}50; }
    .plugin-btn.ghost {
      background: rgba(255,255,255,.06); color: #c7d0e0;
      border: 1px solid rgba(255,255,255,.12);
    }
    .plugin-btn.ghost:hover { background: rgba(255,255,255,.12); color: #fff; }
    .plugin-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; box-shadow: none; }

    /* ---------- 安装进度层 ---------- */
    #pluginInstallMask {
      position: fixed; inset: 0; z-index: 90;
      display: none; align-items: center; justify-content: center;
      background: rgba(8,12,22,.78);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    #pluginInstallMask.show { display: flex; }
    .plugin-install-card {
      width: min(440px, 86vw);
      padding: 32px 28px;
      border-radius: 18px;
      background: rgba(20,28,46,.88);
      border: 1px solid rgba(255,255,255,.08);
      box-shadow: 0 18px 50px rgba(0,0,0,.5);
      text-align: center; color: #e8edf5;
    }
    .plugin-install-card h3 {
      font-size: 16px; font-weight: 500; margin-bottom: 18px; letter-spacing: 1.5px;
      color: ${themeColor};
    }
    .plugin-install-card .bar {
      width: 100%; height: 6px; border-radius: 3px;
      background: rgba(255,255,255,.08); overflow: hidden; margin-bottom: 14px;
    }
    .plugin-install-card .bar > i {
      display: block; height: 100%; width: 0%;
      background: linear-gradient(90deg, ${themeColor}, ${themeColor2});
      transition: width .25s ease;
    }
    .plugin-install-card .progress-text {
      font-size: 12px; color: #9aa7c0; letter-spacing: 1px; min-height: 18px;
    }
    .plugin-install-card .progress-list {
      margin-top: 14px; max-height: 100px; overflow: auto;
      font-size: 11px; color: #7c88a0; text-align: left;
    }
    .plugin-install-card .progress-list li {
      padding: 3px 0; display: flex; align-items: center; gap: 6px;
    }
    .plugin-install-card .progress-list li.done::before {
      content: "✓"; color: ${themeColor}; font-weight: 700;
    }
    .plugin-install-card .progress-list li.pending::before {
      content: "·"; color: #5a6478;
    }
    .plugin-install-card .progress-list li.error::before {
      content: "✗"; color: #ff7878; font-weight: 700;
    }

    /* ---------- 不可用提示层 ---------- */
    #pluginDisabledMask {
      position: fixed; inset: 0; z-index: 85;
      display: none; align-items: center; justify-content: center;
      background: radial-gradient(ellipse at center, rgba(36,16,16,.92), rgba(14,8,10,.96));
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
    }
    #pluginDisabledMask.show { display: flex; }
    .plugin-disabled-card {
      width: min(440px, 86vw);
      padding: 38px 30px; border-radius: 20px;
      background: rgba(36,16,16,.85);
      border: 1px solid rgba(255,120,120,.2);
      box-shadow: 0 18px 50px rgba(0,0,0,.5);
      text-align: center; color: #f5e0e0;
    }
    .plugin-disabled-card .icon {
      width: 70px; height: 70px; margin: 0 auto 18px;
      border-radius: 50%;
      background: rgba(255,120,120,.15);
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(255,120,120,.3);
    }
    .plugin-disabled-card .icon svg { width: 36px; height: 36px; }
    .plugin-disabled-card h3 {
      font-size: 18px; font-weight: 600; margin-bottom: 12px;
      color: #ffb4b4; letter-spacing: 2px;
    }
    .plugin-disabled-card p {
      font-size: 13px; line-height: 1.8; color: #d9aaaa; margin-bottom: 22px; letter-spacing: 1px;
    }
  `;
  document.head.appendChild(style);

  /* ========= 通用帮助方法 ========= */
  function el(tag, props, children) {
    const e = document.createElement(tag);
    if (props) {
      for (const k in props) {
        if (k === 'style' && typeof props[k] === 'object') {
          Object.assign(e.style, props[k]);
        } else if (k === 'className') {
          e.className = props[k];
        } else if (k === 'dataset') {
          Object.assign(e.dataset, props[k]);
        } else if (k === 'html') {
          e.innerHTML = props[k];
        } else if (k.startsWith('on') && typeof props[k] === 'function') {
          e.addEventListener(k.slice(2).toLowerCase(), props[k]);
        } else if (k in e) {
          e[k] = props[k];
        } else {
          e.setAttribute(k, props[k]);
        }
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null) return;
        e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return e;
  }

  /* ========= 插件清单 ========= */
  const CDN_MIRRORS = [
    'https://cdn.jsdelivr.net/npm/three@0.160.0',
    'https://unpkg.com/three@0.160.0',
    'https://esm.sh/three@0.160.0'
  ];

  const PLUGINS = [
    { id: 'three-core',       name: 'Three.js 核心库',       path: '/build/three.module.js', importKey: 'three' },
    { id: 'orbit-controls',   name: 'OrbitControls 控制器',  path: '/examples/jsm/controls/OrbitControls.js', importKey: 'three/addons/controls/OrbitControls.js' },
    { id: 'gltf-loader',      name: 'GLTFLoader 加载器',     path: '/examples/jsm/loaders/GLTFLoader.js',    importKey: 'three/addons/loaders/GLTFLoader.js' },
    { id: 'draco-loader',     name: 'DRACOLoader 解码器',    path: '/examples/jsm/loaders/DRACOLoader.js',   importKey: 'three/addons/loaders/DRACOLoader.js' },
    { id: 'fbx-loader',       name: 'FBXLoader 加载器',      path: '/examples/jsm/loaders/FBXLoader.js',     importKey: 'three/addons/loaders/FBXLoader.js' },
    { id: 'room-env',         name: 'RoomEnvironment 环境',  path: '/examples/jsm/environments/RoomEnvironment.js', importKey: 'three/addons/environments/RoomEnvironment.js' },
    { id: 'fflate',           name: 'fflate 压缩库',         url: 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/fflate.module.min.js', importKey: 'fflate' }
  ];

  /* ========= 能力检测 ========= */
  function detectWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch (e) { return false; }
  }
  function detectESModule() {
    // 现代浏览器都支持；用 import() 来验证是否真的可用
    try {
      // noinspection JSVoidFunctionReturnValueUsed
      new Function('return import("data:text/javascript,export default 1")')();
      return true;
    } catch (e) { return false; }
  }
  async function detectCDN(timeout = 4500) {
    for (const mirror of CDN_MIRRORS) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        const r = await fetch(mirror + '/build/three.module.js', {
          method: 'HEAD', mode: 'cors', signal: controller.signal
        }).catch(() => null);
        clearTimeout(timer);
        if (r && r.ok) return mirror;
      } catch (e) { /* try next */ }
    }
    return null;
  }
  async function detectImportMap() {
    // 现代浏览器都支持 importmap；用 onbeforematch 来验证
    try {
      const s = document.createElement('script');
      s.type = 'importmap';
      s.textContent = JSON.stringify({ imports: { 'x-test': 'data:text/javascript,export default 1' } });
      document.head.appendChild(s);
      s.remove();
      // 浏览器支持 importmap 但要求 importmap 出现在第一个 module script 之前；
      // 如果之前已经存在 importmap 会抛错。出现错误可以视为不支持自定义后再添加。
      return 'supportsImportMaps' in HTMLScriptElement ? true : true;
    } catch (e) {
      return false;
    }
  }

  /* ========= 安装 ========= */
  async function installPlugins(base, onProgress) {
    const urls = {};
    for (let i = 0; i < PLUGINS.length; i++) {
      const plugin = PLUGINS[i];
      const url = plugin.url || (base + plugin.path);
      onProgress && onProgress(i, plugin, 'pending');
      try {
        const r = await fetch(url, { mode: 'cors' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const text = await r.text();
        const blob = new Blob([text], { type: 'application/javascript' });
        urls[plugin.importKey] = URL.createObjectURL(blob);
        onProgress && onProgress(i, plugin, 'done');
      } catch (e) {
        onProgress && onProgress(i, plugin, 'error', e.message || String(e));
        throw e;
      }
    }
    return urls;
  }

  function applyImportMap(urls) {
    const importMap = { imports: {} };
    Object.keys(urls).forEach(k => { importMap.imports[k] = urls[k]; });
    const s = document.createElement('script');
    s.type = 'importmap';
    s.textContent = JSON.stringify(importMap);
    document.head.appendChild(s);
  }

  function loadViewer(viewerSrc) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.type = 'module';
      s.src = viewerSrc;
      s.onload = () => resolve();
      s.onerror = (e) => reject(new Error('viewer 脚本加载失败'));
      document.head.appendChild(s);
    });
  }

  /* ========= UI：启动覆盖层 ========= */
  function buildLaunchMask() {
    const mask = el('div', { id: 'pluginLaunchMask' });
    const card = el('div', { className: 'plugin-launch-card' });

    const iconWrap = el('div', { className: 'icon', html:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1208" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<polygon points="5 3 19 12 5 21 5 3"></polygon>' +
      '</svg>' });

    const h2 = el('h2', null, modelTitle + ' · 3D 建模展示');
    const p = el('p', null, '点击下方按钮启动建模展示，系统将自动检测并加载所需插件。');

    const btn = el('button', {
      className: 'plugin-btn primary',
      type: 'button',
      onclick: () => onLaunchClick()
    }, '启 动');

    card.appendChild(iconWrap);
    card.appendChild(h2);
    card.appendChild(p);
    const actions = el('div', { className: 'actions' }, btn);
    card.appendChild(actions);
    mask.appendChild(card);
    document.body.appendChild(mask);
    return mask;
  }

  /* ========= UI：安装进度层 ========= */
  function buildInstallMask() {
    const mask = el('div', { id: 'pluginInstallMask' });
    const card = el('div', { className: 'plugin-install-card' });
    const h3 = el('h3', null, '正在下载建模插件…');
    const bar = el('div', { className: 'bar' }, el('i'));
    const text = el('div', { className: 'progress-text' }, '准备中…');
    const list = el('ul', { className: 'progress-list' });
    PLUGINS.forEach(p => list.appendChild(
      el('li', { id: 'plItem_' + p.id, className: 'pending' }, '· ' + p.name)
    ));
    card.appendChild(h3);
    card.appendChild(bar);
    card.appendChild(text);
    card.appendChild(list);
    mask.appendChild(card);
    document.body.appendChild(mask);
    return { mask, bar: bar.firstChild, text, list };
  }

  /* ========= UI：可用提示 / 禁用提示 ========= */
  function buildPromptMask({ missing, onInstall, onCancel }) {
    const mask = el('div', { id: 'pluginPromptMask' });
    Object.assign(mask.style, {
      position: 'fixed', inset: '0', zIndex: '88',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(8,12,22,.78)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
    });
    const card = el('div', {
      style: {
        width: 'min(460px, 86vw)',
        padding: '34px 30px', borderRadius: '20px',
        background: 'rgba(20,28,46,.88)',
        border: '1px solid rgba(255,255,255,.08)',
        boxShadow: '0 18px 50px rgba(0,0,0,.5)',
        textAlign: 'center', color: '#e8edf5'
      }
    });

    const iconWrap = el('div', {
      style: {
        width: '72px', height: '72px', margin: '0 auto 18px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, ' + themeColor + ', ' + themeColor2 + ')',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 30px ' + themeColor + '40'
      },
      html:
        '<svg viewBox="0 0 24 24" fill="none" stroke="#1a1208" stroke-width="2.2" ' +
        'stroke-linecap="round" stroke-linejoin="round" width="38" height="38">' +
        '<path d="M12 2v4"></path><path d="M12 18v4"></path>' +
        '<path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path>' +
        '<path d="M2 12h4"></path><path d="M18 12h4"></path>' +
        '<path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path>' +
        '<circle cx="12" cy="12" r="3"></circle>' +
        '</svg>'
    });

    const h2 = el('h2', { style: { fontSize: '20px', fontWeight: '600', letterSpacing: '2px', marginBottom: '12px' } },
      '需要安装建模插件');
    const desc = el('p', { style: { fontSize: '13px', lineHeight: '1.8', color: '#9aa7c0', marginBottom: '16px', letterSpacing: '1px' } },
      '检测到您的环境缺少以下运行 3D 建模展示所需的相关插件，是否立即下载安装？');

    const missingItems = el('ul', {
      style: {
        listStyle: 'none', padding: '14px 18px', margin: '0 0 20px',
        background: 'rgba(255,255,255,.04)', borderRadius: '10px',
        textAlign: 'left', maxHeight: '110px', overflowY: 'auto',
        border: '1px solid rgba(255,255,255,.06)'
      }
    });
    missing.forEach(name => missingItems.appendChild(
      el('li', { style: { fontSize: '12px', color: '#aab6cc', padding: '3px 0' } },
        '· ' + name)
    ));

    const actions = el('div', {
      style: { display: 'flex', gap: '10px', justifyContent: 'center' }
    });
    const btnInstall = el('button', {
      className: 'plugin-btn primary', type: 'button',
      onclick: () => { mask.remove(); onInstall && onInstall(); }
    }, '立 即 安 装');
    const btnCancel = el('button', {
      className: 'plugin-btn ghost', type: 'button',
      onclick: () => { mask.remove(); onCancel && onCancel(); }
    }, '暂 不 安 装');
    actions.appendChild(btnInstall);
    actions.appendChild(btnCancel);

    card.appendChild(iconWrap);
    card.appendChild(h2);
    card.appendChild(desc);
    card.appendChild(missingItems);
    card.appendChild(actions);
    mask.appendChild(card);
    document.body.appendChild(mask);
    return mask;
  }

  /* ========= UI：功能不可用覆盖层 ========= */
  function buildDisabledMask({ reason, onRetry, onBack }) {
    const mask = el('div', { id: 'pluginDisabledMask' });
    const card = el('div', { className: 'plugin-disabled-card' });
    const iconWrap = el('div', { className: 'icon', html:
      '<svg viewBox="0 0 24 24" fill="none" stroke="#ff7878" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="10"></circle>' +
      '<line x1="15" y1="9" x2="9" y2="15"></line>' +
      '<line x1="9" y1="9" x2="15" y2="15"></line>' +
      '</svg>' });
    const h3 = el('h3', null, '建模功能无法启用');
    const p = el('p', null, '建模功能因缺少插件而无法启用' + (reason ? '（' + reason + '）' : '') + '。');
    const actions = el('div', { style: { display: 'flex', gap: '10px', justifyContent: 'center' } });
    const btnRetry = el('button', {
      className: 'plugin-btn ghost', type: 'button',
      onclick: () => { mask.remove(); onRetry && onRetry(); }
    }, '重 新 检 测');
    const btnBack = el('button', {
      className: 'plugin-btn primary', type: 'button',
      onclick: () => { onBack && onBack(); }
    }, '返 回 主 页');
    actions.appendChild(btnRetry);
    actions.appendChild(btnBack);
    card.appendChild(iconWrap);
    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(actions);
    mask.appendChild(card);
    document.body.appendChild(mask);
    return mask;
  }

  /* ========= 启动流程 ========= */
  let launchMask = null;
  let installUI = null;
  let disabledMask = null;

  function showLaunch() {
    if (launchMask) return launchMask;
    launchMask = buildLaunchMask();
    return launchMask;
  }

  function hideLaunch() {
    if (launchMask) { launchMask.classList.add('hidden'); setTimeout(() => launchMask.remove(), 400); launchMask = null; }
  }

  async function onLaunchClick() {
    await doLaunch();
  }

  /* 统一的启动流程：能力检测 → 通过则注入 importmap 并加载 viewer */
  async function doLaunch() {
    // 1. 能力检测
    const webgl = detectWebGL();
    const esm = detectESModule();
    const imp = await detectImportMap();
    const cdn = await detectCDN();

    const missing = [];
    if (!webgl) missing.push('WebGL 显卡加速（用于 3D 渲染）');
    if (!esm) missing.push('ES Module 模块化加载');
    if (!imp) missing.push('Import Map 资源映射');
    if (!cdn) missing.push('Three.js 库（CDN 资源不可达）');

    if (missing.length === 0) {
      hideLaunch();
      // 直接 importmap 走原始 CDN，载入 viewer
      ensureImportMap();
      await loadViewer(viewerSrc);
      return;
    }

    // 弹出安装/取消选择
    buildPromptMask({
      missing,
      onInstall: () => startInstall(cdn),
      onCancel: () => showDisabled('用户取消安装')
    });
  }

  /* ========= 备用：在用 CDN 的情况下，注入 importmap ========= */
  function ensureImportMap() {
    if (window.__pluginImportMapInjected) return;
    const map = {
      imports: {
        'three': 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
        'three/addons/': 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/',
        'fflate': 'https://cdn.jsdelivr.net/npm/fflate@0.8.2/fflate.module.min.js'
      }
    };
    const s = document.createElement('script');
    s.type = 'importmap';
    s.textContent = JSON.stringify(map);
    document.head.appendChild(s);
    window.__pluginImportMapInjected = true;
  }

  /* ========= 安装流程 ========= */
  async function startInstall(cdnBaseOrNull) {
    hideLaunch();
    const ins = installUI = buildInstallMask();
    ins.mask.classList.add('show');

    const total = PLUGINS.length;
    let completed = 0;

    function bumpProgress() {
      completed++;
      const pct = Math.round((completed / total) * 100);
      ins.bar.style.width = pct + '%';
      ins.text.textContent = '已下载 ' + completed + ' / ' + total + '  (' + pct + '%)';
    }

    const onProgress = (i, plugin, state, err) => {
      const li = document.getElementById('plItem_' + plugin.id);
      if (li) {
        li.className = state || 'pending';
        if (state === 'done') li.textContent = '✓ ' + plugin.name;
        else if (state === 'error') li.textContent = '✗ ' + plugin.name + '（' + (err || '失败') + '）';
      }
    };

    // 如果没有可用的 CDN base，回落到尝试每个镜像
    const tryBase = async () => {
      if (cdnBaseOrNull) return cdnBaseOrNull;
      // 没有可用 CDN，挨个镜像试一遍
      for (const mirror of CDN_MIRRORS) {
        const r = await fetch(mirror + '/build/three.module.js', { method: 'HEAD', mode: 'cors' }).catch(() => null);
        if (r && r.ok) return mirror;
      }
      return null;
    };

    try {
      const base = await tryBase();
      if (!base) throw new Error('所有 CDN 均不可达');
      ins.text.textContent = '正在从 ' + base + ' 下载插件…';
      const urls = await installPlugins(base, (i, p, s, e) => {
        onProgress(i, p, s, e);
        if (s === 'done') bumpProgress();
      });
      ins.text.textContent = '插件准备就绪，正在启动建模展示…';
      applyImportMap(urls);
      window.__pluginInstallCompleted = true;
      await loadViewer(viewerSrc);
      ins.mask.classList.remove('show');
      setTimeout(() => ins.mask.remove(), 400);
    } catch (err) {
      ins.text.textContent = '下载失败：' + (err.message || err);
      setTimeout(() => {
        ins.mask.classList.remove('show');
        ins.mask.remove();
        showDisabled('下载插件失败：' + (err.message || err));
      }, 1200);
    }
  }

  /* ========= 取消 / 不可用 ========= */
  function showDisabled(reason) {
    if (disabledMask) { disabledMask.remove(); disabledMask = null; }
    disabledMask = buildDisabledMask({
      reason,
      onRetry: () => {
        // 重新回到启动页
        if (disabledMask) { disabledMask.remove(); disabledMask = null; }
        showLaunch();
      },
      onBack: () => {
        // 返回声生不息主页（如果是在 iframe/新窗口中则关闭；否则尝试返回上一页，否则跳到首页）
        if (history.length > 1) history.back();
        else location.href = 'http://localhost:3000';
      }
    });
    disabledMask.classList.add('show');
  }

  /* ========= 启动 ========= */
  // 自包含模式（HTML 已内嵌模型数据）：file:// 双击也能直接显示模型，
  // 自动启动，不显示「启动」按钮。
  const selfContained = !!(window.__INLINE_FBX__ || window.__INLINE_GLB__);

  function autoLaunch() {
    doLaunch().catch((err) => {
      console.error('自动启动失败：', err);
      if (launchMask) launchMask.remove();
      showDisabled('启动失败：' + ((err && err.message) || err));
    });
  }

  // 若上游检测到 file:// 协议且无内嵌数据，放弃挂载（避免与 file-protocol-overlay 冲突）
  if (window.__BLOCK_3D__) {
    // noop
  } else if (selfContained) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoLaunch);
    } else {
      autoLaunch();
    }
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showLaunch);
  } else {
    showLaunch();
  }

  /* ========= 暴露 API ========= */
  window.PluginCheck = {
    detect: async () => ({
      webgl: detectWebGL(),
      esModule: detectESModule(),
      importMap: await detectImportMap(),
      cdn: await detectCDN()
    }),
    install: (cdnBase) => startInstall(cdnBase),
    showLaunch,
    showDisabled
  };
})();
