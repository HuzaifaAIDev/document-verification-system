import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import AppShell from '../components/AppShell.jsx'

import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import VerifyOTP from '../pages/VerifyOTP.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import ResetPassword from '../pages/ResetPassword.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import UploadDocument from '../pages/UploadDocument.jsx'
import MyDocuments from '../pages/MyDocuments.jsx'
import VerifyDocuments from '../pages/VerifyDocuments.jsx'
import VerifierHistory from '../pages/VerifierHistory.jsx'
import AdminDashboard from '../pages/AdminDashboard.jsx'
import UserManagement from '../pages/UserManagement.jsx'
import AuditLogs from '../pages/AuditLogs.jsx'
import Profile from '../pages/Profile.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<ProtectedRoute roles={['employee','admin']}><UploadDocument /></ProtectedRoute>} />
        <Route path="/my-documents" element={<ProtectedRoute roles={['employee','admin']}><MyDocuments /></ProtectedRoute>} />
        <Route path="/verify" element={<ProtectedRoute roles={['verifier','admin']}><VerifyDocuments /></ProtectedRoute>} />
        <Route path="/verifier-history" element={<ProtectedRoute roles={['verifier','admin']}><VerifierHistory /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['admin']}><AuditLogs /></ProtectedRoute>} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
