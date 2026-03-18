<p align="center">
  <img src="docs/assets/logo.png" alt="Claw Dashboard" width="120" />
</p>

<h1 align="center">Claw Dashboard</h1>

<p align="center">
  <strong>AI Agent 实时监控面板 -- Powered by OpenClaw</strong>
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#openclaw-integration">OpenClaw Integration</a> ·
  <a href="#development">Development</a>
</p>

---

## Features

- Real-time agent status monitoring (CPU, memory, task count)
- Task execution tracking with progress bars
- Live log streaming via WebSocket
- Alert management with severity levels and acknowledgment
- D3 force-directed topology visualization
- CSV data export
- Dark/light theme with Apple-style glassmorphism
- i18n (Chinese / English)
- First-run admin setup (no env passwords)
- JWT authentication middleware on all protected API routes
- User management (admin: create, update role/password, delete)
- Redis-cached dashboard metrics (5s TTL)
- OpenClaw Gateway integration via WebSocket protocol v3
- Time-series metrics history with 15-min trend aggregation

## Quick Start

### One-click Docker Deployment

```bash
# 1. Clone the repository
git clone https://github.com/Veritas-Calculus/claw-dashboard.git
cd claw-dashboard

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env: set JWT_SECRET, PG_PASSWORD, and OpenClaw Gateway URL/token

# 3. Start all services
docker compose up -d
```

Open `http://localhost:3000` -- on first visit you will be prompted to create an admin account.

### Environment Variables

| Variable | Description | Default |
|:---|:---|:---|
| `PG_PASSWORD` | PostgreSQL password | `claw_secret` |
| `JWT_SECRET` | Secret for JWT token signing (32+ chars) | must change |
| `DASHBOARD_PORT` | Frontend port | `3000` |
| `RUST_LOG` | Log level | `claw_api=info` |
| `OPENCLAW_GATEWAY_URL` | OpenClaw Gateway WebSocket URL | not set |
| `OPENCLAW_GATEWAY_TOKEN` | OpenClaw Gateway auth token | not set |
| `SEED_DATA` | Populate demo data on startup | `false` |

### Services

| Service | Port | Description |
|:---|:---|:---|
| dashboard | 3000 | Nginx + React SPA |
| api | internal | Rust (Axum) backend |
| postgres | 5432 | PostgreSQL 17 |
| redis | 6379 | Redis 7 |

## Architecture

```
Browser
  |
  +---> Nginx (:3000)
          |
          +-- SPA assets (React + Vite)
          +-- /api/*  --> Rust API (:8080)
          +-- /ws     --> Rust API WebSocket
                           |
                           +-- PostgreSQL (data persistence)
                           +-- Redis (pub/sub + cache)
                           +-- OpenClaw Gateway (:18789, WebSocket)
```

### Project Structure

```
claw-dashboard/
  .env.example           # Docker deployment variables
  docker-compose.yml     # Full-stack orchestration
  web/                   # Frontend (React + Vite + TypeScript)
    src/
      components/        # Reusable UI components
      pages/             # Route pages (Dashboard, Agents, Login, etc.)
      hooks/             # Custom React hooks
      lib/               # API client, adapters, WebSocket
      store/             # Zustand + Redux stores
      i18n/              # Localization (zh-CN, en-US)
    deploy/nginx.conf    # Nginx reverse proxy config
    Dockerfile           # Multi-stage frontend build
  server/                # Backend (Rust + Axum)
    src/
      config.rs          # Environment configuration
      error.rs           # Centralized error handling
      handlers/          # REST + WebSocket + Auth + User handlers
      middleware/         # JWT auth middleware
      models/            # Database models (Agent, Task, Log, Alert, MetricRecord)
      services/          # Seed, Simulator, OpenClaw client
      db/                # PostgreSQL + Redis connections
    migrations/          # SQL schema migrations
    Dockerfile           # Multi-stage Rust build
```

## OpenClaw Integration

