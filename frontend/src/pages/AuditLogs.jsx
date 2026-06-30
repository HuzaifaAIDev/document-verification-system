import { useEffect, useState } from 'react'
import { adminService } from '../services/adminService.js'
import DataTable from '../components/DataTable.jsx'
import Loader from '../components/Loader.jsx'

export default function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { adminService.auditLogs({ limit: 300 }).then(setLogs).finally(() => setLoading(false)) }, [])
  if (loading) return <Loader full/>
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Audit Logs</h1>
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'user_id', label: 'User' },
          { key: 'action', label: 'Action' },
          { key: 'document_id', label: 'Doc' },
          { key: 'ip_address', label: 'IP' },
          { key: 'created_at', label: 'Time', render: (r) => new Date(r.created_at).toLocaleString() },
        ]} rows={logs}/>
    </div>
  )
}
