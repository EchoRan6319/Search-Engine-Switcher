// ==UserScript==
// @name         Search Engine Switcher
// @namespace    https://github.com/EchoRan6319/Search-Engine-Switcher
// @version      2.0.0
// @description  快捷搜索引擎切换器：支持新增、删除、排序、位置自定义
// @author       EchoRan6319
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'via_like_search_switcher_config_v1';
  const STYLE_ID = 'via-like-switcher-style';
  const ROOT_ID = 'via-like-switcher-root';
  const PANEL_ID = 'via-like-switcher-panel';

  const DEFAULT_CONFIG = {
    engines: [
      // ========== 国外传统搜索引擎 ==========
      {
        id: 'google',
        name: 'Google',
        searchUrl: 'https://www.google.com/search?q={q}',
        hosts: ['google.'],
        hidden: false
      },
      {
        id: 'bing',
        name: 'Bing',
        searchUrl: 'https://www.bing.com/search?q={q}',
        hosts: ['bing.com'],
        hidden: false
      },
      {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        searchUrl: 'https://duckduckgo.com/?q={q}',
        hosts: ['duckduckgo.com'],
        hidden: false
      },
      {
        id: 'brave',
        name: 'Brave',
        searchUrl: 'https://search.brave.com/search?q={q}',
        hosts: ['search.brave.com'],
        hidden: false
      },
      {
        id: 'yandex',
        name: 'Yandex',
        searchUrl: 'https://yandex.com/search/?text={q}&from=browser',
        hosts: ['yandex.'],
        hidden: false
      },
      // ========== 国内传统搜索引擎 ==========
      {
        id: 'baidu',
        name: '百度',
        searchUrl: 'https://www.baidu.com/s?wd={q}',
        hosts: ['baidu.com'],
        hidden: false
      },
      {
        id: 'quark',
        name: '夸克',
        searchUrl: 'https://quark.sm.cn/s?q={q}',
        hosts: ['quark.sm.cn', 'sm.cn'],
        hidden: true
      },
      {
        id: 'sogou',
        name: '搜狗',
        searchUrl: 'https://www.sogou.com/web?query={q}',
        hosts: ['sogou.com'],
        hidden: true
      },
      {
        id: '360',
        name: '360搜索',
        searchUrl: 'https://www.so.com/s?q={q}',
        hosts: ['so.com'],
        hidden: true
      },
      // ========== 国外AI大模型 ==========
      {
        id: 'chatgpt',
        name: 'ChatGPT',
        searchUrl: 'https://chatgpt.com/?hints=search&q={q}',
        hosts: ['chatgpt.com'],
        hidden: true
      },
      {
        id: 'gemini',
        name: 'Gemini',
        searchUrl: 'https://gemini.google.com/app?q={q}',
        hosts: ['gemini.google.com'],
        hidden: true
      },
      {
        id: 'perplexity',
        name: 'Perplexity',
        searchUrl: 'https://www.perplexity.ai/?q={q}',
        hosts: ['perplexity.ai'],
        hidden: true
      },
      // ========== 国内AI大模型 ==========
      {
        id: 'qianwen',
        name: '通义千问',
        searchUrl: 'https://tongyi.aliyun.com/qianwen/?q={q}',
        hosts: ['tongyi.aliyun.com'],
        hidden: true
      },
      {
        id: 'doubao',
        name: '豆包',
        searchUrl: 'https://www.doubao.com/chat/?q={q}',
        hosts: ['doubao.com'],
        hidden: true
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        searchUrl: 'https://chat.deepseek.com/?q={q}',
        hosts: ['chat.deepseek.com'],
        hidden: true
      },
      {
        id: 'kimi',
        name: 'Kimi',
        searchUrl: 'https://kimi.moonshot.cn/?q={q}',
        hosts: ['kimi.moonshot.cn'],
        hidden: true
      },
      {
        id: 'metaso',
        name: '秘塔AI',
        searchUrl: 'https://metaso.cn/?q={q}',
        hosts: ['metaso.cn'],
        hidden: true
      },
      // ========== 国外社交/社区 ==========
      {
        id: 'youtube',
        name: 'YouTube',
        searchUrl: 'https://www.youtube.com/results?search_query={q}',
        hosts: ['youtube.com', 'm.youtube.com'],
        hidden: true
      },
      {
        id: 'github',
        name: 'GitHub',
        searchUrl: 'https://github.com/search?q={q}',
        hosts: ['github.com'],
        hidden: true
      },
      // ========== 国内社交/社区 ==========
      {
        id: 'bilibili',
        name: '哔哩哔哩',
        searchUrl: 'https://search.bilibili.com/all?keyword={q}',
        hosts: ['search.bilibili.com', 'bilibili.com'],
        hidden: true
      },
      {
        id: 'zhihu',
        name: '知乎',
        searchUrl: 'https://www.zhihu.com/search?q={q}',
        hosts: ['zhihu.com'],
        hidden: true
      },
      {
        id: 'xiaohongshu',
        name: '小红书',
        searchUrl: 'https://www.xiaohongshu.com/search_result?keyword={q}',
        hosts: ['xiaohongshu.com'],
        hidden: true
      },
      {
        id: 'douyin',
        name: '抖音',
        searchUrl: 'https://www.douyin.com/search/{q}',
        hosts: ['douyin.com'],
        hidden: true
      },
      {
        id: 'weixin',
        name: '微信',
        searchUrl: 'https://weixin.sogou.com/weixin?type=2&s_from=input&query={q}',
        hosts: ['weixin.sogou.com'],
        hidden: true
      }
    ],
    ui: {
      vertical: 'bottom',
      align: 'center',
      offsetX: 16,
      offsetY: 16,
      useCustomXY: false,
      customX: 16,
      customY: 16,
      showWhenNoQuery: false,
      openInNewTab: false,
      theme: 'auto'
    }
  };

  const safeGMGet = (key, fallback) => {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(key, fallback);
      const v = localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  };

  const safeGMSet = (key, value) => {
    try {
      if (typeof GM_setValue === 'function') {
        GM_setValue(key, value);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (_) {
      // ignore
    }
  };

  const uid = () => `se_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  function mergeConfig(raw) {
    const cfg = deepClone(DEFAULT_CONFIG);
    if (!raw || typeof raw !== 'object') return cfg;

    if (Array.isArray(raw.engines) && raw.engines.length > 0) {
      cfg.engines = raw.engines
        .map((e) => ({
          id: String(e.id || uid()),
          name: String(e.name || '').trim(),
          searchUrl: String(e.searchUrl || '').trim(),
          hosts: Array.isArray(e.hosts) ? e.hosts.map((h) => String(h).trim()).filter(Boolean) : [],
          hidden: !!e.hidden
        }))
        .filter((e) => e.name && e.searchUrl.includes('{q}'));
      if (cfg.engines.length === 0) cfg.engines = deepClone(DEFAULT_CONFIG.engines);
    }

    if (raw.ui && typeof raw.ui === 'object') {
      cfg.ui.vertical = raw.ui.vertical === 'top' ? 'top' : 'bottom';
      cfg.ui.align = ['left', 'center', 'right'].includes(raw.ui.align) ? raw.ui.align : 'center';
      cfg.ui.offsetX = Number.isFinite(raw.ui.offsetX) ? raw.ui.offsetX : cfg.ui.offsetX;
      cfg.ui.offsetY = Number.isFinite(raw.ui.offsetY) ? raw.ui.offsetY : cfg.ui.offsetY;
      cfg.ui.useCustomXY = !!raw.ui.useCustomXY;
      cfg.ui.customX = Number.isFinite(raw.ui.customX) ? raw.ui.customX : cfg.ui.customX;
      cfg.ui.customY = Number.isFinite(raw.ui.customY) ? raw.ui.customY : cfg.ui.customY;
      cfg.ui.showWhenNoQuery = raw.ui.showWhenNoQuery !== false;
      cfg.ui.openInNewTab = !!raw.ui.openInNewTab;
      cfg.ui.theme = ['light', 'dark'].includes(raw.ui.theme) ? raw.ui.theme : 'auto';
    }

    return cfg;
  }

  function loadConfig() {
    const raw = safeGMGet(STORAGE_KEY, '');
    if (!raw) return deepClone(DEFAULT_CONFIG);
    try {
      return mergeConfig(JSON.parse(raw));
    } catch (_) {
      return deepClone(DEFAULT_CONFIG);
    }
  }

  function saveConfig(cfg) {
    safeGMSet(STORAGE_KEY, JSON.stringify(cfg));
  }

  const config = loadConfig();

  function applyTheme() {
    const theme = config.ui.theme || 'auto';
    const root = document.documentElement;
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else {
      // auto: follow system preference
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      if (prefersLight) {
        root.setAttribute('data-theme', 'light');
      } else {
        root.removeAttribute('data-theme');
      }
    }
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      :root {
        --se-bg-primary: rgba(16, 16, 16, 0.92);
        --se-bg-secondary: #101114;
        --se-bg-input: #151820;
        --se-bg-button: #4a4a4a;
        --se-text-primary: #fff;
        --se-text-secondary: #f3f3f3;
        --se-text-muted: #9fa6b2;
        --se-text-label: #aeb6c2;
        --se-border-color: rgba(255, 255, 255, 0.12);
        --se-border-light: rgba(255, 255, 255, 0.14);
        --se-border-medium: rgba(255, 255, 255, 0.16);
        --se-border-pill: rgba(255, 255, 255, 0.2);
        --se-shadow: rgba(0, 0, 0, 0.32);
        --se-shadow-panel: rgba(0, 0, 0, 0.35);
        --se-overlay: rgba(0, 0, 0, 0.45);
        --se-active-border: #7ea1ff;
        --se-active-shadow: rgba(126, 161, 255, 0.35);
        --se-primary-bg: #2e5fff;
        --se-danger-bg: #6b2026;
        --se-danger-border: #9f3540;
      }
      [data-theme="light"] {
        --se-bg-primary: rgba(255, 255, 255, 0.95);
        --se-bg-secondary: #f5f5f7;
        --se-bg-input: #ffffff;
        --se-bg-button: #e8e8ed;
        --se-text-primary: #1c1c1e;
        --se-text-secondary: #2c2c2e;
        --se-text-muted: #6c6c70;
        --se-text-label: #3a3a3c;
        --se-border-color: rgba(0, 0, 0, 0.1);
        --se-border-light: rgba(0, 0, 0, 0.12);
        --se-border-medium: rgba(0, 0, 0, 0.15);
        --se-border-pill: rgba(0, 0, 0, 0.15);
        --se-shadow: rgba(0, 0, 0, 0.15);
        --se-shadow-panel: rgba(0, 0, 0, 0.2);
        --se-overlay: rgba(0, 0, 0, 0.35);
        --se-active-border: #007aff;
        --se-active-shadow: rgba(0, 122, 255, 0.3);
        --se-primary-bg: #007aff;
        --se-danger-bg: #ff3b30;
        --se-danger-border: #ff3b30;
      }
      @media (prefers-color-scheme: light) {
        :root:not([data-theme="dark"]) {
          --se-bg-primary: rgba(255, 255, 255, 0.95);
          --se-bg-secondary: #f5f5f7;
          --se-bg-input: #ffffff;
          --se-bg-button: #e8e8ed;
          --se-text-primary: #1c1c1e;
          --se-text-secondary: #2c2c2e;
          --se-text-muted: #6c6c70;
          --se-text-label: #3a3a3c;
          --se-border-color: rgba(0, 0, 0, 0.1);
          --se-border-light: rgba(0, 0, 0, 0.12);
          --se-border-medium: rgba(0, 0, 0, 0.15);
          --se-border-pill: rgba(0, 0, 0, 0.15);
          --se-shadow: rgba(0, 0, 0, 0.15);
          --se-shadow-panel: rgba(0, 0, 0, 0.2);
          --se-overlay: rgba(0, 0, 0, 0.35);
          --se-active-border: #007aff;
          --se-active-shadow: rgba(0, 122, 255, 0.3);
          --se-primary-bg: #007aff;
          --se-danger-bg: #ff3b30;
          --se-danger-border: #ff3b30;
        }
      }
      #${ROOT_ID} {
        position: fixed;
        z-index: 2147483646;
        max-width: min(96vw, 860px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        user-select: none;
      }
      #${ROOT_ID}.hidden {
        display: none;
      }
      #${ROOT_ID} .se-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--se-bg-primary);
        border: 1px solid var(--se-border-color);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 8px 26px var(--se-shadow);
        backdrop-filter: blur(6px);
      }
      #${ROOT_ID} .se-list {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      #${ROOT_ID} .se-list::-webkit-scrollbar {
        display: none;
      }
      #${ROOT_ID} .se-pill,
      #${ROOT_ID} .se-btn {
        border: 1px solid var(--se-border-pill);
        background: var(--se-bg-button);
        color: var(--se-text-primary);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        white-space: nowrap;
      }
      #${ROOT_ID} .se-pill.active {
        border-color: var(--se-active-border);
        box-shadow: 0 0 0 1px var(--se-active-shadow) inset;
      }
      #${ROOT_ID} .se-btn {
        width: 34px;
        min-width: 34px;
        height: 30px;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      #${PANEL_ID} {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        background: var(--se-overlay);
        display: none;
        align-items: center;
        justify-content: center;
      }
      #${PANEL_ID}.show {
        display: flex;
      }
      #${PANEL_ID} .panel {
        width: min(96vw, 720px);
        max-height: 90vh;
        overflow: auto;
        overscroll-behavior: contain;
        background: var(--se-bg-secondary);
        color: var(--se-text-secondary);
        border-radius: 14px;
        border: 1px solid var(--se-border-light);
        box-shadow: 0 18px 48px var(--se-shadow-panel);
        padding: 14px;
        font-size: 14px;
      }
      #${PANEL_ID} .panel h3 {
        margin: 0 0 10px 0;
        font-size: 16px;
      }
      #${PANEL_ID} .sub {
        margin: 12px 0 8px;
        font-weight: 600;
      }
      #${PANEL_ID} .engine-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        padding: 8px;
        border: 1px solid var(--se-border-color);
        border-radius: 10px;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .engine-row.hidden-engine {
        opacity: 0.6;
        background: var(--se-bg-button);
      }
      #${PANEL_ID} .muted {
        color: var(--se-text-muted);
        font-size: 12px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      #${PANEL_ID} .ops {
        display: flex;
        gap: 6px;
      }
      #${PANEL_ID} button,
      #${PANEL_ID} input,
      #${PANEL_ID} select,
      #${PANEL_ID} textarea {
        font: inherit;
      }
      #${PANEL_ID} .op,
      #${PANEL_ID} .primary,
      #${PANEL_ID} .danger,
      #${PANEL_ID} .ghost {
        border-radius: 8px;
        border: 1px solid var(--se-border-medium);
        background: var(--se-bg-button);
        color: var(--se-text-primary);
        padding: 6px 10px;
        cursor: pointer;
      }
      #${PANEL_ID} .primary {
        background: var(--se-primary-bg);
        border-color: var(--se-primary-bg);
        color: #fff;
      }
      #${PANEL_ID} .danger {
        background: var(--se-danger-bg);
        border-color: var(--se-danger-border);
        color: #fff;
      }
      #${PANEL_ID} .ghost {
        background: transparent;
      }
      #${PANEL_ID} .grid2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
      }
      #${PANEL_ID} .form {
        border: 1px solid var(--se-border-color);
        border-radius: 10px;
        padding: 10px;
        margin-top: 8px;
      }
      #${PANEL_ID} label {
        display: block;
        font-size: 12px;
        margin-bottom: 4px;
        color: var(--se-text-label);
      }
      #${PANEL_ID} input,
      #${PANEL_ID} select {
        width: 100%;
        box-sizing: border-box;
        background: var(--se-bg-input);
        border: 1px solid var(--se-border-light);
        color: var(--se-text-primary);
        border-radius: 8px;
        padding: 6px 8px;
      }
      #${PANEL_ID} .panel-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 14px;
      }
      @media (max-width: 560px) {
        #${ROOT_ID} {
          max-width: 98vw;
        }
        #${ROOT_ID} .se-pill {
          font-size: 12px;
          padding: 6px 10px;
        }
      }
    `;
    document.documentElement.appendChild(style);
  }

  function getCurrentQuery() {
    const url = new URL(location.href);
    const keys = ['q', 'wd', 'word', 'query', 'text', 'keyword', 'search', 'p', 'k'];

    for (const key of keys) {
      const v = url.searchParams.get(key);
      if (v && v.trim()) return v.trim();
    }

    if (url.hash.includes('=')) {
      const hashText = url.hash.replace(/^#/, '');
      const hashParams = new URLSearchParams(hashText);
      for (const key of keys) {
        const v = hashParams.get(key);
        if (v && v.trim()) return v.trim();
      }
    }

    const sel = String(window.getSelection && window.getSelection()).trim();
    if (sel) return sel;

    const focused = document.activeElement;
    if (focused && focused.tagName === 'INPUT') {
      const input = focused;
      const v = typeof input.value === 'string' ? input.value.trim() : '';
      if (v) return v;
    }

    return '';
  }

  function activeEngineIdByHost() {
    const host = location.hostname;
    const exact = config.engines.find((e) => (e.hosts || []).some((h) => host.includes(h)));
    return exact ? exact.id : '';
  }

  function getEngineById(id) {
    return config.engines.find((e) => e.id === id) || null;
  }

  function buildSearchUrl(engine, query) {
    return engine.searchUrl.replace('{q}', encodeURIComponent(query));
  }

  async function resolveQuery() {
    let q = getCurrentQuery();
    if (q) return q.trim();

    q = prompt('输入搜索关键词');
    return q ? q.trim() : '';
  }

  function applyRootPosition(root) {
    const ui = config.ui;
    root.style.left = '';
    root.style.right = '';
    root.style.top = '';
    root.style.bottom = '';
    root.style.transform = '';

    if (ui.useCustomXY) {
      root.style.left = `${Math.max(0, ui.customX)}px`;
      root.style.top = `${Math.max(0, ui.customY)}px`;
      return;
    }

    // 垂直位置
    if (ui.vertical === 'top') {
      root.style.top = `${Math.max(0, ui.offsetY)}px`;
    } else {
      root.style.bottom = `${Math.max(0, ui.offsetY)}px`;
    }

    // 水平位置：默认居中
    if (ui.align === 'left') {
      root.style.left = `${Math.max(0, ui.offsetX)}px`;
    } else if (ui.align === 'right') {
      root.style.right = `${Math.max(0, ui.offsetX)}px`;
    } else {
      // 居中（默认）
      root.style.left = '50%';
      root.style.transform = 'translateX(-50%)';
    }
  }

  function createRoot() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement('div');
    root.id = ROOT_ID;
    root.innerHTML = `
      <div class="se-wrap">
        <div class="se-list" id="${ROOT_ID}-list"></div>
        <button class="se-btn" id="${ROOT_ID}-settings" title="设置">⚙</button>
      </div>
    `;
    document.documentElement.appendChild(root);
    applyRootPosition(root);

    const settingsBtn = root.querySelector(`#${ROOT_ID}-settings`);
    settingsBtn.addEventListener('click', () => openPanel());

    let holdTimer = null;
    root.addEventListener('pointerdown', (e) => {
      if (e.target && e.target.closest('.se-pill')) return;
      holdTimer = setTimeout(() => openPanel(), 500);
    });
    root.addEventListener('pointerup', () => {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
    });
    root.addEventListener('pointerleave', () => {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = null;
    });

    return root;
  }

  function isSearchPage() {
    const host = location.hostname;
    const isSearchEngine = config.engines.some((e) => (e.hosts || []).some((h) => host.includes(h)));
    if (!isSearchEngine) return false;
    const query = getCurrentQuery();
    return !!query;
  }

  function renderEngineButtons() {
    const root = createRoot();
    const list = root.querySelector(`#${ROOT_ID}-list`);
    list.innerHTML = '';

    const q = getCurrentQuery();

    // 无关键词时根据设置决定是否显示
    if (!q && !config.ui.showWhenNoQuery) {
      root.classList.add('hidden');
      return;
    }

    const activeId = activeEngineIdByHost();
    root.classList.remove('hidden');
    for (const engine of config.engines) {
      if (engine.hidden) continue;
      const btn = document.createElement('button');
      btn.className = 'se-pill';
      if (engine.id === activeId) btn.classList.add('active');
      btn.textContent = engine.name;
      btn.title = `${engine.name}\n${engine.searchUrl}`;
      btn.addEventListener('click', async () => {
        const query = await resolveQuery();
        if (!query) return;
        const url = buildSearchUrl(engine, query);
        if (config.ui.openInNewTab) {
          window.open(url, '_blank');
        } else {
          location.href = url;
        }
      });
      list.appendChild(btn);
    }
  }

  function createPanel() {
    let overlay = document.getElementById(PANEL_ID);
    if (overlay) return overlay;

    overlay = document.createElement('div');
    overlay.id = PANEL_ID;
    overlay.innerHTML = `<div class="panel"></div>`;
    document.documentElement.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePanel();
    });

    return overlay;
  }

  function editEngine(existing) {
    const name = prompt('搜索引擎名称', existing ? existing.name : '');
    if (name == null) return;

    const searchUrl = prompt('搜索 URL（必须包含 {q}）', existing ? existing.searchUrl : 'https://example.com/search?q={q}');
    if (searchUrl == null) return;

    if (!searchUrl.includes('{q}')) {
      alert('URL 必须包含 {q} 占位符');
      return;
    }

    const hostsRaw = prompt('识别当前引擎的域名（可选，逗号分隔）', existing ? (existing.hosts || []).join(',') : '');
    if (hostsRaw == null) return;

    const hosts = hostsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (existing) {
      existing.name = name.trim() || existing.name;
      existing.searchUrl = searchUrl.trim();
      existing.hosts = hosts;
    } else {
      config.engines.push({
        id: uid(),
        name: name.trim() || '未命名',
        searchUrl: searchUrl.trim(),
        hosts
      });
    }

    saveConfig(config);
    renderPanel();
    renderEngineButtons();
  }

  function moveEngine(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= config.engines.length) return;
    const tmp = config.engines[index];
    config.engines[index] = config.engines[target];
    config.engines[target] = tmp;
    saveConfig(config);
    renderPanel();
    renderEngineButtons();
  }

  function deleteEngine(index) {
    if (config.engines.length <= 1) {
      alert('至少保留一个搜索引擎');
      return;
    }
    const item = config.engines[index];
    const ok = confirm(`确定删除 ${item.name} 吗？`);
    if (!ok) return;
    config.engines.splice(index, 1);
    saveConfig(config);
    renderPanel();
    renderEngineButtons();
  }

  function toggleEngineVisibility(index) {
    const engine = config.engines[index];
    if (!engine) return;
    engine.hidden = !engine.hidden;
    saveConfig(config);
    renderPanel();
    renderEngineButtons();
  }

  function startDragPositioning() {
    const root = createRoot();
    config.ui.useCustomXY = true;
    saveConfig(config);
    applyRootPosition(root);

    alert('拖动切换器到你想要的位置，松开后自动保存');

    root.style.cursor = 'move';

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = config.ui.customX;
    let originY = config.ui.customY;

    function onDown(e) {
      if (e.target && e.target.closest('.se-pill')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originX = config.ui.customX;
      originY = config.ui.customY;
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      e.preventDefault();
    }

    function onMove(e) {
      if (!dragging) return;
      config.ui.customX = Math.max(0, originX + (e.clientX - startX));
      config.ui.customY = Math.max(0, originY + (e.clientY - startY));
      applyRootPosition(root);
    }

    function onUp() {
      dragging = false;
      saveConfig(config);
      renderPanel();
      root.style.cursor = '';
      root.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
    }

    root.addEventListener('pointerdown', onDown);
  }

  function renderPanel() {
    const overlay = createPanel();
    const panel = overlay.querySelector('.panel');

    const engineRows = config.engines
      .map(
        (e, i) => `
      <div class="engine-row ${e.hidden ? 'hidden-engine' : ''}" data-index="${i}">
        <div>
          <div><strong>${escapeHtml(e.name)}${e.hidden ? ' <span class="muted">(已隐藏)</span>' : ''}</strong></div>
          <div class="muted">${escapeHtml(e.searchUrl)}</div>
          <div class="muted">识别域名: ${escapeHtml((e.hosts || []).join(', ') || '(空)')}</div>
        </div>
        <div class="ops">
          <button class="op" data-act="up">↑</button>
          <button class="op" data-act="down">↓</button>
          <button class="op" data-act="edit">编辑</button>
          <button class="op" data-act="${e.hidden ? 'show' : 'hide'}">${e.hidden ? '显示' : '隐藏'}</button>
          <button class="danger" data-act="del">删除</button>
        </div>
      </div>
    `
      )
      .join('');

    panel.innerHTML = `
      <h3>搜索引擎切换器设置</h3>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>引擎列表（支持新增 / 删除 / 排序 / 隐藏）</span>
        <button class="ghost" id="se-reset-engines" style="padding:4px 8px; font-size:12px;">恢复默认</button>
      </div>
      <div>${engineRows}</div>
      <div style="margin-top:8px;">
        <button class="primary" id="se-add">新增搜索引擎</button>
      </div>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>显示位置</span>
        <button class="ghost" id="se-reset-position" style="padding:4px 8px; font-size:12px;">恢复默认</button>
      </div>
      <div class="grid2">
        <div>
          <label>定位模式</label>
          <select id="se-pos-mode">
            <option value="preset" ${!config.ui.useCustomXY ? 'selected' : ''}>预设位置</option>
            <option value="custom" ${config.ui.useCustomXY ? 'selected' : ''}>自定义坐标</option>
          </select>
        </div>
        <div>
          <label>垂直位置</label>
          <select id="se-vertical">
            <option value="bottom" ${config.ui.vertical === 'bottom' ? 'selected' : ''}>底部</option>
            <option value="top" ${config.ui.vertical === 'top' ? 'selected' : ''}>顶部</option>
          </select>
        </div>
        <div>
          <label>水平对齐</label>
          <select id="se-align">
            <option value="left" ${config.ui.align === 'left' ? 'selected' : ''}>左</option>
            <option value="center" ${config.ui.align === 'center' ? 'selected' : ''}>中</option>
            <option value="right" ${config.ui.align === 'right' ? 'selected' : ''}>右</option>
          </select>
        </div>
        <div>
          <label>水平偏移(px)</label>
          <input type="number" id="se-offset-x" value="${Number(config.ui.offsetX) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>垂直偏移(px)</label>
          <input type="number" id="se-offset-y" value="${Number(config.ui.offsetY) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>自定义 X(px)</label>
          <input type="number" id="se-custom-x" value="${Number(config.ui.customX) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>自定义 Y(px)</label>
          <input type="number" id="se-custom-y" value="${Number(config.ui.customY) || 0}" min="0" step="1" />
        </div>
      </div>
      <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="op" id="se-drag">拖拽定位</button>
      </div>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>行为选项</span>
        <button class="ghost" id="se-reset-behavior" style="padding:4px 8px; font-size:12px;">恢复默认</button>
      </div>
      <div class="grid2">
        <div>
          <label>无关键词时</label>
          <select id="se-show-no-query">
            <option value="1" ${config.ui.showWhenNoQuery ? 'selected' : ''}>仍然显示切换器</option>
            <option value="0" ${!config.ui.showWhenNoQuery ? 'selected' : ''}>隐藏切换器</option>
          </select>
        </div>
        <div>
          <label>打开方式</label>
          <select id="se-open-way">
            <option value="0" ${!config.ui.openInNewTab ? 'selected' : ''}>当前标签页</option>
            <option value="1" ${config.ui.openInNewTab ? 'selected' : ''}>新标签页</option>
          </select>
        </div>
        <div>
          <label>主题模式</label>
          <select id="se-theme">
            <option value="auto" ${config.ui.theme === 'auto' ? 'selected' : ''}>跟随系统</option>
            <option value="light" ${config.ui.theme === 'light' ? 'selected' : ''}>浅色</option>
            <option value="dark" ${config.ui.theme === 'dark' ? 'selected' : ''}>深色</option>
          </select>
        </div>
      </div>

      <div class="panel-footer">
        <button class="ghost" id="se-close">关闭</button>
        <button class="primary" id="se-save">保存设置</button>
      </div>
    `;

    panel.querySelectorAll('.engine-row').forEach((row) => {
      row.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof HTMLElement)) return;
        const actionEl = target.closest('[data-act]');
        if (!actionEl) return;

        const index = Number(row.getAttribute('data-index'));
        const act = actionEl.getAttribute('data-act');

        if (act === 'up') moveEngine(index, -1);
        if (act === 'down') moveEngine(index, 1);
        if (act === 'edit') editEngine(config.engines[index]);
        if (act === 'del') deleteEngine(index);
        if (act === 'hide' || act === 'show') toggleEngineVisibility(index);
      });
    });

    panel.querySelector('#se-add').addEventListener('click', () => editEngine(null));

    // 恢复默认 - 引擎列表
    panel.querySelector('#se-reset-engines').addEventListener('click', () => {
      if (!confirm('确定恢复默认搜索引擎列表吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.engines = reset.engines;
      saveConfig(config);
      renderPanel();
      renderEngineButtons();
    });

    // 恢复默认 - 显示位置
    panel.querySelector('#se-reset-position').addEventListener('click', () => {
      if (!confirm('确定恢复默认显示位置吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.ui.vertical = reset.ui.vertical;
      config.ui.align = reset.ui.align;
      config.ui.offsetX = reset.ui.offsetX;
      config.ui.offsetY = reset.ui.offsetY;
      config.ui.useCustomXY = reset.ui.useCustomXY;
      config.ui.customX = reset.ui.customX;
      config.ui.customY = reset.ui.customY;
      saveConfig(config);
      applyRootPosition(createRoot());
      renderPanel();
    });

    // 恢复默认 - 行为选项
    panel.querySelector('#se-reset-behavior').addEventListener('click', () => {
      if (!confirm('确定恢复默认行为选项吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.ui.showWhenNoQuery = reset.ui.showWhenNoQuery;
      config.ui.openInNewTab = reset.ui.openInNewTab;
      config.ui.theme = reset.ui.theme;
      saveConfig(config);
      applyTheme();
      renderPanel();
    });

    panel.querySelector('#se-drag').addEventListener('click', () => {
      closePanel();
      startDragPositioning();
    });

    panel.querySelector('#se-close').addEventListener('click', closePanel);
    panel.querySelector('#se-save').addEventListener('click', () => {
      const posMode = panel.querySelector('#se-pos-mode').value;
      const vertical = panel.querySelector('#se-vertical').value;
      const align = panel.querySelector('#se-align').value;
      const offsetX = Number(panel.querySelector('#se-offset-x').value) || 0;
      const offsetY = Number(panel.querySelector('#se-offset-y').value) || 0;
      const customX = Number(panel.querySelector('#se-custom-x').value) || 0;
      const customY = Number(panel.querySelector('#se-custom-y').value) || 0;
      const showNoQuery = panel.querySelector('#se-show-no-query').value === '1';
      const openInNewTab = panel.querySelector('#se-open-way').value === '1';
      const theme = panel.querySelector('#se-theme').value;

      config.ui.useCustomXY = posMode === 'custom';
      config.ui.vertical = vertical === 'top' ? 'top' : 'bottom';
      config.ui.theme = ['light', 'dark'].includes(theme) ? theme : 'auto';
      config.ui.align = ['left', 'center', 'right'].includes(align) ? align : 'center';
      config.ui.offsetX = Math.max(0, offsetX);
      config.ui.offsetY = Math.max(0, offsetY);
      config.ui.customX = Math.max(0, customX);
      config.ui.customY = Math.max(0, customY);
      config.ui.showWhenNoQuery = showNoQuery;
      config.ui.openInNewTab = openInNewTab;

      saveConfig(config);
      applyRootPosition(createRoot());
      applyTheme();
      renderEngineButtons();
      closePanel();
    });
  }

  function openPanel() {
    renderPanel();
    const overlay = createPanel();
    overlay.classList.add('show');

    // 阻止面板滚动影响下方网页
    const panel = overlay.querySelector('.panel');
    if (panel) {
      panel.addEventListener('wheel', (e) => {
        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;
        const isAtTop = panel.scrollTop === 0;
        const isAtBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 1;

        // 如果在顶部继续向上滚动，或在底部继续向下滚动，阻止事件
        if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
          e.preventDefault();
        }
      }, { passive: false });

      // 阻止 touchmove 事件冒泡
      panel.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
  }

  function closePanel() {
    const overlay = createPanel();
    overlay.classList.remove('show');
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function init() {
    injectStyle();
    applyTheme();
    createRoot();
    renderEngineButtons();

    if (typeof GM_registerMenuCommand === 'function') {
      GM_registerMenuCommand('搜索引擎切换器设置', openPanel);
      GM_registerMenuCommand('搜索引擎切换器开关', () => {
        const root = createRoot();
        root.classList.toggle('hidden');
      });
    }

    window.addEventListener('popstate', renderEngineButtons);
    window.addEventListener('hashchange', renderEngineButtons);

    // Listen for system theme changes when in auto mode
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
      mediaQuery.addEventListener('change', () => {
        if (config.ui.theme === 'auto') {
          applyTheme();
        }
      });
    }

    const observer = new MutationObserver(() => {
      if (!document.getElementById(ROOT_ID)) {
        createRoot();
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    setInterval(renderEngineButtons, 1600);
  }

  init();
})();
