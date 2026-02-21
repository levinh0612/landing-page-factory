# Landing Page Factory (LPF)

A platform to manage the full lifecycle of marketing landing page websites — from template showcase to project creation, deployment, and monitoring.

Built for freelancers and agencies who repeatedly build landing pages for clients (education centers, restaurants, clinics, SaaS products, etc.) and need a central hub to manage them all.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | npm workspaces |
| Language | TypeScript (full-stack) |
| API | Express.js + Prisma ORM + PostgreSQL |
| Dashboard | React 19 + Vite + Tailwind CSS v4 + shadcn/ui |
| Auth | JWT + bcryptjs |
| Validation | Zod (shared FE/BE) |
| State | TanStack Query (server) + Zustand (client) |
| Infra | Docker Compose (PostgreSQL 16 + Redis 7) |

## Project Structure

```
landing-page-factory/
├── packages/
│   ├── shared/          ← Types + Zod schemas (shared FE/BE)
│   ├── api/             ← Express + Prisma (port 5001)
│   └── dashboard/       ← React + Vite + shadcn/ui (port 5173)
├── docker-compose.yml   ← PostgreSQL + Redis
├── package.json         ← Root workspace + scripts
└── tsconfig.base.json
```

## Quick Start

### Prerequisites

- Node.js >= 20
- Docker Desktop
- Git

### One Command Setup

```bash
git clone https://github.com/levinh0612/landing-page-factory.git
cd landing-page-factory
cp .env.example packages/api/.env
npm run deploy-dev
```

This single command will:
1. Start Docker containers (PostgreSQL + Redis)
2. Install all dependencies
3. Build shared package
4. Run database migrations
5. Seed sample data
6. Start API (http://localhost:5001) and Dashboard (http://localhost:5173)

### Login Credentials

```
Email:    admin@lpf.local
Password: password123
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run deploy-dev` | One-shot: docker + install + build + migrate + seed + dev servers |
| `npm run dev` | Start API + Dashboard dev servers |
| `npm run dev:api` | Start API only (port 5001) |
| `npm run dev:dashboard` | Start Dashboard only (port 5173) |
| `npm run build` | Build all packages |
| `npm run build:shared` | Build shared types package |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run lint` | Lint all TypeScript files |
| `npm run format` | Format code with Prettier |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Templates (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/templates` | List (paginated, searchable) |
| GET | `/api/templates/:id` | Get by ID |
| POST | `/api/templates` | Create |
| PATCH | `/api/templates/:id` | Update |
| DELETE | `/api/templates/:id` | Delete |

### Clients (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List (paginated, searchable) |
| GET | `/api/clients/:id` | Get by ID |
| POST | `/api/clients` | Create |
| PATCH | `/api/clients/:id` | Update |
| DELETE | `/api/clients/:id` | Delete |

### Projects (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List (paginated, filterable by status) |
| GET | `/api/projects/:id` | Get by ID |
| POST | `/api/projects` | Create |
| PATCH | `/api/projects/:id` | Update |
| PATCH | `/api/projects/:id/status` | Update status |
| DELETE | `/api/projects/:id` | Delete |

### Dashboard (protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregated stats + recent activity |

## Database Schema

7 tables with UUID primary keys:

```
users ──────────────── activity_logs
                            │
templates ── projects ──────┤
                │           │
clients ─────┘  ├── deployments
                └── health_checks
```

## Roadmap

### Phase 1A — Foundation (Done)
- [x] Monorepo scaffolding (npm workspaces)
- [x] Shared types + Zod validation schemas
- [x] Prisma schema with 7 tables
- [x] Express API: auth, templates, clients, projects CRUD
- [x] React dashboard: login, sidebar, stats, tables, gallery
- [x] Docker Compose (PostgreSQL 16 + Redis 7)
- [x] Seed data (admin user, 5 templates, 2 clients, 2 projects)
- [x] One-shot `deploy-dev` command

### Phase 1B — Dashboard Polish (Next)
- [ ] Edit dialogs for templates, clients, projects (inline forms)
- [ ] Detail pages with tabs (project overview, deployments, health)
- [ ] Toast notifications (success/error feedback)
- [ ] Pagination controls (previous/next, page size)
- [ ] Responsive mobile layout
- [ ] Dark mode toggle
- [ ] Form validation error display improvements

### Phase 2 — Template Engine
- [ ] Template file upload + storage (S3/Cloudflare R2)
- [ ] Template preview iframe
- [ ] Template config editor (JSON schema → dynamic form)
- [ ] Template versioning
- [ ] Template marketplace/gallery with filtering and tags

### Phase 3 — Deployment Pipeline
- [ ] Vercel deployment integration (API)
- [ ] Netlify deployment integration (API)
- [ ] One-click deploy from dashboard
- [ ] Build logs streaming (WebSocket)
- [ ] Rollback to previous deployment
- [ ] Custom domain setup wizard

### Phase 4 — Monitoring & Health
- [ ] Automated health checks (cron)
- [ ] SSL certificate expiry tracking
- [ ] Response time monitoring
- [ ] Uptime dashboard with charts
- [ ] Alert notifications (email/Slack)
- [ ] Redis caching for health data

### Phase 5 — Multi-tenancy & Scaling
- [ ] Role-based access control (RBAC) enforcement
- [ ] Team/organization support
- [ ] Audit trail for all actions
- [ ] API rate limiting
- [ ] Webhook integrations
- [ ] Public API for external tools

## Timeline

| Phase | Scope | Status |
|-------|-------|--------|
| **1A** | Foundation: monorepo, API, dashboard skeleton | **Done** |
| **1B** | Dashboard polish: edit forms, detail pages, UX | Planned |
| **2** | Template engine: upload, preview, config editor | Planned |
| **3** | Deployment pipeline: Vercel/Netlify, one-click deploy | Planned |
| **4** | Monitoring: health checks, SSL, uptime, alerts | Planned |
| **5** | Multi-tenancy: RBAC, teams, webhooks, public API | Planned |

## Environment Variables

Copy `.env.example` to `packages/api/.env` and adjust:

```env
DATABASE_URL="postgresql://lpf_user:lpf_password@localhost:5433/lpf_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change-me-to-a-random-string"
JWT_EXPIRES_IN="7d"
API_PORT=5001
NODE_ENV=development
```

> **Note:** Docker PostgreSQL runs on port **5433** to avoid conflict with local PostgreSQL on 5432.

## Conventions

| Area | Convention |
|------|-----------|
| DB columns | `snake_case` |
| TS properties | `camelCase` |
| Components | `PascalCase` |
| Files | `kebab-case` |
| Package scope | `@lpf/*` |
| API response | `{ success: true, data }` / `{ success: false, error }` |
| API pattern | Service → Controller → Route |
| Validation | Zod schemas in `@lpf/shared`, used by both FE and BE |

## License

Private project.
