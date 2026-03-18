<p align="center">
  <img src="docs/assets/logo.png" alt="Claw Dashboard" width="120" />
</p>

<h1 align="center">Claw Dashboard</h1>

<p align="center">
  <strong>Apple 风格的 AI Agent 实时监控面板</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> ·
  <a href="#快速开始">快速开始</a> ·
  <a href="#技术栈">技术栈</a> ·
  <a href="#项目结构">项目结构</a> ·
  <a href="#安全">安全</a> ·
  <a href="#开发指南">开发指南</a> ·
  <a href="#贡献指南">贡献指南</a>
</p>

---

## 简介

Claw Dashboard 是一个专为多 AI Agent 运行状态监控而设计的实时可视化面板。采用 **Apple 风格** 的设计语言（玻璃态、圆角卡片、Space Gray 配色），为 [OpenClaw](https://github.com/openclaw) 及同类 AI Agent 编排平台提供开箱即用的监控体验。

**核心场景：**

- 实时观测数十至数百个 Agent 的运行状态、任务进度与资源消耗
- 异常告警与智能通知（Agent 超时、连续失败、资源溢出等）
- 历史趋势分析与性能基准对比
- 与 OpenClaw 及其他 Agent 平台的无缝集成

## 功能特性

### 监控面板

| 功能 | 描述 |
| :--- | :--- |
| **Agent 总览** | 全局态势感知 — 活跃/空闲/异常/离线 Agent 实时统计 |
| **任务追踪** | 当前执行任务列表、进度条、预计完成时间 |
| **资源水位** | CPU、内存、Token 用量等关键指标的实时仪表盘 |
| **日志流** | Agent 运行日志的实时 tail 与全文搜索 |
| **拓扑视图** | Agent 间调用链路与依赖关系可视化 |

### 告警与通知

- 可配置的告警规则引擎（基于指标阈值、状态变更、异常模式）
- 多通道通知推送（Webhook、Slack、邮件、企业微信）
- 告警聚合与静默策略，避免通知风暴

### 分析与报告

- 历史数据趋势图表（任务完成率、平均执行时长、错误率）
- Agent 性能排行与对比分析
- 可导出的运营报告（PDF / CSV）

### 集成能力

- **OpenClaw** — 一等公民级别的原生集成
- **通用适配器** — RESTful / WebSocket / gRPC 协议适配，支持接入任意 Agent 编排平台
- **Prometheus** — 指标采集与存储
- **Grafana** — 作为可嵌入的数据源补充

## 技术栈

| 层 | 技术选型 |
| :--- | :--- |
| **框架** | React 18 + TypeScript |
| **构建** | Vite 6 |
| **状态管理** | Zustand |
| **样式** | TailwindCSS 4 |
| **图表** | Recharts / D3.js |
| **实时通信** | WebSocket (原生) |
| **网络请求** | Axios |
| **路由** | React Router v7 |
| **国际化** | i18next |
| **代码质量** | ESLint + Prettier |
| **测试** | Vitest + Testing Library |
| **部署** | Docker + Docker Compose |

## 设计理念

Claw Dashboard 延续 **Apple Human Interface Guidelines** 的设计美学：

```
┌────────────────────────────────────────────────────────────┐
│  ◉ ◉ ◉   Claw Dashboard                    [Search] [U]  │
├────────┬───────────────────────────────────────────────────┤
│        │                                                   │
│  总览  │   ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  Agent │   │ 活跃 42 │  │ 空闲 8  │  │ 异常 2  │         │
│  任务  │   └─────────┘  └─────────┘  └─────────┘         │
│  日志  │                                                   │
│  告警  │   ┌───────────────────────────────────────┐       │
│  拓扑  │   │          任务执行趋势图表              │       │
│  设置  │   │      ╱╲    ╱╲╱╲                       │       │
│        │   │   ╱╱    ╲╱╱    ╲╲                     │       │
│        │   └───────────────────────────────────────┘       │
│        │                                                   │
│        │   ┌─────────────────┐  ┌─────────────────┐       │
│        │   │  最近任务列表   │  │  告警通知流     │       │
│        │   │  ─────────────  │  │  ─────────────  │       │
│        │   │  > task-0042    │  │  [!] Agent #7   │       │
│        │   │  > task-0041    │  │  [!] 内存告警   │       │
│        │   └─────────────────┘  └─────────────────┘       │
└────────┴───────────────────────────────────────────────────┘
```

- **玻璃态 (Glassmorphism)** — 侧边栏与顶栏使用 `backdrop-filter: blur(20px)` 实现磨砂半透明效果
- **圆角卡片** — 主要面板 `12px`、按钮/输入框 `8px` 圆角
- **Space Gray 配色** — 深色模式为主，主背景 `#000000` / `#121827`，强调色 Apple Blue `#0a84ff`
- **SF Pro / Inter 字体** — 清晰的字重层级：正文 400、导航 500、标题 600–700

## 项目结构

```
claw-dashboard/
├── public/                    # 静态资源
│   └── favicon.svg
├── src/
│   ├── assets/                # 图片、图标、字体
│   ├── components/            # 可复用 UI 组件
│   │   ├── common/            #   通用组件 (Card, Button, Input ...)
│   │   ├── charts/            #   图表组件
│   │   ├── layout/            #   布局 (Sidebar, Header, MainContent)
│   │   └── agents/            #   Agent 相关组件
│   ├── hooks/                 # 自定义 React Hooks
│   ├── lib/                   # 工具库 (API client, WebSocket, helpers)
│   ├── pages/                 # 页面视图
│   │   ├── Dashboard/         #   总览仪表盘
│   │   ├── Agents/            #   Agent 列表与详情
│   │   ├── Tasks/             #   任务管理
│   │   ├── Logs/              #   日志浏览
│   │   ├── Alerts/            #   告警管理
│   │   ├── Topology/          #   拓扑视图
│   │   └── Settings/          #   系统设置
│   ├── store/                 # Zustand 状态管理
│   ├── types/                 # TypeScript 类型定义
│   ├── i18n/                  # 国际化翻译文件
│   ├── App.tsx                # 根组件
│   ├── main.tsx               # 入口文件
│   └── index.css              # 全局样式 & 设计 Token
├── docker/                    # Docker 相关文件
│   ├── Dockerfile             #   前端多阶段构建
│   └── nginx.conf             #   Nginx 安全配置
├── docs/                      # 项目文档
├── tests/                     # 测试文件
├── .eslintrc.cjs              # ESLint 配置
├── tailwind.config.ts         # TailwindCSS 配置
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 配置
├── docker-compose.yml         # 一键部署编排
├── .env.example               # 环境变量模板
├── package.json
└── readme.md
```

## 快速开始

### 方式一：Docker Compose 一键部署（推荐）

> 生产环境推荐使用 Docker Compose，所有依赖已容器化打包。

**前置条件：** Docker Engine >= 24.0，Docker Compose >= 2.20

```bash
# 克隆仓库
git clone https://github.com/Veritas-Calculus/claw-dashboard.git
cd claw-dashboard

# 复制环境变量模板并按需修改
cp .env.example .env

# 一键启动全部服务
docker compose up -d
```

启动后访问 `https://localhost` 即可使用面板。

**docker-compose.yml** 包含以下服务：

| 服务 | 端口 | 说明 |
| :--- | :--- | :--- |
| `dashboard` | 443 (HTTPS) | 前端应用（Nginx + TLS） |
| `api` | 8080 (内部) | 后端 API 服务 |
| `redis` | 6379 (内部) | 会话缓存与实时消息队列 |
| `prometheus` | 9090 (内部) | 指标采集 |
| `postgres` | 5432 (内部) | 持久化存储 |

常用运维命令：

```bash
# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f dashboard

# 停止全部服务
docker compose down

# 重新构建并启动
docker compose up -d --build

# 保留数据卷的完整重建
docker compose down && docker compose up -d --build
```

### 方式二：本地开发

**前置条件：** Node.js >= 20，pnpm >= 9（推荐）

```bash
git clone https://github.com/Veritas-Calculus/claw-dashboard.git
cd claw-dashboard

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开浏览器访问 `http://localhost:5173` 即可看到面板。

### 环境变量

在项目根目录创建 `.env.local`（本地开发）或 `.env`（Docker 部署）：

```env
# Agent 数据源 API 地址
VITE_API_BASE_URL=http://localhost:8080/api/v1

# WebSocket 地址（实时数据推送）
VITE_WS_URL=ws://localhost:8080/ws

# 默认语言 (zh-CN | en-US)
VITE_DEFAULT_LOCALE=zh-CN

# --- Docker 部署专用 ---
# TLS 证书路径（生产环境必须配置）
TLS_CERT_PATH=./certs/server.crt
TLS_KEY_PATH=./certs/server.key

# PostgreSQL
POSTGRES_USER=claw
POSTGRES_PASSWORD=        # 必须修改为强密码
POSTGRES_DB=claw_dashboard

# Redis
REDIS_PASSWORD=           # 必须修改为强密码

# API 密钥（用于 Agent 数据源认证）
API_SECRET_KEY=           # 必须修改，建议 32+ 字符随机字符串
```

> **[!CAUTION]** 不要将包含真实密码的 `.env` 文件提交到版本控制。`.gitignore` 已默认排除该文件。

## 安全

Claw Dashboard 在设计和部署层面均将安全性作为核心关注点。

### 传输安全

- **强制 HTTPS** — Nginx 默认配置 TLS 1.2+，自动将 HTTP 重定向至 HTTPS
- **安全响应头** — 默认启用以下 HTTP 安全头：
  - `Content-Security-Policy` — 限制资源加载来源，防御 XSS
  - `Strict-Transport-Security` (HSTS) — 强制浏览器使用 HTTPS
  - `X-Content-Type-Options: nosniff` — 禁止 MIME 类型嗅探
  - `X-Frame-Options: DENY` — 防止点击劫持
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **WebSocket 安全** — WSS (WebSocket over TLS) + Origin 校验

### 认证与授权

- **JWT 认证** — 短周期 Access Token + Refresh Token 轮换机制
- **API Key 认证** — Agent 数据源使用 HMAC 签名的 API Key 接入
- **RBAC 权限模型** — 管理员 / 操作员 / 只读观察者 三级角色隔离
- **会话管理** — Redis 存储会话状态，支持主动吊销与并发限制

### 数据安全

- **密码存储** — bcrypt (cost >= 12) 哈希，从不明文存储
- **敏感配置** — 环境变量注入，禁止硬编码密钥；支持 Docker Secrets
- **数据库** — 强制 SSL 连接，最小权限原则配置数据库用户
- **日志脱敏** — 自动过滤日志中的 Token、密码、API Key 等敏感信息

### 网络隔离

- **容器网络** — Docker Compose 中后端服务（API、Redis、PostgreSQL、Prometheus）均在内部网络中，不暴露到宿主机
- **最小端口暴露** — 仅 Dashboard 的 443 端口对外开放
- **CORS 白名单** — 仅允许已授权的来源域访问 API
- **速率限制** — 全局 / 租户 / 用户 / 路径 多级限流，防御暴力破解与 DDoS

### 供应链安全

- **依赖审计** — CI 中集成 `pnpm audit` 自动扫描已知漏洞
- **镜像安全** — 基于 `node:20-alpine` 最小基础镜像，多阶段构建剥离开发依赖
- **Dependabot** — 自动追踪依赖更新与安全补丁

### 安全检查清单（部署前）

```
[ ] 已配置有效的 TLS 证书（非自签名）
[ ] 已修改所有默认密码（PostgreSQL、Redis、API Key）
[ ] .env 文件未提交到版本控制
[ ] 已启用 CORS 白名单并限制到实际域名
[ ] 已确认仅 443 端口对外暴露
[ ] 已启用速率限制
[ ] 已配置日志脱敏规则
[ ] 已运行 pnpm audit 确认无高危漏洞
```

## 开发指南

### 常用命令

```bash
pnpm dev          # 启动开发服务器（HMR）
pnpm build        # 生产构建
pnpm preview      # 预览生产构建
pnpm test         # 运行单元测试
pnpm test:e2e     # 运行端到端测试
pnpm lint         # 代码规范检查
pnpm lint:fix     # 自动修复 lint 问题
pnpm format       # 代码格式化
pnpm type-check   # TypeScript 类型检查
```

### 接入自定义 Agent 平台

Claw Dashboard 通过 **适配器模式** 支持接入任意 Agent 平台。只需实现 `AgentDataSource` 接口：

```typescript
interface AgentDataSource {
  // 获取所有 Agent 列表
  listAgents(): Promise<Agent[]>

  // 获取单个 Agent 详情
  getAgent(id: string): Promise<AgentDetail>

  // 获取 Agent 任务列表
  listTasks(agentId?: string): Promise<Task[]>

  // 获取实时指标
  getMetrics(agentId: string): Promise<AgentMetrics>

  // 订阅实时事件流
  subscribe(handler: EventHandler): Unsubscribe
}
```

内置适配器：

- `OpenClawAdapter` — OpenClaw 平台原生适配
- `GenericRESTAdapter` — 通用 REST API 适配
- `MockAdapter` — 本地开发模拟数据

### 主题定制

修改 `src/index.css` 中的 CSS 变量来定制主题：

```css
:root {
  --color-bg-primary: #000000;
  --color-bg-secondary: #1c1c1e;
  --color-accent: #0a84ff;
  --color-text-primary: #f5f5f7;
  --color-text-secondary: #86868b;
  --radius-card: 12px;
  --radius-button: 8px;
  --glass-blur: blur(20px) saturate(180%);
}
```

## 贡献指南

1. **Fork** 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'feat: add amazing feature'`（遵循 [Conventional Commits](https://www.conventionalcommits.org/)）
4. 推送分支：`git push origin feature/your-feature`
5. 创建 **Pull Request**

### 提交规范

```
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响逻辑）
refactor: 重构
perf:     性能优化
test:     测试相关
chore:    构建/工具变更
```

## 许可证

[MIT](LICENSE)

---

<p align="center">
  Built with care by <a href="https://github.com/Veritas-Calculus">Veritas-Calculus</a>
</p>
