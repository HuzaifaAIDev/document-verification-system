import { useEffect, useState, useCallback } from 'react'
import { ExternalLink, FileText, Loader2, AlertCircle } from 'lucide-react'
import { documentService } from '../services/documentService.js'

/**
 * DocumentPreview
 * ──────────────
 * Renders an inline preview of a document (PDF or image) using a blob URL
 * fetched from the authenticated download endpoint.
 *
 * Props:
 *   doc      – DocumentResponse object (must have .id, .filename, .content_type)
 *   height   – optional CSS height string for the preview area (default '480px')
 */
export default function DocumentPreview({ doc, height = '480px' }) {
  const [state, setState] = useState({
    blobUrl: null,
    mimeType: null,
    loading: true,
    error: null,
  })

  const loadPreview = useCallback(async () => {
    if (!doc?.id) return
    setState({ blobUrl: null, mimeType: null, loading: true, error: null })
    try {
      const { blobUrl, mimeType } = await documentService.getPreviewBlobUrl(doc.id)
      setState({ blobUrl, mimeType, loading: false, error: null })
    } catch {
      setState({ blobUrl: null, mimeType: null, loading: false, error: 'Could not load preview.' })
    }
  }, [doc?.id])

  // Load when doc changes
  useEffect(() => {
    loadPreview()
    // Revoke the previous blob URL to avoid memory leaks
    return () => {
      setState((prev) => {
        if (prev.blobUrl) URL.revokeObjectURL(prev.blobUrl)
        return prev
      })
    }
  }, [loadPreview])

  const { blobUrl, mimeType, loading, error } = state

  const isPdf = mimeType === 'application/pdf'
  const isImage = mimeType?.startsWith('image/')

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-brand-500" />
          <span className="text-sm">Loading preview…</span>
        </div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3 text-slate-400 px-6 text-center">
          <AlertCircle size={32} className="text-rose-400" />
          <span className="text-sm">{error}</span>
          <button onClick={loadPreview} className="btn-secondary text-xs py-1.5 px-3">
            Retry
          </button>
        </div>
      </div>
    )
  }

  // ── PDF – embedded iframe ────────────────────────────────────────────────
  if (isPdf) {
    return (
      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" style={{ height }}>
        <iframe
          src={blobUrl}
          title={doc.filename}
          className="w-full h-full"
          style={{ border: 'none' }}
        />
      </div>
    )
  }

  // ── Image – embedded img ─────────────────────────────────────────────────
  if (isImage) {
    return (
      <div
        className="flex items-center justify-center rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
        style={{ height }}
      >
        <img
          src={blobUrl}
          alt={doc.filename}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    )
  }

  // ── Fallback – open in new tab ───────────────────────────────────────────
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700"
      style={{ height }}
    >
      <div className="flex flex-col items-center gap-4 text-slate-400 px-6 text-center">
        <FileText size={40} className="opacity-50" />

        <p className="text-sm">
          Inline preview is not available for this file type.
        </p>

        {blobUrl && (
          <a
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1.5"
          >
            <ExternalLink size={13} />
            Open in new tab
          </a>
        )}
      </div>
    </div>
  )
}