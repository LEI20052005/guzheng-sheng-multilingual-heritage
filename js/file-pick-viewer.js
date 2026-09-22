/**
 * file:// 模式 → 自动跳转到 http://localhost:3000
 *
 * 用法：HTML 中先于 plugin-check.js 引入本文件。
 *   - 当协议是 http(s):// 时，本文件不做任何事（由 plugin-check.js 接管）
 *   - 当协议是 file:// 时：
 *       1. 尝试探测 http://localhost:3000 是否在跑
 *       2. 在跑 → 自动跳转到 http:// 版本的同一页面（直接看 3D 模型）
 *       3. 不在 → 弹出"请双击 打开声生不息.bat"一键启动按钮
 *     整个过程零"选文件"步骤，用户感受就是"点进去就是 3D 模型"
 */
(function () {
  if (location.protocol !== 'file:') return;

  // 【自包含】HTML 里已经嵌入了 3D 模型（window.__INLINE_FBX__ / __INLINE_GLB__）
  // 直接放行，让原页面用 fetch 拦截器从内嵌数据加载模型 → "双击 HTML 就看 3D 模型"
  // 不弹任何遮罩、不跳 http://、不显示"请双击 bat"
  if (window.__INLINE_FBX__ || window.__INLINE_GLB__) return;

  window.__BLOCK_3D__ = true; // 阻止 plugin-check.js 重复挂载

  // 同步注入遮罩（不等 DOMContentLoaded，否则用户会先看到空白页面）
  document.documentElement.style.background = '#0b0f19';
  var bootDiv = document.createElement('div');
  bootDiv.id = '__boot_overlay__';
  bootDiv.innerHTML = `
    <style>
      #__boot_overlay__ {
        position: fixed; inset: 0; z-index: 999999;
        background: radial-gradient(ellipse at center, rgba(20,30,50,.98), rgba(5,8,16,1));
        display: flex; align-items: center; justify-content: center;
        font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
        color: #e8edf5;
      }
      #__boot_overlay__ .card {
        max-width: 480px; width: calc(100% - 40px);
        background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(20,28,46,.85));
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 18px; padding: 36px 32px; text-align: center;
        box-shadow: 0 24px 64px rgba(0,0,0,.6);
      }
      #__boot_overlay__ .icon {
        width: 72px; height: 72px; margin: 0 auto 20px; border-radius: 50%;
        background: linear-gradient(135deg, var(--accent, #e8a34b), var(--accent-2, #d08c3f));
        display: flex; align-items: center; justify-content: center;
        font-size: 32px; color: #0b0f19;
        box-shadow: 0 8px 28px rgba(232,163,75,.3);
      }
      #__boot_overlay__ h2 {
        font-size: 22px; margin: 0 0 8px; font-weight: 600;
        background: linear-gradient(90deg, #f6c26a, #e8a34b, #d08c3f);
        -webkit-background-clip: text; background-clip: text; color: transparent;
      }
      #__boot_overlay__ p { margin: 8px 0; font-size: 13px; color: #a8b3c5; line-height: 1.7; }
      #__boot_overlay__ .spin {
        display: inline-block; width: 16px; height: 16px; margin-right: 8px;
        border: 2px solid rgba(255,255,255,.18); border-top-color: var(--accent, #e8a34b);
        border-radius: 50%; vertical-align: -3px;
        animation: __boot_spin__ 0.9s linear infinite;
      }
      @keyframes __boot_spin__ { to { transform: rotate(360deg); } }
      #__boot_overlay__ .btn {
        display: inline-block; margin-top: 18px; padding: 12px 28px; font-size: 14px; font-weight: 600;
        background: linear-gradient(135deg, #f6c26a, #e8a34b); color: #1a1410;
        border: none; border-radius: 10px; cursor: pointer; transition: all .2s;
        box-shadow: 0 8px 24px rgba(232,163,75,.4); text-decoration: none;
      }
      #__boot_overlay__ .btn:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(232,163,75,.55); }
      #__boot_overlay__ .btn.secondary {
        background: rgba(255,255,255,.06); color: #c7d0e0;
        box-shadow: none; margin-left: 8px;
      }
      #__boot_overlay__ code {
        background: rgba(255,255,255,.08); padding: 2px 8px; border-radius: 4px;
        color: var(--accent, #e8a34b); font-size: 12px;
      }
    </style>
    <div class="card" id="__boot_card__">
      <div class="icon"><i class="fa-solid fa-cube"></i></div>
      <h2 id="__boot_title__">古筝 · 3D 模型展示</h2>
      <p id="__boot_msg__"><span class="spin"></span>正在连接建模服务…</p>
    </div>
  `;
  (document.body || document.documentElement).appendChild(bootDiv);

  // 读主题色
  var themeColor = '#e8a34b';
  try {
    var tag = document.querySelector('script[data-theme-color]');
    if (tag) themeColor = tag.getAttribute('data-theme-color') || themeColor;
  } catch (e) {}
  document.documentElement.style.setProperty('--accent', themeColor);

  // 读页面标题
  var pageTitle = (document.querySelector('h1') && document.querySelector('h1').textContent.trim()) || document.title || '3D 模型展示';
  var titleEl = document.getElementById('__boot_title__');
  if (titleEl) titleEl.textContent = pageTitle + ' · 3D 模型展示';

  // 当前 file:// URL → 对应的 http:// URL（保留路径和查询串）
  var httpUrl = 'http://localhost:3000' + location.pathname + location.search;
  var msgEl = document.getElementById('__boot_msg__');
  var cardEl = document.getElementById('__boot_card__');

  // -------- 主流程：探测服务 --------
  // 用 fetch 探测，2 秒超时
  var ac = new AbortController();
  var timer = setTimeout(function () { ac.abort(); }, 2000);

  fetch('http://localhost:3000/?__probe__=1', { method: 'HEAD', mode: 'cors', signal: ac.signal })
    .then(function (res) {
      clearTimeout(timer);
      if (res && (res.status === 200 || res.status === 301 || res.status === 302 || res.status === 304)) {
        // 服务在 → 立即跳转到 HTTP 版本
        msgEl.innerHTML = '<span class="spin"></span>服务已连接，正在打开 3D 模型…';
        setTimeout(function () { location.replace(httpUrl); }, 150);
      } else {
        showStartHint();
      }
    })
    .catch(function () {
      clearTimeout(timer);
      showStartHint();
    });

  // -------- 服务未起 → 一键启动提示 --------
  function showStartHint() {
    // 推断 bat 文件路径（假设在 d:/3D建模网页/打开声生不息.bat）
    // 通过 URL 反推：把 file:///D:/3D建模网页/声生不息 2/声生不息/model-guzheng.html
    //   → D:/3D建模网页/打开声生不息.bat
    var batPath = inferBatPath();
    msgEl.innerHTML =
      '服务还没启动。请先在 <code>' + escapeHtml(batPath) + '</code> 上<strong>双击一下</strong>，<br>' +
      '建模服务就会在后台静默启动（不会有黑色窗口），然后点这里进入 3D 模型：';

    var btnRow = document.createElement('div');
    btnRow.style.marginTop = '8px';

    var enterBtn = document.createElement('a');
    enterBtn.className = 'btn';
    enterBtn.href = httpUrl;
    enterBtn.innerHTML = '<i class="fa-solid fa-play"></i>&nbsp; 进入 3D 模型展示';
    enterBtn.onclick = function (e) {
      e.preventDefault();
      // 再次探测，避免用户点完其实还没起
      var ac2 = new AbortController();
      var t2 = setTimeout(function () { ac2.abort(); }, 1500);
      fetch('http://localhost:3000/?__probe__=1', { method: 'HEAD', signal: ac2.signal })
        .then(function () { location.replace(httpUrl); })
        .catch(function () {
          clearTimeout(t2);
          msgEl.innerHTML = '服务还没起，请先双击 <code>' + escapeHtml(batPath) + '</code>';
        });
    };
    btnRow.appendChild(enterBtn);

    var retryBtn = document.createElement('a');
    retryBtn.className = 'btn secondary';
    retryBtn.href = '#';
    retryBtn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>&nbsp; 重新检测';
    retryBtn.onclick = function (e) {
      e.preventDefault();
      location.reload();
    };
    btnRow.appendChild(retryBtn);

    cardEl.appendChild(btnRow);

    var tip = document.createElement('p');
    tip.style.marginTop = '18px';
    tip.style.fontSize = '11px';
    tip.style.color = '#7c88a0';
    tip.innerHTML = '想一劳永逸？运行 <code>安装建模服务.bat</code>，开机自动起服务、桌面也有快捷方式。';
    cardEl.appendChild(tip);
  }

  // -------- 工具函数 --------
  function inferBatPath() {
    var p = location.pathname || '';
    // 匹配 "...\声生不息 2\声生不息\model-xxx.html"  →  "...\打开声生不息.bat"
    var m = p.match(/^(.*?[\\/]声生不息\s*2[\\/])声生不息[\\/].*$/i);
    if (m) return m[1] + '打开声生不息.bat';
    // 兜底：当前文件所在目录
    var dir = p.replace(/[^\\/]+$/, '');
    return dir + '打开声生不息.bat';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
})();
