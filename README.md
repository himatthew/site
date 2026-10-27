# 喜迁阳邑 (xiqianyangyi.com/feed) 1:1 纯前端复刻版

> 1:1 像素级复刻易烊千玺个人站点「喜迁阳邑」Feed 流页面。采用**纯纯前端技术方案**，无后端服务器负担，支持结合 **GitHub + Vercel** 实现每日无缝更新与秒级全球 CDN 部署。

---

## 🌟 核心特色与 1:1 细节还原

1. **1:1 视觉与交互完全对齐**：
   - **动态水波底纹**：提取并内置官方原版的 57 帧无缝循环水波序列帧（140ms 帧率），带来复古生动的流动质感。
   - **原版书法顶栏与点阵字体**：内置官方书法标题「效天自然」、原版定制点阵宋体（`DottedSongtiCircleRegular`）与等宽数字字体。
   - **自适应视口比例**：完全复刻原版基于 iPhone 430px 基准的 `rem` 动态缩放逻辑，PC 端居中精美展示，移动端全屏原生体验。
   - **多媒体流排版**：
     - 单视频卡片：自适应计算横屏/竖屏/方屏宽高比，配备暗红三角遮罩播放按钮。
     - 多图/多媒体滑动卡片：横向流畅滑动，多图数量指示。
     - 音频播放卡片：胶囊式圆角播放器，内置进度条与数字时间轴。
     - 文字自适应对齐：严格遵循原版字数 `≤26` 居中、`>26` 两端对齐规则。
     - 滚动渐显动效：基于 `IntersectionObserver` 实现单条卡片进入视口时的平滑上升淡入。
     - 底部渐变遮罩：底条瀑布流与暗色渐变过渡。
   - **全屏多媒体灯箱 Lightbox**：
     - 支持移动端手势左右滑动、桌面端左右切换箭头与键盘 `←` `→` `Esc` 导航。
     - 支持双击/双指缩放查看原图。
     - 顶部页码计数器（如 `1 / 12`）与底部移动端指示点。
     - 视频内嵌播放与原版红框「存」视频下载按钮。

2. **纯纯前端架构 (Pure Static Frontend)**：
   - 基于 **React 18 + TypeScript + Vite** 构建，完全静态化（Static SPA），产物仅为纯 HTML、CSS、JS 与图片字体。
   - 零数据库成本、零服务器运维风险，直接部署在 Vercel Edge CDN，全球访问延迟极低。

---

## 🚀 结合 GitHub + Vercel 每日更新方案

本项目支持以下 **4 种每日更新方式**，满足不同场景下的日常维护需求：

### 方案 A：GitHub Actions 每日全自动同步（零人工干预 ⭐推荐）
项目已配置 `.github/workflows/daily-sync.yml`：
- **定时触发**：每天北京时间 00:00 (UTC 16:00) 自动触发。
- **自动检测**：脚本请求官方接口，如果有新动态发布，会自动追加到 `src/data/posts.json` 与 `public/data/posts.json`，并以 `github-actions[bot]` 身份自动 `git commit` 并 `git push` 到你的仓库。
- **自动触发上线**：Vercel 检测到 GitHub 提交后，将在数十秒内自动重新构建并全球发布。
- **手动一键同步**：你也可以在 GitHub 仓库的 **Actions** 标签页中找到 `Daily Feed Sync`，点击 **Run workflow** 随时手动抓取最新动态。

### 方案 B：命令行交互式快速录入
在本地终端中运行一条命令即可快速发布自己的新动态：
```bash
npm run post:new
```
终端会通过问答方式提示你输入：
1. 发布时间（默认当前时间，直接回车即可）
2. 文案描述（支持换行文字）
3. 媒体链接（图片 / 视频 / 音频 URL，可连续添加多项）
4. 完成后脚本会自动格式化写入 JSON，并输出快捷提交命令：
```bash
git add . && git commit -m "feat(feed): update daily feed" && git push
```

