import { useEffect, useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { adminService } from '../services/adminService.js'
import DataTable from '../components/DataTable.jsx'
import SearchBar from '../components/SearchBar.jsx'
import Loader from '../components/Loader.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [confirm, setConfirm] = useState(null)

  // Track whether data has been loaded at least once.
  // On the very first render there is nothing to show, so we can display the
  // full-area loader.  On every subsequent refresh (search, filter, action)
  // we never unmount the component — we only show a lightweight spinner
  // overlay so the search input is NEVER removed from the DOM and therefore
  // never loses keyboard focus.
  const initialLoadDone = useRef(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await adminService.users({
        q: q || undefined,
        role: role || undefined,
      })
      setUsers(data)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
      initialLoadDone.current = true
    }
  }

  // Re-run immediately when role filter changes
  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role])

  // Debounce search input — the input itself is never unmounted so focus is safe
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const toggleActive = async (u) => {
    try {
      await (u.is_active ? adminService.deactivate : adminService.activate)(u.id)
      load()
    } catch {
      toast.error('Failed')
    }
  }

  const changeRole = async (u, r) => {
    try {
      await adminService.changeRole(u.id, r)
      toast.success('Role updated')
      load()
    } catch {
      toast.error('Failed')
    }
  }

  const remove = async () => {
    try {
      await adminService.deleteUser(confirm.id)
      toast.success('Deleted')
      setConfirm(null)
      load()
    } catch {
      toast.error('Failed')
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  //
  // IMPORTANT: we do NOT do `if (loading) return <Loader full />`
  // because that would unmount the entire component tree — including the
  // <SearchBar> input — on every keystroke, losing cursor focus.
  //
  // Instead:
  //   • On the very first load (before any data arrives) we show a full-area
  //     loader in the *results* section only.
  //   • On every subsequent refresh we keep everything mounted and show a
  //     subtle inline spinner next to the table heading while data loads.

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">User Management</h1>

      {/* ── Filters — always rendered, never unmounted ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="Search by name, email, username..."
          />
        </div>
        <select
          className="input sm:w-48"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          <option>employee</option>
          <option>verifier</option>
          <option>admin</option>
        </select>
      </div>

      {/* ── Results ── */}
      {loading && !initialLoadDone.current ? (
        // First-ever load — nothing to show yet, so a full spinner is fine
        <Loader />
      ) : (
        <div className="relative">
          {/* Overlay spinner during subsequent refreshes (search/filter/actions).
              The table stays mounted so the DOM (and focus) are preserved. */}
          {loading && (
            <div className="absolute inset-0 z-10 rounded-2xl bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
              <Loader />
            </div>
          )}

          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              {
                key: 'name',
                label: 'Name',
                render: (u) => `${u.first_name} ${u.last_name}`,
              },
              { key: 'email', label: 'Email' },
              {
                key: 'role',
                label: 'Role',
                render: (u) => (
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u, e.target.value)}
                    className="input py-1 text-xs"
                  >
                    <option>employee</option>
                    <option>verifier</option>
                    <option>admin</option>
                  </select>
                ),
              },
              {
                key: 'is_verified',
                label: 'Verified',
                render: (u) => (u.is_verified ? '✅' : '⏳'),
              },
              {
                key: 'is_active',
                label: 'Status',
                render: (u) => (
                  <button
                    onClick={() => toggleActive(u)}
                    className={`badge ${u.is_active ? 'badge-approved' : 'badge-rejected'}`}
                  >
                    {u.is_active ? 'Active' : 'Inactive'}
                  </button>
                ),
              },
              {
                key: 'actions',
                label: '',
                render: (u) => (
                  <button
                    onClick={() => setConfirm(u)}
                    className="text-rose-600 text-xs hover:underline"
                  >
                    Delete
                  </button>
                ),
              },
            ]}
            rows={users}
          />
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        danger
        title="Delete user?"
        message={`This will permanently remove ${confirm?.email}.`}
        onConfirm={remove}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}