# Tool-Ore 在线工具箱

一个基于 React 19 + Vite + Tailwind CSS 构建的纯前端轻量级在线工具集合，部署于 Cloudflare Workers，所有计算与转换均在浏览器本地完成。

---

## 🌟 核心特性
- **纯前端本地运算**：零后端依赖，数据不离本地，安全可靠。
- **现代化极简设计**：基于 Tailwind CSS 原子样式，界面清爽美观。
- **深浅色主题自适应**：支持白天模式、夜间模式及自动跟随系统偏好。
- **按需懒加载**：基于 Hash 驱动的组件动态分包加载，首屏秒开。
- **开箱即用**：响应式侧边栏布局，支持全局工具检索与移动端抽屉导航。

---

## 🛠️ 当前已上线工具

### 1. 文本工具
- **大写金额转换**：将阿拉伯数字金额快速转换为财务标准的中文大写汉字（支持负数、角分厘毫及千分位格式）。

### 2. 图片工具
- **图片压缩**：支持按期望最大文件大小（如指定 300KB 以内）或质量百分比进行智能二分精准压缩。
- **图片格式转换**：支持 PNG、JPG、WebP 格式之间快速批量互转并一键打包导出。
- **颜色拾取器**：提供高倍像素放大镜准星取色、全屏原生吸管拾色，支持 HEX / RGB / HSL / HSV / CMYK 多格式换算及历史调色板。

### 3. 加密工具
- **Base64 编解码**：支持 UTF-8 文本编解码、URL-Safe 安全模式，以及任意格式文件转 Base64 DataURI。

---

## 🚀 快速开始

### 1. 安装依赖
本项目推荐使用 `bun` 进行包管理：
```bash
bun install
```

### 2. 本地开发
启动 Vite 前端开发服务器：
```bash
bun run dev
```

### 3. 执行测试
运行 Vitest 单元测试：
```bash
bun run test
```

### 4. 生产构建
打包生成生产环境静态资源（输出至 `dist/` 目录）：
```bash
bun run build
```

### 5. 部署到 Cloudflare Workers
```bash
bunx wrangler deploy
```

---

## 📁 目录结构

```text
tool-ore/
├── src/
│   ├── components/       # 公共布局组件（Sidebar, Dashboard, DynamicIcon 等）
│   ├── hooks/            # 自定义 Hook（如 useTheme）
│   ├── tools/            # 独立工具实现目录
│   │   ├── text/         # 文本相关工具
│   │   ├── image/        # 图片相关工具
│   │   └── crypto/       # 加密与编解码工具
│   ├── types/            # TypeScript 类型定义 (ToolDefinition, CategoryInfo)
│   ├── registry.ts       # 工具与分类统一注册表
│   ├── App.tsx           # 主应用框架与路由
│   ├── main.tsx          # 前端入口
│   └── worker.ts         # Cloudflare Workers 静态资源托管入口
├── test/                 # 单元测试用例
├── AGENTS.md             # 协作开发规范与行为指南
├── wrangler.jsonc        # Cloudflare Workers 配置文件
└── vite.config.ts        # Vite 构建配置
```

---

## 📄 License
[MIT](LICENSE)
