import { useEffect, useState } from 'react'
import { adminService } from '../services/adminService.js'
import StatCard from '../components/StatCard.jsx'
import DashboardCard from '../components/DashboardCard.jsx'
import Loader from '../components/Loader.jsx'
import { Users, Files, Clock, CheckCircle2, XCircle, Shield } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  useEffect(() => {
    Promise.all([adminService.stats(), adminService.analytics()]).then(([s, a]) => { setStats(s); setAnalytics(a) })
  }, [])
  if (!stats) return <Loader full/>
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Console</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users} label="Users" value={stats.total_users}/>
        <StatCard icon={Shield} label="Verifiers" value={stats.total_verifiers} accent="emerald"/>
        <StatCard icon={Files} label="Documents" value={stats.total_documents}/>
        <StatCard icon={Clock} label="Pending" value={stats.pending_documents} accent="amber"/>
        <StatCard icon={CheckCircle2} label="Approved" value={stats.approved_documents} accent="emerald"/>
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected_documents} accent="rose"/>
      </div>
      {analytics && (
        <DashboardCard title="Documents by Status">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={Object.entries(analytics.documents_by_status).map(([name, value]) => ({ name, value }))}>
                <XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/>
                <Bar dataKey="value" fill="#7c3aed" radius={[8,8,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      )}
    </div>
  )
}
