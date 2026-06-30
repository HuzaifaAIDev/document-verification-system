import api from './api'

export const authService = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  verifyOtp: (email, otp) => api.post('/auth/verify-otp', { email, otp }).then((r) => r.data),
  resendOtp: (email) => api.post('/auth/resend-otp', { email }).then((r) => r.data),
  login: (email, password, remember_me) => api.post('/auth/login', { email, password, remember_me }).then((r) => r.data),
  refresh: (refresh_token) => api.post('/auth/refresh', { refresh_token }).then((r) => r.data),
  logout: (refresh_token) => api.post('/auth/logout', { refresh_token }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  securityQuestions: (email) => api.get(`/auth/security-questions/${encodeURIComponent(email)}`).then((r) => r.data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data).then((r) => r.data),
  resetPassword: (token, new_password, confirm_password) =>
    api.post('/auth/reset-password', { token, new_password, confirm_password }).then((r) => r.data),
  changePassword: (old_password, new_password) =>
    api.post('/users/change-password', { old_password, new_password }).then((r) => r.data),
  updateProfile: (data) => api.put('/users/me', data).then((r) => r.data),
}
