# Search Engine Switcher

一个快捷切换浏览器搜索引擎的油猴脚本，让你在任何网页都能快速切换搜索引擎。

## 界面展示

!\[浅色模式主界面]\(./屏幕截图%202026-03-19%20211230.png null)
!\[深色模式主界面]\(./屏幕截图%202026-03-19%20211207.png null)
!\[设置面板-引擎列表]\(./屏幕截图%202026-03-19%20211317.png null)
!\[设置面板-显示位置]\(./屏幕截图%202026-03-19%20211320.png null)

## 功能特性

- 快速切换搜索引擎，保留当前搜索词
- 支持 22+ 个预设搜索引擎，包括：
  - **传统搜索引擎**：Google、Bing、百度、DuckDuckGo、Brave、Yandex、搜狗、夸克、360搜索
  - **AI 大模型**：ChatGPT、Perplexity、Gemini、通义千问、豆包、DeepSeek、Kimi、秘塔AI
  - **社交/社区**：YouTube、GitHub、哔哩哔哩、知乎、小红书、抖音、微信
- 自定义搜索引擎（添加/删除/排序/隐藏）
- 悬浮控件位置自定义（预设位置或拖拽定位）
- 深浅色主题支持（跟随系统/浅色/深色）
- 新标签页/当前标签页打开方式切换
- 无关键词时显示/隐藏切换器

## 安装使用

### 1. 安装脚本管理器

首先需要在浏览器中安装一个用户脚本管理器：

- **Tampermonkey（推荐）**：<https://www.tampermonkey.net/>
- **Greasemonkey**（Firefox）：<https://addons.mozilla.org/firefox/addon/greasemonkey/>

### 2. 安装脚本

1. 点击 [Via-Style-Search-Engine-Switcher.js](./Via-Style-Search-Engine-Switcher.js) 文件
2. 点击 "Raw" 按钮获取原始代码
3. 脚本管理器会自动识别并提示安装，点击安装即可

### 3. 使用方法

#### 基本使用

- 在任意网页，悬浮控件会显示在页面底部（默认位置）
- 点击搜索引擎名称即可切换到该引擎，自动携带当前搜索词
- 长按悬浮控件或点击 ⚙ 按钮打开设置面板

#### 设置面板

**引擎列表**

- 新增：添加自定义搜索引擎
- 删除：移除不需要的搜索引擎
- 排序：使用 ↑ ↓ 按钮调整顺序
- 隐藏/显示：控制搜索引擎是否在悬浮控件中显示
- 恢复默认：重置为预设搜索引擎列表

**显示位置**

- 定位模式：预设位置或自定义坐标
- 垂直位置：顶部或底部
- 水平对齐：左、中、右
- 水平/垂直偏移：微调位置
- 拖拽定位：直接在页面上拖拽悬浮控件
- 恢复默认：重置为默认位置

**行为选项**

- 无关键词时：是否在搜索框为空时显示切换器
- 打开方式：在新标签页或当前标签页打开搜索结果
- 主题模式：跟随系统、浅色或深色
- 恢复默认：重置为默认行为

#### 默认启用的搜索引擎

脚本默认启用以下 6 个搜索引擎：

1. Google
2. Bing
3. DuckDuckGo
4. Brave
5. Yandex
6. 百度

其他搜索引擎默认隐藏，可在设置中手动启用。

## 技术实现原理

### 核心架构

本脚本采用纯原生 JavaScript 实现，主要包含以下模块：

#### 1. 配置管理

- 使用 `GM_getValue` / `GM_setValue` 或 `localStorage` 持久化用户配置
- 支持配置合并和迁移，确保版本更新时用户设置不丢失
- 默认配置包含完整的搜索引擎列表和 UI 设置

#### 2. 搜索引擎检测

```javascript
function activeEngineIdByHost() {
  const host = location.hostname;
  return config.engines.find((e) =>
    (e.hosts || []).some((h) => host.includes(h))
  )?.id;
}
```

- 通过当前页面的域名匹配搜索引擎的 hosts 配置
- 自动识别当前所在的搜索引擎

#### 3. 搜索词提取

```javascript
function getCurrentQuery() {
  const url = new URL(location.href);
  const params = url.searchParams;
  // 尝试常见的搜索参数名
  for (const key of ['q', 'query', 'wd', 'keyword', 'search_query', 'text']) {
    const val = params.get(key);
    if (val) return val.trim();
  }
  return '';
}
```

- 解析当前页面 URL，提取搜索关键词
- 支持多种常见的搜索参数名

#### 4. URL 构建

```javascript
function buildSearchUrl(engine, query) {
  return engine.searchUrl.replace('{q}', encodeURIComponent(query));
}
```

- 将搜索词编码后替换到搜索引擎的 URL 模板中

#### 5. UI 渲染

- 使用 Shadow DOM 隔离样式，避免与页面样式冲突
- CSS 变量实现深浅色主题切换
- 响应式设计，适配不同屏幕尺寸
- `overscroll-behavior: contain` 防止设置面板滚动穿透

#### 6. 事件处理

- 点击事件：切换搜索引擎
- 长按事件：打开设置面板（500ms）
- 拖拽事件：自定义悬浮控件位置
- 滚动事件拦截：防止设置面板滚动影响页面

### 代码结构

```
Via-Style-Search-Engine-Switcher.js
├── 配置定义 (DEFAULT_CONFIG)
├── 工具函数
│   ├── 配置读写 (safeGMGet/safeGMSet)
│   ├── 深拷贝 (deepClone)
│   └── HTML 转义 (escapeHtml)
├── 核心功能
│   ├── 搜索引擎检测 (activeEngineIdByHost)
│   ├── 搜索词提取 (getCurrentQuery/resolveQuery)
│   └── URL 构建 (buildSearchUrl)
├── UI 组件
│   ├── 创建根元素 (createRoot)
│   ├── 渲染引擎按钮 (renderEngineButtons)
│   ├── 设置面板 (renderPanel/openPanel/closePanel)
│   └── 主题应用 (applyTheme)
├── 引擎管理
│   ├── 移动引擎 (moveEngine)
│   ├── 删除引擎 (deleteEngine)
│   ├── 编辑引擎 (editEngine)
│   └── 切换可见性 (toggleEngineVisibility)
└── 初始化 (init)
```

### 兼容性

- 支持所有现代浏览器（Chrome、Firefox、Edge、Safari、Via）
- 支持 Greasemonkey 和 Tampermonkey 脚本管理器
- 支持浅色/深色主题自动切换
- 支持响应式布局

## 特别感谢

特别感谢 **Via 浏览器** 提供的灵感！Via 浏览器是一款极简而强大的安卓浏览器，以其小巧的体积、丰富的自定义功能和优秀的用户体验赢得了众多用户的喜爱。

Via 浏览器的搜索引擎切换功能设计得非常巧妙，本脚本正是希望将这种优秀的交互体验带到桌面浏览器中，让用户在任何网页都能享受便捷的搜索引擎切换。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.0.0

- 初始版本发布
- 支持 22+ 个预设搜索引擎
- 支持自定义搜索引擎
- 支持位置自定义和主题切换

