# 上网主页项目 · 技术架构与实施方案

> 状态：方案设计完成，待实施
> 日期：2026-09-05
> 参考站点：https://nav.imsyy.com/ （imsyy/home，Vue 3 + Vite）
> 需求功能：时间日期、当前天气、搜索引擎、网页快捷方式、设置；UI 要求背景图 + 毛玻璃 + light/dark 切换

## 一、技术选型

| 层面 | 选择 | 理由 |
|------|------|------|
| 框架 | **Vue 3**（Composition API + `<script setup>`） | 与参考站同栈，生态成熟 |
| 构建 | **Vite** | 秒级 HMR，纯静态产物 |
| 语言 | **TypeScript**（strict） | 设置项/分组/引擎等数据结构类型安全 |
| 状态管理 | **Pinia** + pinia-plugin-persistedstate | 设置与快捷方式自动持久化到 localStorage |
| 样式 | **Tailwind CSS v4**（@tailwindcss/vite） | 原子类 + CSS 变量驱动 light/dark 主题 |
| UI 组件 | **shadcn-vue**（源码分发式组件，基于 Reka UI 无头原语 + Tailwind + CVA） | 组件源码生成到项目内，可自由定制毛玻璃风格；Dialog/Switch/Select/Slider/Tabs/ContextMenu 等无障碍交互开箱即用 |
| 图标 | **lucide-vue-next** | shadcn-vue 默认图标集，树摇、离线可用 |
| 工具库 | **@vueuse/core** | useDark、useLocalStorage、useIntervalFn 等 |
| 拖拽排序 | **vuedraggable**（vue.draggable.next） | 快捷方式/分组拖拽排序 |
| 本地图片存储 | **idb-keyval** | 用户上传的背景图存 IndexedDB（超 localStorage 限额） |
| PWA | **vite-plugin-pwa**（Workbox） | manifest + SW，可离线当起始页 |
| 运行环境 | Node 20+ / npm | Windows 本机直接可用 |
| 部署 | 纯静态 dist → GitHub Pages / Vercel / Cloudflare Pages 任选 | 无需后端 |

### shadcn-vue 组件 ↔ 功能映射

| 功能 | shadcn-vue 组件 |
|------|----------------|
| 设置弹窗 | `Dialog` |
| 设置开关（一言/天气/完整日期等） | `Switch` |
| 新链接打开方式下拉 | `Select` |
| 背景遮罩/模糊度 | `Slider` |
| 设置面板左侧导航 | `Tabs`（垂直方向） |
| 快捷方式右键菜单 | `ContextMenu` |
| 搜索联想词 | `Popover` / `Command` |
| 操作反馈 | `Sonner`（toast） |
| 其他 | `Button` / `Input` / `Tooltip` / `ScrollArea` |

初始化：`shadcn-vue init` 后按需 `add`；全局 CSS 变量改为毛玻璃主题（半透明底 + blur + 细边框）。

### 外部服务（全部免费，已验证）

| 用途 | 服务 | 说明 |
|------|------|------|
| 天气 | **Open-Meteo** Forecast API | 无需 Key；`current_weather` + `daily` 温度区间（已实测返回有效 JSON） |
| 城市搜索 | Open-Meteo Geocoding API | 设置中手动选择城市 |
| 定位 | 浏览器 Geolocation → ipapi.co IP 定位 → 手动城市 → 默认城市 | 三级回退 |
| 一言 | `v1.hitokoto.cn` | 已实测返回有效 JSON |
| 必应每日壁纸 | Peapix API / 社区直链镜像 | 作 CSS 背景/`<img>` 引用（不受 CORS 限制）；**失败自动降级内置渐变** |
| 网站图标 | favicon.im | 失败降级首字母色块 |
| 搜索联想词 | 百度 `su` JSONP 接口 | 失败时静默隐藏联想 |

## 二、整体架构（分层，单向依赖）

```
视图层 components/ → 状态层 stores/ + composables/ → 服务层 services/ → 外部 API
```

外部调用集中在 services 层，每条链路三级回退：**内存缓存 → localStorage 缓存（TTL）→ 默认值/降级 UI**，任一第三方服务不可用时页面照常可用。

## 三、目录结构

```
src/
├── main.ts / App.vue               # 入口 + 全局布局
├── assets/styles/                  # main.css（Tailwind v4 + 主题变量 + shadcn 变量）、glass.css（毛玻璃）、transition.css
├── lib/utils.ts                    # shadcn 的 cn()（clsx + tailwind-merge）
├── types/                          # settings / search / shortcut / weather 类型定义
├── constants/                      # 内置搜索引擎、默认分组、默认设置、WMO 天气码映射表
├── services/                       # weatherApi、geolocation、hitokoto、bingWallpaper、favicon、suggestions
├── composables/                    # useClock、useWeather、useSearch、useQuote、useBackground、useTheme
├── stores/                         # settingsStore（全局设置）、shortcutsStore（分组与快捷方式）
├── components/
│   ├── ui/                         # shadcn-vue 生成的组件（Dialog、Switch、Select、Slider…）
│   ├── ClockDate.vue  WeatherInfo.vue  SearchBox.vue  ShortcutGrid.vue
│   ├── QuoteFooter.vue  ThemeToggle.vue  BackgroundLayer.vue
│   └── settings/                   # SettingsModal + 各 tab 面板（基本/搜索引擎/分组管理/背景/备份/关于）
└── utils/                          # storage、format
```

