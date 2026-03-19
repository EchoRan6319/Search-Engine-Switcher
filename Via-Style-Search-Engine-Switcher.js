// ==UserScript==
// @name         Via Style Search Engine Switcher
// @namespace    https://example.local/
// @version      1.0.0
// @description  类似 Via 浏览器的搜索引擎切换器：支持新增、删除、排序、位置自定义
// @author       ChatGPT
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @connect      searchapi.api.cloud.yandex.net
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
      {
        id: 'baidu',
        name: '百度',
        searchUrl: 'https://www.baidu.com/s?wd={q}',
        hosts: ['baidu.com']
      },
      {
        id: 'bing',
        name: 'Bing',
        searchUrl: 'https://www.bing.com/search?q={q}',
        hosts: ['bing.com']
      },
      {
        id: 'google',
        name: 'Google',
        searchUrl: 'https://www.google.com/search?q={q}',
        hosts: ['google.']
      },
      {
        id: 'duckduckgo',
        name: 'DuckDuckGo',
        searchUrl: 'https://duckduckgo.com/?q={q}',
        hosts: ['duckduckgo.com']
      },
      {
        id: 'brave',
        name: 'Brave',
        searchUrl: 'https://search.brave.com/search?q={q}',
        hosts: ['search.brave.com']
      },
      {
        id: 'yandex',
        name: 'Yandex',
        searchUrl: 'https://yandex.com/search/?text={q}',
        hosts: ['yandex.']
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
      showWhenNoQuery: true,
      openInNewTab: false
    },
    autoQuery: {
      enabled: false,
      endpoint: 'https://searchapi.api.cloud.yandex.net/v2/web/search',
      authType: 'apikey',
      credential: '',
      folderId: '',
      searchType: 'SEARCH_TYPE_COM',
      l10n: 'LOCALIZATION_EN',
      usePageTitleAsSeed: true
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
          hosts: Array.isArray(e.hosts) ? e.hosts.map((h) => String(h).trim()).filter(Boolean) : []
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
    }

    if (raw.autoQuery && typeof raw.autoQuery === 'object') {
      cfg.autoQuery.enabled = !!raw.autoQuery.enabled;
      cfg.autoQuery.endpoint =
        typeof raw.autoQuery.endpoint === 'string' && raw.autoQuery.endpoint.trim()
          ? raw.autoQuery.endpoint.trim()
          : cfg.autoQuery.endpoint;
      cfg.autoQuery.authType = raw.autoQuery.authType === 'bearer' ? 'bearer' : 'apikey';
      cfg.autoQuery.credential =
        typeof raw.autoQuery.credential === 'string' ? raw.autoQuery.credential.trim() : '';
      cfg.autoQuery.folderId =
        typeof raw.autoQuery.folderId === 'string' ? raw.autoQuery.folderId.trim() : '';
      cfg.autoQuery.searchType =
        typeof raw.autoQuery.searchType === 'string' && raw.autoQuery.searchType.trim()
          ? raw.autoQuery.searchType.trim()
          : cfg.autoQuery.searchType;
      cfg.autoQuery.l10n =
        typeof raw.autoQuery.l10n === 'string' && raw.autoQuery.l10n.trim()
          ? raw.autoQuery.l10n.trim()
          : cfg.autoQuery.l10n;
      cfg.autoQuery.usePageTitleAsSeed = raw.autoQuery.usePageTitleAsSeed !== false;
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

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
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
        background: rgba(16, 16, 16, 0.92);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 16px;
        padding: 8px;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.32);
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
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.06);
        color: #fff;
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 13px;
        line-height: 1;
        cursor: pointer;
        white-space: nowrap;
      }
      #${ROOT_ID} .se-pill.active {
        border-color: #7ea1ff;
        box-shadow: 0 0 0 1px rgba(126, 161, 255, 0.35) inset;
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
        background: rgba(0, 0, 0, 0.45);
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
        background: #101114;
        color: #f3f3f3;
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
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
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        margin-bottom: 8px;
      }
      #${PANEL_ID} .muted {
        color: #9fa6b2;
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
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: #20232a;
        color: #fff;
        padding: 6px 10px;
        cursor: pointer;
      }
      #${PANEL_ID} .primary {
        background: #2e5fff;
        border-color: #2e5fff;
      }
      #${PANEL_ID} .danger {
        background: #6b2026;
        border-color: #9f3540;
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
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 10px;
        padding: 10px;
        margin-top: 8px;
      }
      #${PANEL_ID} label {
        display: block;
        font-size: 12px;
        margin-bottom: 4px;
        color: #aeb6c2;
      }
      #${PANEL_ID} input,
      #${PANEL_ID} select {
        width: 100%;
        box-sizing: border-box;
        background: #151820;
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: #fff;
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

  function decodeEntities(text) {
    const t = document.createElement('textarea');
    t.innerHTML = text;
    return t.value;
  }

  function cleanupQueryText(text) {
    return String(text || '')
      .replace(/\s+/g, ' ')
      .replace(/[|\-_/]+/g, ' ')
      .trim();
  }

  function getAutoSeedText() {
    const selected = String(window.getSelection && window.getSelection()).trim();
    if (selected) return cleanupQueryText(selected);

    const focused = document.activeElement;
    if (focused && focused.tagName === 'INPUT') {
      const inputValue = typeof focused.value === 'string' ? focused.value.trim() : '';
      if (inputValue) return cleanupQueryText(inputValue);
    }

    if (config.autoQuery.usePageTitleAsSeed) {
      const title = cleanupQueryText(document.title);
      if (title) return title;
    }

    const h1 = document.querySelector('h1');
    if (h1) {
      const h1Text = cleanupQueryText(h1.textContent || '');
      if (h1Text) return h1Text;
    }

    return '';
  }

  function gmHttpRequest(options) {
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest !== 'function') {
        reject(new Error('GM_xmlhttpRequest not available'));
        return;
      }

      GM_xmlhttpRequest({
        method: options.method || 'GET',
        url: options.url,
        headers: options.headers || {},
        data: options.data || null,
        timeout: options.timeout || 12000,
        onload: (res) => resolve(res),
        ontimeout: () => reject(new Error('request timeout')),
        onerror: () => reject(new Error('request error'))
      });
    });
  }

  function extractQueryFromRawData(rawData, fallback) {
    const raw = String(rawData || '');
    if (!raw) return fallback;

    const patterns = [
      /<fixq>([\s\S]*?)<\/fixq>/i,
      /<reask>([\s\S]*?)<\/reask>/i,
      /<query>([\s\S]*?)<\/query>/i,
      /<hlword>([\s\S]*?)<\/hlword>/i
    ];

    for (const re of patterns) {
      const m = raw.match(re);
      if (!m || !m[1]) continue;
      const q = cleanupQueryText(decodeEntities(m[1].replace(/<[^>]*>/g, '')));
      if (q) return q;
    }

    return fallback;
  }

  async function getAutoQueryByYandexApi() {
    const aq = config.autoQuery;
    if (!aq.enabled) return '';
    if (!aq.credential || !aq.folderId) return '';

    const seed = getAutoSeedText();
    if (!seed) return '';

    const headers = {
      'Content-Type': 'application/json',
      Authorization: aq.authType === 'bearer' ? `Bearer ${aq.credential}` : `Api-Key ${aq.credential}`
    };

    const payload = {
      query: {
        searchType: aq.searchType || 'SEARCH_TYPE_COM',
        queryText: seed,
        fixTypoMode: 'FIX_TYPO_MODE_ON'
      },
      folderId: aq.folderId,
      l10n: aq.l10n || 'LOCALIZATION_EN',
      responseFormat: 'FORMAT_XML'
    };

    try {
      const response = await gmHttpRequest({
        method: 'POST',
        url: aq.endpoint || 'https://searchapi.api.cloud.yandex.net/v2/web/search',
        headers,
        data: JSON.stringify(payload)
      });

      if (response.status < 200 || response.status >= 300) {
        return seed;
      }

      const data = JSON.parse(response.responseText || '{}');
      return extractQueryFromRawData(data.rawData, seed);
    } catch (_) {
      return seed;
    }
  }

  async function resolveQuery() {
    let q = getCurrentQuery();
    if (q) return q.trim();

    q = await getAutoQueryByYandexApi();
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

    if (ui.vertical === 'top') {
      root.style.top = `${Math.max(0, ui.offsetY)}px`;
    } else {
      root.style.bottom = `${Math.max(0, ui.offsetY)}px`;
    }

    if (ui.align === 'left') {
      root.style.left = `${Math.max(0, ui.offsetX)}px`;
    } else if (ui.align === 'right') {
      root.style.right = `${Math.max(0, ui.offsetX)}px`;
    } else {
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

  function renderEngineButtons() {
    const root = createRoot();
    const list = root.querySelector(`#${ROOT_ID}-list`);
    list.innerHTML = '';

    const activeId = activeEngineIdByHost();
    const query = getCurrentQuery();
    if (!query && !config.ui.showWhenNoQuery) {
      root.classList.add('hidden');
      return;
    }

    root.classList.remove('hidden');
    for (const engine of config.engines) {
      const btn = document.createElement('button');
      btn.className = 'se-pill';
      if (engine.id === activeId) btn.classList.add('active');
      btn.textContent = engine.name;
      btn.title = `${engine.name}\n${engine.searchUrl}`;
      btn.addEventListener('click', async () => {
        const q = await resolveQuery();
        if (!q) return;
        const url = buildSearchUrl(engine, q);
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
      <div class="engine-row" data-index="${i}">
        <div>
          <div><strong>${escapeHtml(e.name)}</strong></div>
          <div class="muted">${escapeHtml(e.searchUrl)}</div>
          <div class="muted">识别域名: ${escapeHtml((e.hosts || []).join(', ') || '(空)')}</div>
        </div>
        <div class="ops">
          <button class="op" data-act="up">↑</button>
          <button class="op" data-act="down">↓</button>
          <button class="op" data-act="edit">编辑</button>
          <button class="danger" data-act="del">删除</button>
        </div>
      </div>
    `
      )
      .join('');

    panel.innerHTML = `
      <h3>搜索引擎切换器设置</h3>

      <div class="sub">引擎列表（支持新增 / 删除 / 排序）</div>
      <div>${engineRows}</div>
      <div style="margin-top:8px;">
        <button class="primary" id="se-add">新增搜索引擎</button>
        <button class="ghost" id="se-reset">恢复默认</button>
      </div>

      <div class="sub">显示位置</div>
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

      <div class="sub">行为选项</div>
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
      </div>

      <div class="sub">自动设定关键词（Yandex Search API v2）</div>
      <div class="grid2">
        <div>
          <label>启用自动设定</label>
          <select id="se-auto-enabled">
            <option value="0" ${!config.autoQuery.enabled ? 'selected' : ''}>关闭</option>
            <option value="1" ${config.autoQuery.enabled ? 'selected' : ''}>开启</option>
          </select>
        </div>
        <div>
          <label>认证类型</label>
          <select id="se-auto-auth-type">
            <option value="apikey" ${config.autoQuery.authType !== 'bearer' ? 'selected' : ''}>Api-Key</option>
            <option value="bearer" ${config.autoQuery.authType === 'bearer' ? 'selected' : ''}>Bearer(IAM)</option>
          </select>
        </div>
        <div>
          <label>凭据（明文保存）</label>
          <input type="password" id="se-auto-credential" value="${escapeHtml(config.autoQuery.credential || '')}" placeholder="Api-Key 或 IAM Token" />
        </div>
        <div>
          <label>folderId</label>
          <input type="text" id="se-auto-folder-id" value="${escapeHtml(config.autoQuery.folderId || '')}" placeholder="b1gxxxxxxxxxxxxxx" />
        </div>
        <div>
          <label>searchType</label>
          <select id="se-auto-search-type">
            <option value="SEARCH_TYPE_COM" ${config.autoQuery.searchType === 'SEARCH_TYPE_COM' ? 'selected' : ''}>SEARCH_TYPE_COM</option>
            <option value="SEARCH_TYPE_RU" ${config.autoQuery.searchType === 'SEARCH_TYPE_RU' ? 'selected' : ''}>SEARCH_TYPE_RU</option>
            <option value="SEARCH_TYPE_TR" ${config.autoQuery.searchType === 'SEARCH_TYPE_TR' ? 'selected' : ''}>SEARCH_TYPE_TR</option>
            <option value="SEARCH_TYPE_KK" ${config.autoQuery.searchType === 'SEARCH_TYPE_KK' ? 'selected' : ''}>SEARCH_TYPE_KK</option>
            <option value="SEARCH_TYPE_BE" ${config.autoQuery.searchType === 'SEARCH_TYPE_BE' ? 'selected' : ''}>SEARCH_TYPE_BE</option>
            <option value="SEARCH_TYPE_UZ" ${config.autoQuery.searchType === 'SEARCH_TYPE_UZ' ? 'selected' : ''}>SEARCH_TYPE_UZ</option>
          </select>
        </div>
        <div>
          <label>l10n</label>
          <select id="se-auto-l10n">
            <option value="LOCALIZATION_EN" ${config.autoQuery.l10n === 'LOCALIZATION_EN' ? 'selected' : ''}>LOCALIZATION_EN</option>
            <option value="LOCALIZATION_RU" ${config.autoQuery.l10n === 'LOCALIZATION_RU' ? 'selected' : ''}>LOCALIZATION_RU</option>
            <option value="LOCALIZATION_TR" ${config.autoQuery.l10n === 'LOCALIZATION_TR' ? 'selected' : ''}>LOCALIZATION_TR</option>
            <option value="LOCALIZATION_UK" ${config.autoQuery.l10n === 'LOCALIZATION_UK' ? 'selected' : ''}>LOCALIZATION_UK</option>
            <option value="LOCALIZATION_BE" ${config.autoQuery.l10n === 'LOCALIZATION_BE' ? 'selected' : ''}>LOCALIZATION_BE</option>
            <option value="LOCALIZATION_KK" ${config.autoQuery.l10n === 'LOCALIZATION_KK' ? 'selected' : ''}>LOCALIZATION_KK</option>
          </select>
        </div>
        <div>
          <label>API 端点</label>
          <input type="text" id="se-auto-endpoint" value="${escapeHtml(config.autoQuery.endpoint || '')}" />
        </div>
        <div>
          <label>页面标题作为种子</label>
          <select id="se-auto-use-title">
            <option value="1" ${config.autoQuery.usePageTitleAsSeed ? 'selected' : ''}>是</option>
            <option value="0" ${!config.autoQuery.usePageTitleAsSeed ? 'selected' : ''}>否</option>
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
      });
    });

    panel.querySelector('#se-add').addEventListener('click', () => editEngine(null));
    panel.querySelector('#se-reset').addEventListener('click', () => {
      if (!confirm('确定恢复默认配置吗？')) return;
      const reset = deepClone(DEFAULT_CONFIG);
      config.engines = reset.engines;
      config.ui = reset.ui;
      config.autoQuery = reset.autoQuery;
      saveConfig(config);
      renderPanel();
      renderEngineButtons();
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
      const autoEnabled = panel.querySelector('#se-auto-enabled').value === '1';
      const autoAuthType = panel.querySelector('#se-auto-auth-type').value;
      const autoCredential = panel.querySelector('#se-auto-credential').value.trim();
      const autoFolderId = panel.querySelector('#se-auto-folder-id').value.trim();
      const autoSearchType = panel.querySelector('#se-auto-search-type').value;
      const autoL10n = panel.querySelector('#se-auto-l10n').value;
      const autoEndpoint = panel.querySelector('#se-auto-endpoint').value.trim();
      const autoUseTitle = panel.querySelector('#se-auto-use-title').value === '1';

      config.ui.useCustomXY = posMode === 'custom';
      config.ui.vertical = vertical === 'top' ? 'top' : 'bottom';
      config.ui.align = ['left', 'center', 'right'].includes(align) ? align : 'center';
      config.ui.offsetX = Math.max(0, offsetX);
      config.ui.offsetY = Math.max(0, offsetY);
      config.ui.customX = Math.max(0, customX);
      config.ui.customY = Math.max(0, customY);
      config.ui.showWhenNoQuery = showNoQuery;
      config.ui.openInNewTab = openInNewTab;
      config.autoQuery.enabled = autoEnabled;
      config.autoQuery.authType = autoAuthType === 'bearer' ? 'bearer' : 'apikey';
      config.autoQuery.credential = autoCredential;
      config.autoQuery.folderId = autoFolderId;
      config.autoQuery.searchType = autoSearchType || 'SEARCH_TYPE_COM';
      config.autoQuery.l10n = autoL10n || 'LOCALIZATION_EN';
      config.autoQuery.endpoint = autoEndpoint || 'https://searchapi.api.cloud.yandex.net/v2/web/search';
      config.autoQuery.usePageTitleAsSeed = autoUseTitle;

      saveConfig(config);
      applyRootPosition(createRoot());
      renderEngineButtons();
      closePanel();
    });
  }

  function openPanel() {
    renderPanel();
    const overlay = createPanel();
    overlay.classList.add('show');
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
