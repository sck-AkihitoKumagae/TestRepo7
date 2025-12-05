# Server Inventory Backend

NestJS backend API for the server inventory management system.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Seed the database (optional):
```bash
npx ts-node prisma/seed.ts
```

## Development

Start the development server:
```bash
npm run start:dev
```

The API will be available at http://localhost:3001

## API Endpoints

### Authentication
- POST `/api/auth/login` - Login and get JWT token

### Servers
- GET `/api/servers` - List all servers (with filtering, sorting, pagination)
- GET `/api/servers/:id` - Get server details
- POST `/api/servers` - Create new server
- PATCH `/api/servers/:id` - Update server
- DELETE `/api/servers/:id` - Delete server

### Server Fields (Metadata)
- GET `/api/server-fields` - List all field definitions
- POST `/api/server-fields` - Create new field definition
- PATCH `/api/server-fields/:id` - Update field definition
- DELETE `/api/server-fields/:id` - Delete field definition

### Metrics
- GET `/api/servers/:id/metrics/latest` - Get latest metrics for a server
- GET `/api/servers/:id/metrics/:metric` - Get metric history
- POST `/api/metrics/ingest` - Bulk ingest metrics

### Audit Logs
- GET `/api/audit` - List audit logs (with filtering)

## Production

Build and start:
```bash
npm run build
npm run start:prod
```
