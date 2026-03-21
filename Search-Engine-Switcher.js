// ==UserScript==
// @name         Search Engine Switcher
// @namespace    https://github.com/EchoRan6319/Search-Engine-Switcher
// @version      2.5.1
// @description  快捷搜索引擎切换器：支持新增、删除、排序、位置自定义
// @author       EchoRan6319
// @license      MIT
// @homepageURL  https://github.com/EchoRan6319/Search-Engine-Switcher
// @supportURL   https://github.com/EchoRan6319/Search-Engine-Switcher/issues
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  if (window !== window.top) return;

  const STORAGE_KEY = 'search_engine_switcher_config_v1';
  const VERSION_KEY = 'search_engine_switcher_version';
  const CURRENT_VERSION = '2.5.1';
  const STYLE_ID = 'search-engine-switcher-style';
  const ROOT_ID = 'search-engine-switcher-root';
  const PANEL_ID = 'search-engine-switcher-panel';

  const DEFAULT_CONFIG = {
    engines: [
      // ========== 国外传统搜索引擎 ==========
      {
        id: 'google',
        name: 'Google',
        searchUrl: 'https://www.google.com/search?q={q}',
        hosts: ['google.', 'www.google.'],
        hidden: false
      },
      {
        id: 'bing',
        name: 'Bing',
        searchUrl: 'https://www.bing.com/search?q={q}',
        hosts: ['bing.com', 'www.bing.com', 'cn.bing.com'],
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
        hosts: ['baidu.com', 'www.baidu.com'],
        hidden: false
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
        name: '千问',
        searchUrl: 'https://www.qianwen.com/?q={q}',
        hosts: ['qianwen.com', 'www.qianwen.com'],
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
        hidden: true,
        disableWidget: true
      },
      {
        id: 'github',
        name: 'GitHub',
        searchUrl: 'https://github.com/search?q={q}',
        hosts: ['github.com'],
        hidden: true,
        disableWidget: true
      },
      // ========== 国内社交/社区 ==========
      {
        id: 'bilibili',
        name: '哔哩哔哩',
        searchUrl: 'https://search.bilibili.com/all?keyword={q}',
        hosts: ['search.bilibili.com', 'bilibili.com', 'www.bilibili.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'zhihu',
        name: '知乎',
        searchUrl: 'https://www.zhihu.com/search?q={q}',
        hosts: ['zhihu.com', 'www.zhihu.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'xiaohongshu',
        name: '小红书',
        searchUrl: 'https://www.xiaohongshu.com/search_result?keyword={q}',
        hosts: ['xiaohongshu.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'douyin',
        name: '抖音',
        searchUrl: 'https://www.douyin.com/search/{q}',
        hosts: ['douyin.com', 'www.douyin.com'],
        hidden: true,
        disableWidget: true
      },
      {
        id: 'weixin',
        name: '微信',
        searchUrl: 'https://weixin.sogou.com/weixin?type=2&s_from=input&query={q}',
        hosts: ['weixin.sogou.com'],
        hidden: true,
        disableWidget: true
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
          hidden: !!e.hidden,
          disableWidget: !!e.disableWidget
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

  function isLightTheme() {
    const theme = config.ui.theme || 'auto';
    if (theme === 'light') return true;
    if (theme === 'dark') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  }

  function applyTheme() {
    const theme = config.ui.theme || 'auto';
    const root = document.documentElement;
    if (theme === 'dark') {
      root.removeAttribute('data-theme');
    } else if (isLightTheme()) {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      :root {
        --ses-bg-primary: rgba(16, 16, 16, 0.92);
        --ses-bg-secondary: #101114;
        --ses-bg-input: #151820;
        --ses-bg-button: #4a4a4a;
        --ses-text-primary: #fff;
        --ses-text-secondary: #f3f3f3;
        --ses-text-muted: #9fa6b2;
        --ses-text-label: #aeb6c2;
        --ses-border-color: rgba(255, 255, 255, 0.12);
        --ses-border-light: rgba(255, 255, 255, 0.14);
        --ses-border-medium: rgba(255, 255, 255, 0.16);
        --ses-border-pill: rgba(255, 255, 255, 0.2);
        --ses-shadow: rgba(0, 0, 0, 0.32);
        --ses-shadow-panel: rgba(0, 0, 0, 0.35);
        --ses-overlay: rgba(0, 0, 0, 0.45);
        --ses-active-border: #7ea1ff;
        --ses-active-shadow: rgba(126, 161, 255, 0.35);
        --ses-primary-bg: #2e5fff;
        --ses-danger-bg: #6b2026;
        --ses-danger-border: #9f3540;
      }
      [data-theme="light"] {
        color-scheme: light;
        --ses-bg-primary: rgba(255, 255, 255, 0.95);
        --ses-bg-secondary: #f5f5f7;
        --ses-bg-input: #ffffff;
        --ses-bg-button: #e8e8ed;
        --ses-text-primary: #1c1c1e;
        --ses-text-secondary: #2c2c2e;
        --ses-text-muted: #6c6c70;
        --ses-text-label: #3a3a3c;
        --ses-border-color: rgba(0, 0, 0, 0.1);
        --ses-border-light: rgba(0, 0, 0, 0.12);
        --ses-border-medium: rgba(0, 0, 0, 0.15);
        --ses-border-pill: rgba(0, 0, 0, 0.15);
        --ses-shadow: rgba(0, 0, 0, 0.15);
        --ses-shadow-panel: rgba(0, 0, 0, 0.2);
        --ses-overlay: rgba(0, 0, 0, 0.35);
        --ses-active-border: #007aff;
        --ses-active-shadow: rgba(0, 122, 255, 0.3);
        --ses-primary-bg: #007aff;
        --ses-danger-bg: #ff3b30;
        --ses-danger-border: #ff3b30;
      }
      @media (prefers-color-scheme: light) {
        :root:not([data-theme="dark"]) {
          color-scheme: light;
          --ses-bg-primary: rgba(255, 255, 255, 0.95);
          --ses-bg-secondary: #f5f5f7;
          --ses-bg-input: #ffffff;
          --ses-bg-button: #e8e8ed;
          --ses-text-primary: #1c1c1e;
          --ses-text-secondary: #2c2c2e;
          --ses-text-muted: #6c6c70;
          --ses-text-label: #3a3a3c;
          --ses-border-color: rgba(0, 0, 0, 0.1);
          --ses-border-light: rgba(0, 0, 0, 0.12);
          --ses-border-medium: rgba(0, 0, 0, 0.15);
          --ses-border-pill: rgba(0, 0, 0, 0.15);
          --ses-shadow: rgba(0, 0, 0, 0.15);
          --ses-shadow-panel: rgba(0, 0, 0, 0.2);
          --ses-overlay: rgba(0, 0, 0, 0.35);
          --ses-active-border: #007aff;
          --ses-active-shadow: rgba(0, 122, 255, 0.3);
          --ses-primary-bg: #007aff;
          --ses-danger-bg: #ff3b30;
          --ses-danger-border: #ff3b30;
        }
      }
      #${ROOT_ID} {
        position: fixed;
        z-index: 2147483646;
        max-width: min(96vw, 860px);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
        user-select: none;
        box-sizing: border-box;
        forced-color-adjust: none;
      }
      #${ROOT_ID}.hidden {
        display: none;
      }
      #${ROOT_ID} .ses-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        background: var(--ses-bg-primary);
        border: 1px solid var(--ses-border-color);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 8px 26px var(--ses-shadow);
        backdrop-filter: blur(6px);
        width: 100%;
        box-sizing: border-box;
      }
      #${ROOT_ID} .ses-list {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        flex: 1;
        mask-image: linear-gradient(to right, transparent 0%, #000 10px, #000 calc(100% - 10px), transparent 100%);
        -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 10px, #000 calc(100% - 10px), transparent 100%);
        padding-right: 10px;
        padding-left: 10px;
      }
      #${ROOT_ID} .ses-list::-webkit-scrollbar {
        display: none;
      }
      #${ROOT_ID} .ses-pill,
      #${ROOT_ID} .ses-btn {
        border: 1px solid var(--ses-border-pill);
        background: var(--ses-bg-button);
        color: var(--ses-text-primary);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
      }
      #${ROOT_ID} .ses-pill.active {
        /* 激活描边由 JS inline style 控制，以防止 Dark Reader 篡改 */
      }
      #${ROOT_ID} .ses-btn {
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
        background: var(--ses-overlay);
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
        background: var(--ses-bg-secondary);
        color: var(--ses-text-secondary);
        border-radius: 14px;
        border: 1px solid var(--ses-border-light);
        box-shadow: 0 18px 48px var(--ses-shadow-panel);
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
        border: 1px solid var(--ses-border-color);
        border-radius: 10px;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .engine-row.hidden-engine {
        opacity: 0.6;
        background: var(--ses-bg-button);
      }
      #${PANEL_ID} .muted {
        color: var(--ses-text-muted);
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
        border: 1px solid var(--ses-border-medium);
        background: var(--ses-bg-button);
        color: var(--ses-text-primary);
        padding: 6px 10px;
        cursor: pointer;
      }
      #${PANEL_ID} .primary {
        background: var(--ses-primary-bg);
        border-color: var(--ses-primary-bg);
        color: #fff;
      }
      #${PANEL_ID} .danger {
        background: var(--ses-danger-bg);
        border-color: var(--ses-danger-border);
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
        border: 1px solid var(--ses-border-color);
        border-radius: 10px;
        padding: 10px;
        margin-top: 8px;
      }
      #${PANEL_ID} label {
        display: block;
        font-size: 12px;
        margin-bottom: 4px;
        color: var(--ses-text-label);
      }
      #${PANEL_ID} input,
      #${PANEL_ID} select {
        width: 100%;
        box-sizing: border-box;
        background: var(--ses-bg-input);
        border: 1px solid var(--ses-border-light);
        color: var(--ses-text-primary);
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
        #${ROOT_ID} .ses-pill {
          font-size: 12px;
          padding: 6px 10px;
        }
        #${PANEL_ID} .engine-row {
          display: flex;
          flex-direction: column;
        }
        #${PANEL_ID} .ops {
          justify-content: flex-start;
        }
        #${PANEL_ID} .op,
        #${PANEL_ID} .danger {
          padding: 7px 10px;
          min-width: 52px;
          text-align: center;
        }
        #${PANEL_ID} .grid2 {
          grid-template-columns: 1fr;
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

  function isMatchHost(host, h) {
    if (h.endsWith('.')) {
      return host === h.slice(0, -1) || host.startsWith(h) || host.includes('.' + h);
    }
    return host === h || host.endsWith('.' + h);
  }

  function activeEngineIdByHost() {
    const host = location.hostname;
    const exact = config.engines.find((e) => (e.hosts || []).some((h) => isMatchHost(host, h)));
    return exact ? exact.id : '';
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
      <div class="ses-wrap">
        <div class="ses-list" id="${ROOT_ID}-list"></div>
        <button class="ses-btn" id="${ROOT_ID}-settings" title="设置">⚙</button>
      </div>
    `;
    document.documentElement.appendChild(root);
    applyRootPosition(root);

    const list = root.querySelector(`#${ROOT_ID}-list`);
    // 支持鼠标滚轮横向滚动（针对桌面端）
    list.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        list.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    const settingsBtn = root.querySelector(`#${ROOT_ID}-settings`);
    settingsBtn.addEventListener('click', () => openPanel());

    let holdTimer = null;
    root.addEventListener('pointerdown', (e) => {
      if (e.target && e.target.closest('.ses-pill')) return;
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


  function renderEngineButtons() {
    const root = createRoot();
    const list = root.querySelector(`#${ROOT_ID}-list`);
    list.innerHTML = '';

    // 只在未禁用的搜索引擎页面上显示
    const host = location.hostname;
    const currentEngine = config.engines.find((e) => (e.hosts || []).some((h) => isMatchHost(host, h)));
    if (!currentEngine || currentEngine.disableWidget) {
      root.classList.add('hidden');
      return;
    }

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
      btn.className = 'ses-pill';
      if (engine.id === activeId) {
        btn.classList.add('active');
        // 用 inline style 强制设置描边，绕过 Dark Reader 对 CSS 规则的修改
        const light = isLightTheme();
        const borderColor = light ? '#007aff' : '#7ea1ff';
        const shadowColor = light ? 'rgba(0, 122, 255, 0.3)' : 'rgba(126, 161, 255, 0.35)';
        btn.style.setProperty('border-color', borderColor, 'important');
        btn.style.setProperty('box-shadow', `0 0 0 1px ${shadowColor} inset`, 'important');
      }
      btn.textContent = engine.name;
      btn.title = `${engine.name}\n${engine.searchUrl}`;

      const handleAction = async (openInNewTabOverride) => {
        const query = await resolveQuery();
        if (!query) return;
        const url = buildSearchUrl(engine, query);
        const shouldOpenNewTab = openInNewTabOverride !== undefined ? openInNewTabOverride : config.ui.openInNewTab;
        if (shouldOpenNewTab) {
          window.open(url, '_blank');
        } else {
          location.href = url;
        }
      };

      btn.addEventListener('click', (e) => {
        if (e.button === 0) { // 左键
          handleAction();
        }
      });

      // 阻止中键默认的自动滚动行为
      btn.addEventListener('mousedown', (e) => {
        if (e.button === 1) {
          e.preventDefault();
        }
      });

      btn.addEventListener('mouseup', (e) => {
        if (e.button === 1) { // 中键
          e.preventDefault();
          handleAction(true); // 强制新标签页打开
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

  function toggleWidgetVisibility(index) {
    const engine = config.engines[index];
    if (!engine) return;
    engine.disableWidget = !engine.disableWidget;
    saveConfig(config);
    renderPanel();
    renderEngineButtons();
  }

  function exportConfig() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "search-engine-switcher-config.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        try {
          const importedData = JSON.parse(event.target.result);
          const mergedConfig = mergeConfig(importedData);

          if (!confirm('确定要覆盖当前配置吗？此操作不可逆！')) return;

          Object.assign(config, mergedConfig);
          saveConfig(config);

          applyRootPosition(createRoot());
          applyTheme();
          renderEngineButtons();
          renderPanel();

          alert('配置导入成功！');
        } catch (error) {
          alert('配置导入失败：无效的 JSON 格式或数据结构。');
          console.error('Import Config Error:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function startDragPositioning() {
    const root = createRoot();
    config.ui.useCustomXY = true;
    saveConfig(config);
    applyRootPosition(root);

    alert('拖动切换器到你想要的位置，松开后自动保存');

    root.style.cursor = 'move';
    root.style.touchAction = 'none';

    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = config.ui.customX;
    let originY = config.ui.customY;

    function onDown(e) {
      if (e.target && e.target.closest('.ses-pill')) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originX = config.ui.customX;
      originY = config.ui.customY;
      if (e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
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

    function onUp(e) {
      dragging = false;
      saveConfig(config);
      renderPanel();
      root.style.cursor = '';
      root.style.touchAction = '';
      if (e && e.target && e.target.releasePointerCapture) {
        try { e.target.releasePointerCapture(e.pointerId); } catch (_) { }
      }
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
          <div><strong>${escapeHtml(e.name)}${e.hidden ? ' <span class="muted">(按钮已隐藏)</span>' : ''}${e.disableWidget ? ' <span class="muted" style="color:var(--ses-danger-border);">(本站禁用悬浮)</span>' : ''}</strong></div>
          <div class="muted">${escapeHtml(e.searchUrl)}</div>
          <div class="muted">识别域名: ${escapeHtml((e.hosts || []).join(', ') || '(空)')}</div>
        </div>
        <div class="ops" style="flex-wrap: wrap;">
          <button class="op" data-act="up">↑</button>
          <button class="op" data-act="down">↓</button>
          <button class="op" data-act="edit">编辑</button>
          <button class="op" data-act="${e.hidden ? 'show' : 'hide'}" title="在切换器面板中显示或隐藏该按钮">${e.hidden ? '显示按钮' : '隐藏按钮'}</button>
          <button class="op" data-act="toggle-widget" title="是否在该搜索引擎的网页中注入并显示悬浮控件">${e.disableWidget ? '启用悬浮' : '禁用悬浮'}</button>
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
        <div style="display:flex; gap:8px;">
          <button class="primary" id="ses-show-guide" style="padding:4px 8px; font-size:12px;">使用指南</button>
          <button class="ghost" id="ses-reset-engines" style="padding:4px 8px; font-size:12px;">恢复默认</button>
        </div>
      </div>
      <div>${engineRows}</div>
      <div style="margin-top:8px; display:flex; gap:8px;">
        <button class="primary" id="ses-add">新增搜索引擎</button>
        <button class="ghost" id="ses-export">导出配置</button>
        <button class="ghost" id="ses-import">导入配置</button>
      </div>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>显示位置</span>
        <button class="ghost" id="ses-reset-position" style="padding:4px 8px; font-size:12px;">恢复默认</button>
      </div>
      <div class="grid2">
        <div>
          <label>定位模式</label>
          <select id="ses-pos-mode">
            <option value="preset" ${!config.ui.useCustomXY ? 'selected' : ''}>预设位置</option>
            <option value="custom" ${config.ui.useCustomXY ? 'selected' : ''}>自定义坐标</option>
          </select>
        </div>
        <div>
          <label>垂直位置</label>
          <select id="ses-vertical">
            <option value="bottom" ${config.ui.vertical === 'bottom' ? 'selected' : ''}>底部</option>
            <option value="top" ${config.ui.vertical === 'top' ? 'selected' : ''}>顶部</option>
          </select>
        </div>
        <div>
          <label>水平对齐</label>
          <select id="ses-align">
            <option value="left" ${config.ui.align === 'left' ? 'selected' : ''}>左</option>
            <option value="center" ${config.ui.align === 'center' ? 'selected' : ''}>中</option>
            <option value="right" ${config.ui.align === 'right' ? 'selected' : ''}>右</option>
          </select>
        </div>
        <div>
          <label>水平偏移(px)</label>
          <input type="number" id="ses-offset-x" value="${Number(config.ui.offsetX) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>垂直偏移(px)</label>
          <input type="number" id="ses-offset-y" value="${Number(config.ui.offsetY) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>自定义 X(px)</label>
          <input type="number" id="ses-custom-x" value="${Number(config.ui.customX) || 0}" min="0" step="1" />
        </div>
        <div>
          <label>自定义 Y(px)</label>
          <input type="number" id="ses-custom-y" value="${Number(config.ui.customY) || 0}" min="0" step="1" />
        </div>
      </div>
      <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="op" id="ses-drag">拖拽定位</button>
      </div>

      <div class="sub" style="display:flex; justify-content:space-between; align-items:center;">
        <span>行为选项</span>
        <button class="ghost" id="ses-reset-behavior" style="padding:4px 8px; font-size:12px;">恢复默认</button>
      </div>
      <div class="grid2">
        <div>
          <label>无关键词时</label>
          <select id="ses-show-no-query">
            <option value="1" ${config.ui.showWhenNoQuery ? 'selected' : ''}>仍然显示切换器</option>
            <option value="0" ${!config.ui.showWhenNoQuery ? 'selected' : ''}>隐藏切换器</option>
          </select>
        </div>
        <div>
          <label>打开方式</label>
          <select id="ses-open-way">
            <option value="0" ${!config.ui.openInNewTab ? 'selected' : ''}>当前标签页</option>
            <option value="1" ${config.ui.openInNewTab ? 'selected' : ''}>新标签页</option>
          </select>
        </div>
        <div>
          <label>主题模式</label>
          <select id="ses-theme">
            <option value="auto" ${config.ui.theme === 'auto' ? 'selected' : ''}>跟随系统</option>
            <option value="light" ${config.ui.theme === 'light' ? 'selected' : ''}>浅色</option>
            <option value="dark" ${config.ui.theme === 'dark' ? 'selected' : ''}>深色</option>
          </select>
        </div>
      </div>

      <div class="panel-footer">
        <button class="ghost" id="ses-close">关闭</button>
        <button class="primary" id="ses-save">保存设置</button>
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
        if (act === 'toggle-widget') toggleWidgetVisibility(index);
      });
    });

    panel.querySelector('#ses-add').addEventListener('click', () => editEngine(null));
    panel.querySelector('#ses-export').addEventListener('click', exportConfig);
    panel.querySelector('#ses-import').addEventListener('click', importConfig);
    panel.querySelector('#ses-show-guide').addEventListener('click', () => showOfflineGuide());

    // 恢复默认 - 引擎列表
    panel.querySelector('#ses-reset-engines').addEventListener('click', () => {
      if (!confirm('确定恢复默认搜索引擎列表吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.engines = reset.engines;
      saveConfig(config);
      renderPanel();
      renderEngineButtons();
    });

    // 恢复默认 - 显示位置
    panel.querySelector('#ses-reset-position').addEventListener('click', () => {
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
    panel.querySelector('#ses-reset-behavior').addEventListener('click', () => {
      if (!confirm('确定恢复默认行为选项吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.ui.showWhenNoQuery = reset.ui.showWhenNoQuery;
      config.ui.openInNewTab = reset.ui.openInNewTab;
      config.ui.theme = reset.ui.theme;
      saveConfig(config);
      applyTheme();
      renderPanel();
    });

    panel.querySelector('#ses-drag').addEventListener('click', () => {
      closePanel();
      startDragPositioning();
    });

    panel.querySelector('#ses-close').addEventListener('click', closePanel);
    panel.querySelector('#ses-save').addEventListener('click', () => {
      const posMode = panel.querySelector('#ses-pos-mode').value;
      const vertical = panel.querySelector('#ses-vertical').value;
      const align = panel.querySelector('#ses-align').value;
      const offsetX = Number(panel.querySelector('#ses-offset-x').value) || 0;
      const offsetY = Number(panel.querySelector('#ses-offset-y').value) || 0;
      const customX = Number(panel.querySelector('#ses-custom-x').value) || 0;
      const customY = Number(panel.querySelector('#ses-custom-y').value) || 0;
      const showNoQuery = panel.querySelector('#ses-show-no-query').value === '1';
      const openInNewTab = panel.querySelector('#ses-open-way').value === '1';
      const theme = panel.querySelector('#ses-theme').value;

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

  function showOfflineGuide() {
    const guideHtml = `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Search Engine Switcher 使用指南</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            background-color: #fff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          h1 { color: #2e5fff; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          h2 { color: #444; margin-top: 30px; }
          ul, ol { padding-left: 20px; }
          li { margin-bottom: 10px; }
          .highlight { background-color: #ffeeba; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
          .btn {
            display: inline-block;
            background-color: #2e5fff;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 8px;
            margin-top: 20px;
            text-align: center;
          }
          .btn:hover { background-color: #1c45d8; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎉 欢迎使用 Search Engine Switcher (v${CURRENT_VERSION})</h1>
          <p>感谢您安装本脚本！为了让您更好地使用，请花 1 分钟阅读以下指南：</p>

          <h2>👀 悬浮窗去哪了？为什么不显示？</h2>
          <p>为了给您提供纯净的排版体验并避免遮挡内容，本脚本的默认机制是：<span class="highlight" style="color:#d9534f;">在未检测到“搜索需求”时，自动隐藏自身。</span></p>

          <p><strong>具体在以下几种情况下，悬浮窗默认会“消失”：</strong></p>
          <ul>
            <li><strong>浏览非引擎的普通网页</strong>：如新闻、博客、百度百科等不在您列表范围内的页面，悬浮窗绝不会多余出现。</li>
            <li><strong>停留在搜索引擎的首页大厅</strong>：当您刚打开 <strong>GitHub、百度、Google 的主页</strong>时，由于您还没有真正输入回车发起搜索，网页网址里并没有“搜索参数”，插件认为此时任务未开始，所以选择保持隐藏。</li>
          </ul>

          <p><strong>什么情况下它会自动“呼出”？</strong></p>
          <ul>
            <li><strong>进入了实际的搜索结果页</strong>：只要您提交了搜索（网址栏能看到带有 <code>q=</code> 或 <code>wd=</code> 等请求参数），它就会马上出现在页面底部供您随时切换。</li>
            <li><strong>用鼠标选中了想搜索的文本</strong>：此时插件检测到你在“划词”，悬浮窗立刻现身让您一键带词去别的引擎查找。</li>
            <li><strong>您的光标在输入框里并敲了字</strong>：此时也等同于有了即将搜索的意图，它也会随时待命弹起。</li>
          </ul>

          <div style="background-color: #f0f7ff; border-left: 4px solid #2e5fff; padding: 12px; margin-top: 16px; border-radius: 4px;">
            <strong style="color: #2e5fff; display: block; margin-bottom: 6px;">💡 觉得这样太麻烦？想要让它在 GitHub 主页也一直保持可见？</strong>
            如果你希望在主页发呆、或者未搜任何词的情况下也<strong>始终能看到这排按钮</strong>，请按以下步骤操作：
            <ol style="margin-bottom: 0;">
              <li>长按一次现有的悬浮窗（或点击小齿轮 ⚙ 图标）唤出设置面板</li>
              <li>向下划动，找到底部的<strong>【行为选项】</strong>分类</li>
              <li>将<strong>【无关键词时】</strong>选项的设定从“隐藏切换器”改为<strong>“仍然显示切换器”</strong></li>
              <li>点击右下角保存设置，它就不会再随意消失了！</li>
            </ol>
          </div>

          <h2>🖱️ 基础操作</h2>
          <ul>
            <li><strong>左键点击：</strong> 直接在当前页面（或根据设置在新标签页）切换到目标搜索引擎。</li>
            <li><strong>鼠标中键点击：</strong> 强制在<span class="highlight">新标签页</span>中打开搜索结果。</li>
            <li><strong>长按悬浮窗 (或点击 ⚙ 按钮)：</strong> 打开设置面板。</li>
          </ul>

          <h2>🚫 为什么 B站/YouTube 也会有悬浮窗？怎么关掉？</h2>
          <p>脚本预设了一些社交/视频类搜索（如 B站、YouTube、知乎）。如果在刷视频时悬浮窗影响了您的体验，您可以：</p>
          <ol>
            <li>打开脚本的<strong>设置面板</strong>。</li>
            <li>在引擎列表中找到对应的网站（例如“哔哩哔哩”）。</li>
            <li>点击列表右侧的 <strong>“禁用悬浮”</strong> 按钮（如果已经是禁用状态则会显示“本站禁用悬浮”红字）。</li>
          </ol>
          <p>这样，该网站就不会再出现悬浮窗了！</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([guideHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }

  function checkFirstInstallOrUpdate() {
    const lastVersion = safeGMGet(VERSION_KEY, null);
    if (lastVersion !== CURRENT_VERSION) {
      safeGMSet(VERSION_KEY, CURRENT_VERSION);
      // 只在安装/更新后的第一次自动弹出
      showOfflineGuide();
    }
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
    checkFirstInstallOrUpdate();
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
