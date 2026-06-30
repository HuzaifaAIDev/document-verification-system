import { FileText, Download, Trash2, Eye } from 'lucide-react'

const badge = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' }

export default function DocumentCard({ doc, onView, onDownload, onDelete }) {
  return (
    <div className="card p-4 flex items-center gap-4 hover:shadow-md transition">
      <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center">
        <FileText size={22}/>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-slate-800 dark:text-slate-100 truncate">{doc.filename}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {(doc.size/1024).toFixed(1)} KB · {new Date(doc.created_at).toLocaleString()}
        </div>
      </div>
      <span className={badge[doc.status] || 'badge'}>{doc.status}</span>
      <div className="flex items-center gap-1">
        {onView && <button onClick={() => onView(doc)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"><Eye size={16}/></button>}
        {onDownload && <button onClick={() => onDownload(doc)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600"><Download size={16}/></button>}
        {onDelete && <button onClick={() => onDelete(doc)} className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600"><Trash2 size={16}/></button>}
      </div>
    </div>
  )
}
