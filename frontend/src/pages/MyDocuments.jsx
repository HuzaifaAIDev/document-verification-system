import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { documentService } from '../services/documentService.js'
import DocumentCard from '../components/DocumentCard.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Loader from '../components/Loader.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function MyDocuments() {
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [confirm, setConfirm] = useState(null)

  const load = async () => {
    setLoading(true)
    try { setDocs(await documentService.mine({ q: q || undefined, status: status || undefined })) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [status])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [q])

  const remove = async () => {
    try {
      await documentService.remove(confirm.id)
      toast.success('Deleted')
      setConfirm(null); load()
    } catch (e) { toast.error('Failed') }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">My Documents</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1"><SearchBar value={q} onChange={setQ} placeholder="Search by filename..."/></div>
        <select className="input sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option>
        </select>
      </div>
      {loading ? <Loader/> : (
        <div className="space-y-3">
          {docs.length === 0 ? <p className="text-slate-500 text-sm">No documents found.</p> :
            docs.map((d) => (
              <DocumentCard key={d.id} doc={d}
                onDownload={(x) => documentService.download(x.id, x.filename)}
                onDelete={(x) => setConfirm(x)}/>
            ))}
        </div>
      )}
      <ConfirmModal open={!!confirm} title="Delete document?" message={`This will permanently remove "${confirm?.filename}".`}
        danger onConfirm={remove} onCancel={() => setConfirm(null)}/>
    </div>
  )
}