### 方案 C：网页内置可视化管理面板
在页面运行或部署后：
1. 点击右下角的圆形铅笔图标 `✎`，或者按下快捷键 `Ctrl + Shift + U`（Mac 上为 `Cmd + Shift + U`）。
2. 在弹出面板中直接填写时间、文案并添加图片/视频链接。
3. 点击 **「🚀 预览此条动态」**：页面将立即在最上方渲染出这条新动态，供你实时交互测试。
4. 点击 **「💾 导出 posts.json」**：下载更新后的数据文件并替换本地对应文件。
5. 点击 **「📋 复制一键 Git 提交部署命令」** 提交到 GitHub 触发 Vercel 自动部署。

### 方案 D：直接编辑数据源文件
动态数据集中保存在两个完全同步的文件中：
- `src/data/posts.json`
- `public/data/posts.json`

只需在数组最前方添加一条 JSON 数据，提交推送到 GitHub 即可：
```json
{
  "id": 99,
  "if_comment": 0,
  "status": "published",
  "desc": "今日的记录与分享",
  "publish_time": "2026-10-28 20:00:00",
  "content": [
    {
      "id": 1001,
      "posts_id": 99,
      "type": "image",
      "content": "https://your-image-url.jpg",
      "sort": 1
    }
  ],
  "comment_list": []
}
```

---

## 📦 Vercel 部署指南

1. **推送代码至 GitHub**：
   ```bash
   git add .
   git commit -m "feat: initial commit for xiqianyangyi feed clone"
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

2. **连接 Vercel**：
   - 登录 [vercel.com](https://vercel.com)。
   - 点击 **Add New...** -> **Project**，选择刚才推送到 GitHub 的仓库并点击 **Import**。
   - Vercel 会自动识别出 Vite 项目，各项配置保持默认即可：
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - 点击 **Deploy**。

3. **完成！**
   部署成功后，你将获得一个免费的 `*.vercel.app` 域名，也可在 Vercel 绑定你自己的独立域名。之后每次 GitHub 有提交，Vercel 都会自动重新部署更新！

---

## 💻 本地运行与开发

```bash
# 安装依赖
npm install

# 启动本地开发服务 (支持热更新)
npm run dev

# 手动同步官方最新动态
npm run sync

# 交互式添加新动态
npm run post:new

# 构建生产产物
npm run build

# 本地预览生产构建产物
npm run preview
```

---

## 📁 目录结构

```text
site/
├── .github/
│   └── workflows/
│       └── daily-sync.yml         # GitHub Actions 每日自动同步与提交流程
├── public/
│   ├── data/
│   │   └── posts.json             # 静态对外暴露的动态 JSON 数据
│   ├── fonts/                     # 原版字体文件（点阵宋体、等宽数字等）
│   ├── imgs23/water/              # 原版 57 帧无缝循环水波序列帧
│   ├── static/                    # 原版书法顶栏标题图片
│   └── favicon.png                # 原版站点图标
├── scripts/
│   ├── sync.js                    # Node.js 官方 Feed 抓取同步脚本
│   └── add-post.js                # Node.js 命令行交互式新增动态工具
├── src/
│   ├── components/
│   │   ├── DailyUpdateModal.tsx   # 可视化草稿箱与每日更新面板
│   │   ├── FeedItem.tsx           # 单条动态卡片组件 (视频/多图/音频/纯文本)
│   │   ├── MediaModal.tsx         # 全屏手势滑动媒体灯箱 Lightbox
│   │   └── WaterBackground.tsx    # 57 帧水波纹循环渲染背景组件
│   ├── data/
│   │   └── posts.json             # 前端打包直引用的完整数据集
│   ├── styles/
│   │   └── index.css              # 1:1 像素级样式系统与字体声明
│   ├── types.ts                   # 数据类型声明
│   ├── App.tsx                    # 主页面组件 (无限滚动/回到顶部/状态调度)
│   └── main.tsx                   # 应用入口
├── index.html                     # 视口与 rem 动态计算脚本
├── package.json
├── tsconfig.json
├── vercel.json                    # Vercel 路由重写与缓存策略配置
└── vite.config.ts
```
