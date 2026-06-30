export default function Pagination({ page, perPage, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  return (
    <div className="flex items-center justify-between mt-4">
      <span className="text-xs text-slate-500">Page {page} of {pages}</span>
      <div className="flex gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="btn-secondary disabled:opacity-50">Prev</button>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="btn-secondary disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}
