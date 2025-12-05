export interface Server {
  id: string;
  name: string;
  ipAddress: string | null;
  environment: 'prod' | 'stg' | 'dev';
  os: string | null;
  role: string | null;
  location: string | null;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  tags?: ServerTag[];
  metrics?: Metric[];
}

export interface ServerTag {
  serverId: string;
  tag: string;
}

export interface ServerField {
  id: number;
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'url';
  unit?: string;
  options?: any;
  required: boolean;
  group?: string;
  orderIndex: number;
  visible: boolean;
  defaultValue?: any;
}

export interface Metric {
  id: number;
  serverId: string;
  metric: string;
  ts: string;
  value: number;
}

export interface AuditLog {
  id: number;
  actor: string;
  action: string;
  serverId?: string;
  payload: any;
  createdAt: string;
  server?: {
    id: string;
    name: string;
  };
}
