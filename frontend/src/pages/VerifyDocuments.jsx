import { useEffect, useState, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Eye,
} from 'lucide-react'
import { documentService } from '../services/documentService.js'
import Loader from '../components/Loader.jsx'
import DocumentPreview from '../components/DocumentPreview.jsx'

// ─── helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cls = {
    PENDING: 'badge-pending',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
  }[status] ?? 'badge-pending'
  return <span className={`badge ${cls}`}>{status}</span>
}

function ProfileRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm text-slate-800 dark:text-slate-100 font-medium break-all">
        {value}
      </span>
    </div>
  )
}

// ─── stage constants ───────────────────────────────────────────────────────────
const STAGE_USERS = 'USERS'
const STAGE_DOCS = 'DOCS'
const STAGE_REVIEW = 'REVIEW'

// ─── main component ────────────────────────────────────────────────────────────

export default function VerifyDocuments() {
  // Navigation
  const [stage, setStage] = useState(STAGE_USERS)

  // Users list
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const userSearchRef = useRef(null)

  // Selected user & their documents
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDocs, setUserDocs] = useState([])
  const [docsLoading, setDocsLoading] = useState(false)

  // Selected document
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [remarks, setRemarks] = useState('')
  const [deciding, setDeciding] = useState(false)

  // ── load users ─────────────────────────────────────────────────────────────
  const loadUsers = useCallback(async (q) => {
    setUsersLoading(true)
    try {
      const data = await documentService.verifierUsers({ q: q || undefined })
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }, [])

  // Debounced user search – keeps focus because we never unmount the input
  useEffect(() => {
    const t = setTimeout(() => loadUsers(userSearch), 300)
    return () => clearTimeout(t)
  }, [userSearch, loadUsers])

  // ── load documents for selected user ────────────────────────────────────────
  const loadUserDocs = useCallback(async (userId) => {
    setDocsLoading(true)
    try {
      const data = await documentService.verifierUserDocuments(userId)
      setUserDocs(data)
    } catch {
      toast.error('Failed to load documents')
    } finally {
      setDocsLoading(false)
    }
  }, [])

  // ── select user → go to DOCS stage ─────────────────────────────────────────
  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setSelectedDoc(null)
    setRemarks('')
    setStage(STAGE_DOCS)
    loadUserDocs(user.id)
  }

  // ── select document → go to REVIEW stage ────────────────────────────────────
  const handleSelectDoc = (doc) => {
    setSelectedDoc(doc)
    setRemarks('')
    setStage(STAGE_REVIEW)
  }

  // ── approve / reject ────────────────────────────────────────────────────────
  const decide = async (status) => {
    if (!selectedDoc) return
    setDeciding(true)
    try {
      await documentService.decide(selectedDoc.id, status, remarks)
      toast.success(`Document ${status.toLowerCase()}`)
      // Go back to the user's document list and refresh it
      setSelectedDoc(null)
      setRemarks('')
      setStage(STAGE_DOCS)
      await loadUserDocs(selectedUser.id)
      // Also silently refresh the user list (a user may no longer have pending docs)
      loadUsers(userSearch)
    } catch {
      toast.error('Action failed')
    } finally {
      setDeciding(false)
    }
  }

  // ── breadcrumb back navigation ───────────────────────────────────────────────
  const goToUsers = () => {
    setStage(STAGE_USERS)
    setSelectedUser(null)
    setSelectedDoc(null)
    setRemarks('')
    // Restore focus to user search after navigation
    setTimeout(() => userSearchRef.current?.focus(), 50)
  }

  const goToDocs = () => {
    setStage(STAGE_DOCS)
    setSelectedDoc(null)
    setRemarks('')
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE: USERS
  // ════════════════════════════════════════════════════════════════════════════
  if (stage === STAGE_USERS) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Verify Documents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Select a user to view their pending documents.
          </p>
        </div>

        {/* Search – never unmounts, so focus is always preserved */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            ref={userSearchRef}
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by name, username or email…"
            className="input pl-10"
          />
        </div>

        {/* Results area only shows loader — input stays mounted */}
        {usersLoading ? (
          <Loader />
        ) : users.length === 0 ? (
          <div className="card p-10 text-center text-slate-500 text-sm">
            {userSearch
              ? 'No users match your search.'
              : 'No users have pending documents right now.'}
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelectUser(u)}
                className="w-full text-left card p-4 hover:border-brand-500 transition flex items-center gap-4 group"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                  <User size={18} className="text-brand-600 dark:text-brand-400" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                    {u.first_name} {u.last_name}
                  </div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                </div>
                {/* Role badge */}
                <span className="badge badge-pending shrink-0 capitalize">{u.role}</span>
                <ChevronRight
                  size={16}
                  className="text-slate-400 group-hover:text-brand-500 transition shrink-0"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE: DOCS  (user profile + their documents)
  // ════════════════════════════════════════════════════════════════════════════
  if (stage === STAGE_DOCS) {
    const pendingCount = userDocs.filter((d) => d.status === 'PENDING').length

    return (
      <div className="space-y-5">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={goToUsers}
            className="flex items-center gap-1 hover:text-brand-600 transition"
          >
            <ChevronLeft size={15} />
            Users
          </button>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-100 font-medium truncate">
            {selectedUser.first_name} {selectedUser.last_name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── User profile card ── */}
          <div className="lg:col-span-1">
            <div className="card p-5 space-y-4 sticky top-20">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                  <User size={22} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </div>
                  <span className="badge badge-pending capitalize text-xs mt-0.5">
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Profile fields */}
              <div className="space-y-3">
                <ProfileRow label="User ID" value={`#${selectedUser.id}`} />
                <ProfileRow label="Username" value={selectedUser.username} />
                <ProfileRow label="Email" value={selectedUser.email} />
                <ProfileRow label="Phone" value={selectedUser.phone} />
                <ProfileRow
                  label="Account status"
                  value={selectedUser.is_active ? 'Active' : 'Inactive'}
                />
                <ProfileRow
                  label="Email verified"
                  value={selectedUser.is_verified ? 'Yes' : 'Pending'}
                />
                <ProfileRow
                  label="Member since"
                  value={new Date(selectedUser.created_at).toLocaleDateString()}
                />
                {selectedUser.last_login && (
                  <ProfileRow
                    label="Last login"
                    value={new Date(selectedUser.last_login).toLocaleString()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Document list ── */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                Documents
              </h2>
              {pendingCount > 0 && (
                <span className="badge badge-pending">{pendingCount} pending</span>
              )}
            </div>

            {docsLoading ? (
              <Loader />
            ) : userDocs.length === 0 ? (
              <div className="card p-10 text-center text-slate-500 text-sm">
                This user has no documents.
              </div>
            ) : (
              <div className="space-y-2">
                {userDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectDoc(doc)}
                    className="w-full text-left card p-4 hover:border-brand-500 transition flex items-center gap-3 group"
                  >
                    <FileText size={20} className="text-brand-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">
                        {doc.filename}
                      </div>
                      <div className="text-xs text-slate-500">
                        {(doc.size / 1024).toFixed(1)} KB ·{' '}
                        {new Date(doc.created_at).toLocaleString()}
                      </div>
                    </div>
                    <StatusBadge status={doc.status} />
                    <ChevronRight
                      size={16}
                      className="text-slate-400 group-hover:text-brand-500 transition shrink-0"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE: REVIEW  (preview + approve / reject)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
        <button
          onClick={goToUsers}
          className="flex items-center gap-1 hover:text-brand-600 transition"
        >
          <ChevronLeft size={15} />
          Users
        </button>
        <span>/</span>
        <button onClick={goToDocs} className="hover:text-brand-600 transition">
          {selectedUser.first_name} {selectedUser.last_name}
        </button>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-100 font-medium truncate max-w-xs">
          {selectedDoc.filename}
        </span>
      </nav>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* ── Preview panel ── */}
        <div className="xl:col-span-3 space-y-3">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-brand-500" />
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              Document Preview
            </h2>
          </div>

          <DocumentPreview doc={selectedDoc} height="520px" />

          {/* Download button below preview */}
          <button
            className="btn-secondary w-full"
            onClick={() => documentService.download(selectedDoc.id, selectedDoc.filename)}
          >
            <Download size={16} />
            Download document
          </button>
        </div>

        {/* ── Decision panel ── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Document metadata */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              Document Info
            </h3>
            <div className="space-y-2.5">
              <ProfileRow label="Filename" value={selectedDoc.filename} />
              <ProfileRow
                label="Size"
                value={`${(selectedDoc.size / 1024).toFixed(1)} KB`}
              />
              <ProfileRow label="Type" value={selectedDoc.content_type} />
              <ProfileRow
                label="Uploaded"
                value={new Date(selectedDoc.created_at).toLocaleString()}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-500">Status</span>
                <StatusBadge status={selectedDoc.status} />
              </div>
              {selectedDoc.remarks && (
                <ProfileRow label="Existing remarks" value={selectedDoc.remarks} />
              )}
            </div>
          </div>

          {/* Uploader profile summary */}
          <div className="card p-5 space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100">
              Uploaded by
            </h3>
            <div className="space-y-2.5">
              <ProfileRow
                label="Name"
                value={`${selectedUser.first_name} ${selectedUser.last_name}`}
              />
              <ProfileRow label="Email" value={selectedUser.email} />
              <ProfileRow label="User ID" value={`#${selectedUser.id}`} />
              <ProfileRow label="Role" value={selectedUser.role} />
            </div>
          </div>

          {/* OCR text (if present) */}
          {selectedDoc.extracted_text && (
            <div className="card p-5 space-y-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                Extracted text (OCR)
              </h3>
              <pre className="whitespace-pre-wrap text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl max-h-40 overflow-y-auto">
                {selectedDoc.extracted_text}
              </pre>
            </div>
          )}

          {/* Approve / Reject */}
          {selectedDoc.status === 'PENDING' ? (
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                Decision
              </h3>
              <div>
                <label className="label">Remarks (optional)</label>
                <textarea
                  className="input min-h-[90px]"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add notes for the uploader…"
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="btn-success flex-1"
                  disabled={deciding}
                  onClick={() => decide('APPROVED')}
                >
                  <CheckCircle2 size={18} />
                  {deciding ? 'Processing…' : 'Approve'}
                </button>
                <button
                  className="btn-danger flex-1"
                  disabled={deciding}
                  onClick={() => decide('REJECTED')}
                >
                  <XCircle size={18} />
                  {deciding ? 'Processing…' : 'Reject'}
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-5 space-y-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                Decision
              </h3>
              <p className="text-sm text-slate-500">
                This document has already been reviewed.
              </p>
              <StatusBadge status={selectedDoc.status} />
              {selectedDoc.remarks && (
                <p className="text-xs text-slate-500 pt-1">
                  Remarks: {selectedDoc.remarks}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}