The dashboard connects to the [OpenClaw Gateway](https://docs.openclaw.ai/gateway) as an operator client via WebSocket protocol v3.

### How It Works

1. The Rust backend opens a WebSocket connection to the OpenClaw Gateway
2. Sends a `connect` handshake with `role: operator` and `scopes: [operator.read]`
3. Authenticates using `OPENCLAW_GATEWAY_TOKEN` (same as the Gateway's `gateway.auth.token`)
4. Receives real-time events: `presence`, `agent`, `health`, `heartbeat`
5. Translates events into the dashboard's data model
6. Broadcasts to frontend clients via Redis pub/sub + WebSocket

### Configuration

Set these environment variables in `.env` or `docker-compose.yml`:

```bash
OPENCLAW_GATEWAY_URL=ws://your-openclaw-host:18789
OPENCLAW_GATEWAY_TOKEN=your-gateway-token-here
```

The token must match the one configured in your OpenClaw instance via `gateway.auth.token` config or `OPENCLAW_GATEWAY_TOKEN` environment variable.

### Supported Events

| Gateway Event | Dashboard Action |
|:---|:---|
| `presence` | Update agent list and status |
| `agent` | Update agent details and task progress |
| `health` | Update system health metrics |
| `heartbeat` / `tick` | Connection keepalive (silent) |

## Authentication

The dashboard uses JWT-based authentication. No passwords are stored in environment variables.

### First-Run Setup

1. On first deployment, the database has no users
2. Navigate to `http://localhost:3000` -- you will be redirected to the login page
3. The page detects "needs setup" and shows the admin creation form
4. Create your admin account (username 3+ chars, password 6+ chars)
5. You are logged in automatically with a 24-hour JWT token

### Login Flow

```
GET /api/v1/auth/status   --> { "needsSetup": true/false }
POST /api/v1/auth/setup   --> { "token": "...", "username": "...", "role": "admin" }
POST /api/v1/auth/login   --> { "token": "...", "username": "...", "role": "admin" }
GET /api/v1/auth/me        --> { "id": "...", "username": "...", "role": "admin" }
```

## API Endpoints

| Method | Path | Auth | Description |
|:---|:---|:---|:---|
| GET | `/api/v1/auth/status` | No | Check if setup is needed |
| POST | `/api/v1/auth/setup` | No | Create first admin |
| POST | `/api/v1/auth/login` | No | Login, get JWT |
| GET | `/api/v1/auth/me` | JWT | Validate token |
| GET | `/api/v1/agents` | JWT | List all agents |
| GET | `/api/v1/tasks` | JWT | List all tasks |
| GET | `/api/v1/logs?limit=N&offset=M&level=warn` | JWT | Logs with pagination and filter |
| GET | `/api/v1/alerts` | JWT | All alerts |
| POST | `/api/v1/alerts/{id}/ack` | JWT | Acknowledge alert |
| GET | `/api/v1/dashboard/metrics` | JWT | Aggregated stats (Redis cached) |
| GET | `/api/v1/users` | JWT (admin) | List all users |
| POST | `/api/v1/users` | JWT (admin) | Create user |
| PATCH | `/api/v1/users/{id}` | JWT (admin) | Update role or password |
| DELETE | `/api/v1/users/{id}` | JWT (admin) | Delete user |
| GET | `/ws?token=JWT` | Query param | WebSocket (real-time events) |

## Development

### Prerequisites

- Node.js 22+
- Rust 1.94+
- PostgreSQL 17
- Redis 7
- Docker (optional)

### Local Development

```bash
# Frontend
cd web
cp .env.example .env.local
npm install
npm run dev

# Backend
cd server
cp .env.example .env
# Set SEED_DATA=true in .env for demo data
cargo run
```

### Branch Strategy

| Branch | Purpose |
|:---|:---|
| `main` | Production-ready releases |
| `develop` | Integration branch |
| `feature/*` | New features |
| `fix/*` | Bug fixes |
| `refactor/*` | Code improvements |

### Tech Stack

**Frontend:** React 19, TypeScript, Vite, Zustand, D3.js, i18next, CSS Modules

**Backend:** Rust, Axum 0.8, SQLx (PostgreSQL), Redis, tokio-tungstenite, bcrypt, jsonwebtoken

**Infrastructure:** Docker, Nginx, GitHub Actions CI/CD

## License

MIT
