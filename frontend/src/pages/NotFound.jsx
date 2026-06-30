import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-7xl font-bold bg-gradient-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">404</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Page not found.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Go home</Link>
      </div>
    </div>
  )
}
