import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

// API functions
export const auth = {
  login: (username: string, password: string) =>
    api.post('/api/auth/login', { username, password }),
};

export const servers = {
  getAll: (params?: any) => api.get('/api/servers', { params }),
  getOne: (id: string) => api.get(`/api/servers/${id}`),
  create: (data: any) => api.post('/api/servers', data),
  update: (id: string, data: any) => api.patch(`/api/servers/${id}`, data),
  delete: (id: string) => api.delete(`/api/servers/${id}`),
};

export const serverFields = {
  getAll: () => api.get('/api/server-fields'),
  create: (data: any) => api.post('/api/server-fields', data),
  update: (id: number, data: any) => api.patch(`/api/server-fields/${id}`, data),
  delete: (id: number) => api.delete(`/api/server-fields/${id}`),
};

export const metrics = {
  getLatest: (serverId: string) =>
    api.get(`/api/servers/${serverId}/metrics/latest`),
  getHistory: (serverId: string, metric: string, params?: any) =>
    api.get(`/api/servers/${serverId}/metrics/${metric}`, { params }),
  ingest: (items: any[]) => api.post('/api/metrics/ingest', { items }),
};

export const audit = {
  getAll: (params?: any) => api.get('/api/audit', { params }),
};
