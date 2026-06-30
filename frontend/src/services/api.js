import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
})

api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem('dvs.access')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

let refreshing = null
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config
    if (err?.response?.status === 401 && !original._retry && localStorage.getItem('dvs.refresh')) {
      original._retry = true
      try {
        refreshing = refreshing || axios.post(
          (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/auth/refresh',
          { refresh_token: localStorage.getItem('dvs.refresh') }
        ).then((r) => {
          localStorage.setItem('dvs.access', r.data.access_token)
          localStorage.setItem('dvs.refresh', r.data.refresh_token)
          return r.data.access_token
        }).finally(() => { refreshing = null })
        const t = await refreshing
        original.headers.Authorization = `Bearer ${t}`
        return api(original)
      } catch (e) {
        localStorage.removeItem('dvs.access')
        localStorage.removeItem('dvs.refresh')
        if (!location.pathname.startsWith('/login')) location.href = '/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  }
)

export default api
