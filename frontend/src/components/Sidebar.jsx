import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Upload, FileText, CheckSquare, Users, ScrollText, BarChart3, User, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

const items = {
  employee: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/upload', icon: Upload, label: 'Upload Document' },
    { to: '/my-documents', icon: FileText, label: 'My Documents' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
  verifier: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/verify', icon: CheckSquare, label: 'Verify Documents' },
    { to: '/verifier-history', icon: ScrollText, label: 'History' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
  admin: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin', icon: BarChart3, label: 'Admin Console' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/audit-logs', icon: ScrollText, label: 'Audit Logs' },
    { to: '/profile', icon: User, label: 'Profile' },
  ],
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const list = items[user?.role] || items.employee
  return (
    <>
      {open && <div onClick={onClose} className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"/>}
      <aside className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-0 h-screen lg:h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold">Menu</span>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <nav className="p-4 space-y-1">
          {list.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose} end={to === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
              <Icon size={18}/> <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
