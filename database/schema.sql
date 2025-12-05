-- Database schema for Server Inventory System

-- Create database
CREATE DATABASE server_inventory;

\c server_inventory;

-- Server Fields (Data Dictionary)
CREATE TABLE server_fields (
  id          BIGSERIAL PRIMARY KEY,
  key         TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  type        TEXT CHECK (type IN ('string','number','boolean','enum','date','url')) NOT NULL,
  unit        TEXT,
  options     JSONB,          -- enum values, etc.
  required    BOOLEAN DEFAULT FALSE,
  "group"     TEXT,           -- display group (e.g., 構成, 資産, 運用)
  order_index INT DEFAULT 0,
  visible     BOOLEAN DEFAULT TRUE,
  default_value JSONB
);

-- Servers
CREATE TABLE servers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  ip_address  INET,
  environment TEXT CHECK (environment IN ('prod','stg','dev')) NOT NULL,
  os          TEXT,
  role        TEXT,
  location    TEXT,
  attributes  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Server Tags
CREATE TABLE server_tags (
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  tag       TEXT NOT NULL,
  PRIMARY KEY (server_id, tag)
);

-- Metrics (Time Series Data)
CREATE TABLE metrics (
  id        BIGSERIAL PRIMARY KEY,
  server_id UUID REFERENCES servers(id) ON DELETE CASCADE,
  metric    TEXT NOT NULL,
  ts        TIMESTAMPTZ NOT NULL,
  value     NUMERIC NOT NULL
);

CREATE INDEX idx_metrics_server_metric_ts ON metrics(server_id, metric, ts DESC);

-- Audit Logs
CREATE TABLE audit_logs (
  id        BIGSERIAL PRIMARY KEY,
  actor     TEXT NOT NULL,
  action    TEXT NOT NULL,  -- create, update, delete, field_add
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  payload   JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_server_id ON audit_logs(server_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Materialized view for latest metrics
CREATE MATERIALIZED VIEW metrics_latest AS
SELECT DISTINCT ON (server_id, metric)
  server_id, metric, ts, value
FROM metrics
ORDER BY server_id, metric, ts DESC;

CREATE INDEX idx_metrics_latest_server_id ON metrics_latest(server_id);

-- Refresh function for metrics_latest
CREATE OR REPLACE FUNCTION refresh_metrics_latest()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY metrics_latest;
END;
$$ LANGUAGE plpgsql;

-- Sample data for server_fields
INSERT INTO server_fields (key, label, type, "group", order_index, required) VALUES
('owner_dept', '所有部署', 'string', '資産', 10, false),
('backup_policy', 'バックアップポリシー', 'enum', '運用', 20, false),
('maintenance_expiry', '保守期限', 'date', '資産', 30, false),
('cpu_cores', 'CPUコア数', 'number', '構成', 40, false),
('memory_gb', 'メモリ容量', 'number', '構成', 50, false);

-- Update backup_policy with enum options
UPDATE server_fields 
SET options = '{"values": ["Daily", "Weekly", "Monthly", "None"]}'::jsonb
WHERE key = 'backup_policy';

-- Sample servers
INSERT INTO servers (id, name, ip_address, environment, os, role, location, attributes) VALUES
('00000000-0000-0000-0000-000000000001', 'srv-app-001', '10.20.30.40', 'prod', 'Windows Server 2022', 'Application', 'DC-1 Rack-12', 
 '{"owner_dept": "IT運用", "backup_policy": "Daily", "maintenance_expiry": "2026-03-31", "cpu_cores": 8, "memory_gb": 32}'::jsonb),
('00000000-0000-0000-0000-000000000002', 'srv-db-001', '10.20.30.41', 'prod', 'Red Hat Enterprise Linux 9', 'Database', 'DC-1 Rack-13',
 '{"owner_dept": "データベース", "backup_policy": "Daily", "maintenance_expiry": "2027-12-31", "cpu_cores": 16, "memory_gb": 128}'::jsonb);

-- Sample tags
INSERT INTO server_tags (server_id, tag) VALUES
('00000000-0000-0000-0000-000000000001', 'primera'),
('00000000-0000-0000-0000-000000000001', 'etl'),
('00000000-0000-0000-0000-000000000002', 'postgresql'),
('00000000-0000-0000-0000-000000000002', 'production');

-- Sample metrics
INSERT INTO metrics (server_id, metric, ts, value) VALUES
('00000000-0000-0000-0000-000000000001', 'memory_used_percent', now(), 63.4),
('00000000-0000-0000-0000-000000000001', 'disk_free_tb', now(), 0.142),
('00000000-0000-0000-0000-000000000002', 'memory_used_percent', now(), 78.2),
('00000000-0000-0000-0000-000000000002', 'disk_free_tb', now(), 2.5);

-- Refresh materialized view
REFRESH MATERIALIZED VIEW metrics_latest;
