import { useEffect, useState } from 'react'
import { documentService } from '../services/documentService.js'
import DataTable from '../components/DataTable.jsx'
import Loader from '../components/Loader.jsx'

export default function VerifierHistory() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { documentService.history().then(setRows).finally(() => setLoading(false)) }, [])
  if (loading) return <Loader/>
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Verification History</h1>
      <DataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'filename', label: 'Filename' },
          { key: 'status', label: 'Decision', render: (r) => <span className={`badge-${r.status === 'APPROVED' ? 'approved' : 'rejected'}`}>{r.status}</span> },
          { key: 'remarks', label: 'Remarks' },
          { key: 'updated_at', label: 'Date', render: (r) => new Date(r.updated_at).toLocaleString() },
        ]} rows={rows}/>
    </div>
  )
}
