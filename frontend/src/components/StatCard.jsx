export default function StatCard({ icon: Icon, label, value, accent = 'brand' }) {
  const colors = {
    brand: 'from-brand-500 to-violet-500',
    emerald: 'from-emerald-500 to-teal-500',
    amber: 'from-amber-500 to-orange-500',
    rose: 'from-rose-500 to-pink-500',
  }
  return (
    <div className="card p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[accent]} text-white flex items-center justify-center shadow-lg`}>
          {Icon && <Icon size={22}/>}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value ?? '—'}</div>
        </div>
      </div>
    </div>
  )
}
