import api from './api'

export const documentService = {
  // ── employee ──────────────────────────────────────────────────────────────
  upload: (file, onProgress) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/documents/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
    }).then((r) => r.data)
  },

  mine: (params = {}) => api.get('/documents/my', { params }).then((r) => r.data),

  get: (id) => api.get(`/documents/${id}`).then((r) => r.data),

  download: (id, filename) =>
    api.get(`/documents/${id}/download`, { responseType: 'blob' }).then((r) => {
      const url = URL.createObjectURL(r.data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `doc-${id}`
      a.click()
      URL.revokeObjectURL(url)
    }),

  remove: (id) => api.delete(`/documents/${id}`).then((r) => r.data),

  // ── verifier – flat queue (kept for backwards-compat / history page) ──────
  pending: (params = {}) => api.get('/verifier/pending', { params }).then((r) => r.data),
  history: (params = {}) => api.get('/verifier/history', { params }).then((r) => r.data),
  decide: (id, status, remarks) =>
    api.post(`/verifier/${id}/decision`, { status, remarks }).then((r) => r.data),
  verifierStats: () => api.get('/verifier/stats').then((r) => r.data),

  // ── verifier – user-centric workflow (NEW) ────────────────────────────────

  /** List users who have at least one PENDING document. */
  verifierUsers: (params = {}) =>
    api.get('/verifier/users', { params }).then((r) => r.data),

  /** Fetch the full profile of a single user. */
  verifierUserProfile: (userId) =>
    api.get(`/verifier/users/${userId}`).then((r) => r.data),

  /** Fetch all documents belonging to a user. */
  verifierUserDocuments: (userId, params = {}) =>
    api.get(`/verifier/users/${userId}/documents`, { params }).then((r) => r.data),

  /**
   * Return a blob URL + MIME type for inline preview.
   * The caller is responsible for calling URL.revokeObjectURL() when done.
   */
  getPreviewBlobUrl: (id) =>
    api
      .get(`/documents/${id}/download`, { responseType: 'blob' })
      .then((r) => ({ blobUrl: URL.createObjectURL(r.data), mimeType: r.data.type })),
}