## 四、核心模块设计

1. **主题系统**：`.dark` class + CSS 变量切换 light/dark（shadcn 变量与自定义 `--glass-*` 变量同轨）；默认跟随系统，可手动锁定；毛玻璃 `.glass` 工具类 = `backdrop-filter: blur + saturate` + 半透明底 + 细边框 + 文字 text-shadow，保证背景图上可读。
2. **时间日期**：useClock 秒级刷新，大时钟 HH:mm + 「X月X日 周X」，完整日期可开关（对照设置截图）。
3. **天气**：三级定位回退；WMO weathercode → 中文现象（晴/多云/小雨…）+ lucide 图标映射表；显示「城市 现象 最低~最高温 风向风力」，30 分钟缓存。
4. **搜索**：引擎 = `{name, url模板, icon}`，内置 Bing/Google/百度/DuckDuckGo/GitHub/B站，支持自定义添加；点击图标或 Tab/Ctrl+→ 切换引擎；联想词 debounce 150ms；回车按设置的「新标签页/当前页」打开。
5. **快捷方式**：`Group[] → Site[]`（名称/URL/图标），默认预置常用分组；ContextMenu 右键增删改；vuedraggable 拖拽排序；点击行为跟随新链接打开方式设置；favicon 自动抓取。
6. **设置面板**：还原截图布局——Dialog 模态弹窗，左侧 Tabs 竖排导航（基本设置/搜索引擎/分组管理/背景图片/数据备份/帮助反馈/关于），右侧设置行（标题 + 描述 + Switch/Select/Slider 控件）。
7. **背景图片**：三种来源（内置渐变 / 必应每日壁纸 / 本地上传→IndexedDB），遮罩暗度与模糊度滑块可调。
8. **数据备份**：一键导出/导入 JSON（设置 + 引擎 + 分组 + 快捷方式）。
9. **PWA**：manifest（名称/图标/standalone）+ SW 预缓存应用外壳，壁纸运行时 CacheFirst 缓存。
10. **键盘与响应式**：`/` 或 Ctrl+K 聚焦搜索、Esc 关闭弹窗（Reka UI 自带焦点管理）；移动端网格列数自适应、设置面板全屏化。

## 五、实施步骤

1. **脚手架**：create-vite（vue-ts 模板）初始化 Foundation 目录，安装全部依赖，配置 Tailwind v4 → `shadcn-vue init` → 按需 add 组件 → 毛玻璃主题变量改造 → PWA 插件配置，首提交。
2. **主页骨架**：全屏背景层（渐变/本地图片）+ ClockDate + ThemeToggle + 一言 Footer。
3. **天气模块**：定位链 + Open-Meteo + WMO 映射 + 缓存。
4. **搜索模块**：多引擎 + 联想词 + 跳转方式。
5. **快捷方式模块**：分组网格 + 右键编辑 + 拖拽排序 + favicon。
6. **设置面板**：六个 tab 全量实现 + 数据导入导出。
7. **收尾**：必应每日壁纸接入（带降级）、PWA 图标与 manifest、移动端适配、`npm run build` 后浏览器实测逐项验收。

## 六、验收对照（基于参考截图）

- [ ] 首页：全屏背景图 + 居中大号时钟 HH:mm + 日期「X月X日 周X」+ 天气行「城市 现象 温度区间 风向风力」
- [ ] 搜索框：胶囊形毛玻璃、左侧引擎图标、右侧搜索图标
- [ ] 底部一言：「……」格式随机格言
- [ ] 亮/暗模式切换（默认跟随系统）
- [ ] 设置面板：左侧「基本设置/搜索引擎/分组管理/背景图片/数据备份/帮助和反馈/关于」导航 + 右侧设置行（新链接打开方式、随机一言、显示天气、显示完整日期等开关）
- [ ] 毛玻璃质感贯穿所有浮层与控件
- [ ] PWA 可安装、离线可用基础体验
- [ ] 移动端响应式正常

## 附：方案讨论记录

- UI 组件库讨论：原方案为自研 ui 小组件，讨论后采纳 **shadcn-vue**（与 Tailwind/lucide 同源、组件源码归项目所有便于毛玻璃定制、Reka UI 提供无障碍交互原语）。
- 天气服务讨论：对比 Open-Meteo（免 Key）/ 和风天气（需申请 Key）/ 两者都支持，选定 Open-Meteo。
- 必应壁纸镜像 `bing.img.run` 稳定性存疑（2026-09 检索未确证），Peapix API 确认活跃；方案中壁纸服务带降级策略。
