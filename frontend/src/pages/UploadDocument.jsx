import { useState, useRef } from 'react'
import { UploadCloud, X, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { documentService } from '../services/documentService.js'

export default function UploadDocument() {
  const [files, setFiles] = useState([])
  const [progress, setProgress] = useState({})
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const onDrop = (e) => {
    e.preventDefault()
    setFiles([...files, ...Array.from(e.dataTransfer.files)])
  }

  const upload = async () => {
    if (!files.length) return
    setUploading(true)
    for (const f of files) {
      try {
        await documentService.upload(f, (p) => setProgress((s) => ({ ...s, [f.name]: p })))
        toast.success(`Uploaded ${f.name}`)
      } catch (e) {
        toast.error(`${f.name}: ${e.response?.data?.message || 'Failed'}`)
      }
    }
    setUploading(false); setFiles([]); setProgress({})
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Upload Document</h1>
      <div
        onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className="card border-2 border-dashed border-slate-300 dark:border-slate-700 p-10 text-center cursor-pointer hover:border-brand-500 transition">
        <UploadCloud size={48} className="mx-auto text-brand-500 mb-3"/>
        <p className="font-medium text-slate-700 dark:text-slate-200">Drop files here or click to browse</p>
        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOC, DOCX up to 10MB</p>
        <input ref={inputRef} type="file" multiple hidden
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={(e) => setFiles([...files, ...Array.from(e.target.files)])}/>
      </div>
      {files.length > 0 && (
        <div className="card p-4 space-y-3">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <FileText size={20} className="text-brand-500"/>
              <div className="flex-1">
                <div className="text-sm font-medium">{f.name}</div>
                <div className="h-2 mt-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all"
                       style={{ width: `${progress[f.name] || 0}%` }}/>
                </div>
              </div>
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                <X size={16}/>
              </button>
            </div>
          ))}
          <button onClick={upload} disabled={uploading} className="btn-primary w-full">
            {uploading ? 'Uploading…' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  )
}
