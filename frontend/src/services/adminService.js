import api from './api'

export const adminService = {
  stats: () => api.get('/admin/stats').then((r) => r.data),
  analytics: () => api.get('/admin/analytics').then((r) => r.data),
  users: (params = {}) => api.get('/admin/users', { params }).then((r) => r.data),
  activate: (id) => api.post(`/admin/users/${id}/activate`).then((r) => r.data),
  deactivate: (id) => api.post(`/admin/users/${id}/deactivate`).then((r) => r.data),
  changeRole: (id, role) => api.post(`/admin/users/${id}/role/${role}`).then((r) => r.data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),
  documents: (params = {}) => api.get('/admin/documents', { params }).then((r) => r.data),
  auditLogs: (params = {}) => api.get('/admin/audit-logs', { params }).then((r) => r.data),
}
