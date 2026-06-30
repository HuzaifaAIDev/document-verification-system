export default function Loader({ full = false }) {
  const cls = full ? 'min-h-screen flex items-center justify-center' : 'flex items-center justify-center p-8'
  return (
    <div className={cls}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 dark:border-slate-700"></div>
        <div className="w-12 h-12 rounded-full border-4 border-brand-600 border-t-transparent animate-spin absolute inset-0"></div>
      </div>
    </div>
  )
}
