# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Authentication

All endpoints except `/auth/login` require a valid JWT token in the Authorization header.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

## Servers

### List Servers
```http
GET /servers?page=1&perPage=20&search=app&env=prod&tags=primera,etl&sort=name:asc
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `perPage` (optional): Items per page (default: 30)
- `search` (optional): Search query for name, IP, OS, role
- `env` (optional): Filter by environment (prod, stg, dev)
- `tags` (optional): Comma-separated tags
- `sort` (optional): Sort field and order (e.g., name:asc, createdAt:desc)

**Response:**
```json
{
  "servers": [
    {
      "id": "00000000-0000-0000-0000-000000000001",
      "name": "srv-app-001",
      "ipAddress": "10.20.30.40",
      "environment": "prod",
      "os": "Windows Server 2022",
      "role": "Application",
      "location": "DC-1 Rack-12",
      "attributes": {
        "owner_dept": "IT運用",
        "backup_policy": "Daily",
        "cpu_cores": 8,
        "memory_gb": 32
      },
      "createdAt": "2025-12-05T09:00:00.000Z",
      "updatedAt": "2025-12-05T09:00:00.000Z",
      "tags": [
        { "serverId": "...", "tag": "primera" },
        { "serverId": "...", "tag": "etl" }
      ]
    }
  ],
  "total": 2,
  "page": 1,
  "perPage": 20,
  "totalPages": 1
}
```

### Get Server Details
```http
GET /servers/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "name": "srv-app-001",
  "ipAddress": "10.20.30.40",
  "environment": "prod",
  "os": "Windows Server 2022",
  "role": "Application",
  "location": "DC-1 Rack-12",
  "attributes": { ... },
  "tags": [ ... ],
  "metrics": [ ... ],
  "createdAt": "2025-12-05T09:00:00.000Z",
  "updatedAt": "2025-12-05T09:00:00.000Z"
}
```

### Create Server
```http
POST /servers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "srv-app-002",
  "ipAddress": "10.20.30.42",
  "environment": "prod",
  "os": "Ubuntu 22.04",
  "role": "Application",
  "location": "DC-1 Rack-14",
  "attributes": {
    "owner_dept": "IT運用",
    "backup_policy": "Weekly",
    "cpu_cores": 4,
    "memory_gb": 16
  },
  "tags": ["nginx", "web"]
}
```

### Update Server
```http
PATCH /servers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "os": "Ubuntu 24.04",
  "attributes": {
    "memory_gb": 32
  }
}
```

### Delete Server
```http
DELETE /servers/:id
Authorization: Bearer <token>
```

## Server Fields (Metadata)

### List Field Definitions
```http
GET /server-fields
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "key": "owner_dept",
    "label": "所有部署",
    "type": "string",
    "unit": null,
    "options": null,
    "required": false,
    "group": "資産",
    "orderIndex": 10,
    "visible": true,
    "defaultValue": null
  },
  {
    "id": 2,
    "key": "backup_policy",
    "label": "バックアップポリシー",
    "type": "enum",
    "options": { "values": ["Daily", "Weekly", "Monthly", "None"] },
    "required": false,
    "group": "運用",
    "orderIndex": 20,
    "visible": true,
    "defaultValue": null
  }
]
```

### Create Field Definition
```http
POST /server-fields
Authorization: Bearer <token>
Content-Type: application/json

{
  "key": "warranty_date",
  "label": "保証期限",
  "type": "date",
  "group": "資産",
  "orderIndex": 60,
  "required": false,
  "visible": true
}
```

### Update Field Definition
```http
PATCH /server-fields/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "label": "保証終了日",
  "required": true
}
```

### Delete Field Definition
```http
DELETE /server-fields/:id
Authorization: Bearer <token>
```

## Metrics

### Get Latest Metrics for Server
```http
GET /servers/:id/metrics/latest
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "metric": "memory_used_percent",
    "ts": "2025-12-05T09:00:00.000Z",
    "value": 63.4
  },
  {
    "metric": "disk_free_tb",
    "ts": "2025-12-05T09:00:00.000Z",
    "value": 0.142
  }
]
```

### Get Metric History
```http
GET /servers/:id/metrics/:metric?from=2025-12-01&to=2025-12-05
Authorization: Bearer <token>
```

**Query Parameters:**
- `from` (optional): Start date (ISO 8601)
- `to` (optional): End date (ISO 8601)

**Response:**
```json
[
  {
    "id": 1,
    "serverId": "00000000-0000-0000-0000-000000000001",
    "metric": "memory_used_percent",
    "ts": "2025-12-05T09:00:00.000Z",
    "value": 63.4
  }
]
```

### Ingest Metrics (Bulk)
```http
POST /metrics/ingest
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "server_name": "srv-app-001",
      "metric": "memory_used_percent",
      "ts": "2025-12-05T09:00:00Z",
      "value": 63.4
    },
    {
      "server_id": "00000000-0000-0000-0000-000000000001",
      "metric": "disk_free_tb",
      "ts": "2025-12-05T09:00:00Z",
      "value": 0.142
    }
  ]
}
```

**Response:**
```json
[
  { "success": true },
  { "success": true }
]
```

## Audit Logs

### List Audit Logs
```http
GET /audit?page=1&perPage=20&serverId=...&actor=admin&from=2025-12-01&to=2025-12-05
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `perPage` (optional): Items per page
- `serverId` (optional): Filter by server ID
- `actor` (optional): Filter by username
- `from` (optional): Start date
- `to` (optional): End date

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "actor": "admin",
      "action": "create",
      "serverId": "00000000-0000-0000-0000-000000000001",
      "payload": { ... },
      "createdAt": "2025-12-05T09:00:00.000Z",
      "server": {
        "id": "00000000-0000-0000-0000-000000000001",
        "name": "srv-app-001"
      }
    }
  ],
  "total": 10,
  "page": 1,
  "perPage": 20,
  "totalPages": 1
}
```

## Error Responses

All endpoints may return the following error responses:

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Not Found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [ ... ]
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```
