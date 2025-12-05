# System Architecture Diagram

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          User Browser                            │
│                      http://localhost:3000                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/HTTPS
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Frontend (Next.js 15)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages                                                    │  │
│  │  • / (root) → redirects to /servers                      │  │
│  │  • /servers → Server List Page                           │  │
│  │    - Search & Filter                                     │  │
│  │    - Data Grid                                           │  │
│  │    - Detail Drawer                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Client (lib/api.ts)                                 │  │
│  │  • Axios HTTP client                                     │  │
│  │  • JWT token injection                                   │  │
│  │  • SWR for caching                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API
                             │ /api/*
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Backend API (NestJS)                          │
│                   http://localhost:3001                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers & Services                                  │  │
│  │  ┌───────────────┐  ┌─────────────────┐                 │  │
│  │  │ Auth Module   │  │ Servers Module  │                 │  │
│  │  │ • Login       │  │ • CRUD          │                 │  │
│  │  │ • JWT         │  │ • Search/Filter │                 │  │
│  │  └───────────────┘  └─────────────────┘                 │  │
│  │  ┌───────────────┐  ┌─────────────────┐                 │  │
│  │  │ Fields Module │  │ Metrics Module  │                 │  │
│  │  │ • Data Dict   │  │ • Ingest        │                 │  │
│  │  │ • Metadata    │  │ • Query         │                 │  │
│  │  └───────────────┘  └─────────────────┘                 │  │
│  │  ┌───────────────┐                                       │  │
│  │  │ Audit Module  │                                       │  │
│  │  │ • Logging     │                                       │  │
│  │  └───────────────┘                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Prisma ORM                                              │  │
│  │  • Type-safe database client                            │  │
│  │  • Query builder                                         │  │
│  │  • Migrations                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ PostgreSQL Protocol
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   Database (PostgreSQL 14+)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables                                                  │  │
│  │  • server_fields    → Data dictionary                   │  │
│  │  • servers          → Server inventory (+ JSONB)        │  │
│  │  • server_tags      → Tags                              │  │
│  │  • metrics          → Time-series data                  │  │
│  │  • audit_logs       → Change tracking                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Views                                                   │  │
│  │  • metrics_latest   → Latest metric values (materialized)│  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Views Server List

```
User → Frontend → GET /api/servers?page=1&env=prod
                ↓
              Backend (ServersController)
                ↓
              ServersService
                ↓
              Prisma Client
                ↓
              PostgreSQL (servers table)
                ↓
              Backend (JSON response)
                ↓
              Frontend (SWR cache + render)
                ↓
              User sees server list
```

### 2. User Creates Server

```
User → Frontend → POST /api/servers + JWT token
                ↓
              Backend (JwtAuthGuard validates token)
                ↓
              ServersController
                ↓
              ServersService.create()
                ↓
              Prisma Client (transaction)
                ↓
              PostgreSQL (INSERT into servers + server_tags)
                ↓
              AuditService.log() (audit_logs table)
                ↓
              Backend (JSON response)
                ↓
              Frontend (updates cache)
                ↓
              User sees new server in list
```

### 3. External System Ingests Metrics

```
Monitoring System → POST /api/metrics/ingest + JWT token
                  ↓
                Backend (JwtAuthGuard)
                  ↓
                MetricsController
                  ↓
                MetricsService.ingestMetrics()
                  ↓
                Prisma Client (bulk INSERT)
                  ↓
                PostgreSQL (metrics table)
                  ↓
                Refresh materialized view (metrics_latest)
                  ↓
                Backend (JSON response with results)
```

## Module Dependencies

```
┌─────────────────────────────────────────┐
│          app.module.ts (Root)           │
│  - ConfigModule (global)                │
│  - PrismaModule (global)                │
└─────────────┬───────────────────────────┘
              │
    ┌─────────┼─────────┬────────┬─────────┐
    │         │         │        │         │
    ▼         ▼         ▼        ▼         ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌───────┐
│  Auth  │ │Servers│ │Fields│ │Metrics │ │ Audit │
│ Module │ │Module │ │Module│ │ Module │ │Module │
└────────┘ └───┬───┘ └──────┘ └────────┘ └───────┘
               │
               │ depends on
               │
           ┌───▼───────┐
           │AuditModule│
           └───────────┘
```

## Technology Stack

### Frontend Layer
```
Next.js 15 (App Router)
├── TypeScript 5.x
├── Tailwind CSS
├── SWR (data fetching)
├── Axios (HTTP client)
└── Lucide React (icons)
```

### Backend Layer
```
NestJS 11
├── TypeScript 5.x
├── Prisma ORM 5.22
├── Passport JWT
├── bcrypt (password hashing)
└── Express (underlying server)
```

### Database Layer
```
PostgreSQL 14+
├── JSONB (flexible attributes)
├── INET (IP addresses)
├── Materialized Views
├── Indexes
└── Triggers (future)
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
│                                                              │
│  1. Transport Security                                       │
│     • HTTPS/TLS (production)                                │
│                                                              │
│  2. Authentication                                           │
│     • JWT tokens (24h expiry)                               │
│     • Passport strategy                                      │
│                                                              │
│  3. Authorization                                            │
│     • JwtAuthGuard on all endpoints                         │
│     • Role-based access (foundation)                        │
│                                                              │
│  4. Input Validation                                         │
│     • Prisma type safety                                    │
│     • NestJS validation pipes                               │
│                                                              │
│  5. Audit Trail                                              │
│     • All mutations logged                                  │
│     • Actor + timestamp + payload                           │
│                                                              │
│  6. Database Security                                        │
│     • Prepared statements (Prisma)                          │
│     • SQL injection prevention                              │
│     • Connection pooling                                    │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Option 1: Docker Compose (Development/Testing)
```
┌────────────────────────────────────┐
│         docker-compose.yml         │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  Container: postgres         │ │
│  │  Port: 5432                  │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │  Container: backend          │ │
│  │  Port: 3001                  │ │
│  │  Depends: postgres           │ │
│  └──────────────────────────────┘ │
│  ┌──────────────────────────────┐ │
│  │  Container: frontend         │ │
│  │  Port: 3000                  │ │
│  │  Depends: backend            │ │
│  └──────────────────────────────┘ │
└────────────────────────────────────┘
```

### Option 2: Cloud Platform (Production)
```
┌─────────────────────────────────────────┐
│             Internet                     │
└───────────┬─────────────────────────────┘
            │
┌───────────▼─────────────────────────────┐
│        CDN / Load Balancer              │
└───────────┬─────────────────────────────┘
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
┌─────────┐   ┌──────────────┐
│ Vercel  │   │ Heroku/Railway│
│         │   │               │
│Frontend │   │   Backend     │
│(Static) │   │   (Node.js)   │
└─────────┘   └───────┬───────┘
                      │
              ┌───────▼────────┐
              │ Managed        │
              │ PostgreSQL     │
              │ (AWS RDS/      │
              │  Heroku        │
              │  Postgres)     │
              └────────────────┘
```

## Performance Optimizations

1. **Frontend**
   - SWR caching (30s refresh)
   - Virtual scrolling (future)
   - Code splitting
   - Image optimization

2. **Backend**
   - Database indexes
   - Query optimization
   - Connection pooling
   - Response caching (future)

3. **Database**
   - Primary key indexes
   - Foreign key indexes
   - Compound indexes (server_id, metric, ts)
   - Materialized views for aggregations

## Monitoring & Observability

```
Application Logs → Console (dev) / File (prod)
      │
      ├─→ Error tracking (future: Sentry)
      ├─→ Performance monitoring (future: New Relic)
      └─→ Audit logs → Database → Reports

Database
      ├─→ Slow query log
      ├─→ Connection stats
      └─→ pg_stat_statements

Infrastructure
      ├─→ CPU/Memory usage
      ├─→ Disk I/O
      └─→ Network traffic
```

## Scalability Considerations

### Horizontal Scaling
- Frontend: Multiple edge servers (Vercel)
- Backend: Multiple instances behind load balancer
- Database: Read replicas for queries

### Vertical Scaling
- Increase server resources as needed
- Database connection pool tuning
- Cache layer (Redis) for hot data

### Data Growth
- Metrics table: Time-series partitioning
- Audit logs: Archive old data
- Indexes: Regular maintenance
