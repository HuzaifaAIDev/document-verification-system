import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Moon, Sun, Shield, Menu, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { useEffect, useState } from 'react'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [dark, setDark] = useState(localStorage.getItem('dvs.dark') === '1')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dvs.dark', dark ? '1' : '0')
  }, [dark])

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Menu size={20} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-white font-bold">
              <Shield size={18} />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 hidden sm:inline">DVS Portal</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          <NavLink to="/profile" className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-white flex items-center justify-center font-semibold text-sm">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="text-left leading-tight">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
            </div>
          </NavLink>
          <button onClick={async () => { await logout(); nav('/login') }} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600">
            <LogOut size={18}/>
          </button>
        </div>
      </div>
    </header>
  )
}
