import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-white to-violet-50 dark:from-slate-950 dark:via-slate-900 dark:to-violet-950">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl"></div>
      </div>
      <div className="card p-8 max-w-md w-full animate-fade-in">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Shield size={22}/>
          </div>
          <span className="font-bold text-lg text-slate-800 dark:text-slate-100">DVS Portal</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 text-center">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">{footer}</div>}
      </div>
    </div>
  )
}
