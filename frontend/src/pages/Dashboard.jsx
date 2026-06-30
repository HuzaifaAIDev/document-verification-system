import { useEffect, useState } from 'react'
import { Files, CheckCircle2, Clock, XCircle, Users, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'
import { documentService } from '../services/documentService.js'
import { adminService } from '../services/adminService.js'
import StatCard from '../components/StatCard.jsx'
import DashboardCard from '../components/DashboardCard.jsx'
import DocumentCard from '../components/DocumentCard.jsx'
import Loader from '../components/Loader.jsx'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#6366f1', '#8b5cf6']

export default function Dashboard() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [stats, setStats] = useState(null)
  const [vstats, setVstats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        if (user.role === 'admin') {
          const [s, a] = await Promise.all([adminService.stats(), adminService.analytics()])
          setStats(s); setAnalytics(a)
        } else if (user.role === 'verifier') {
          setVstats(await documentService.verifierStats())
        } else {
          setDocs(await documentService.mine({ limit: 5 }))
        }
      } finally { setLoading(false) }
    })()
  }, [user.role])

  if (loading) return <Loader full/>

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Welcome, {user.first_name} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 capitalize">{user.role} dashboard</p>
        </div>
      </header>

      {user.role === 'admin' && stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={stats.total_users}/>
            <StatCard icon={Files} label="Total Documents" value={stats.total_documents} accent="emerald"/>
            <StatCard icon={Clock} label="Pending" value={stats.pending_documents} accent="amber"/>
            <StatCard icon={Shield} label="Verifiers" value={stats.total_verifiers} accent="rose"/>
          </div>
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <DashboardCard title="Documents by Status">
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={Object.entries(analytics.documents_by_status).map(([k, v]) => ({ name: k, value: v }))}>
                      <XAxis dataKey="name"/><YAxis allowDecimals={false}/>
                      <Tooltip/><Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
              <DashboardCard title="Users by Role">
                <div className="h-64">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={Object.entries(analytics.users_by_role).map(([name, value]) => ({ name, value }))}
                           dataKey="value" innerRadius={50} outerRadius={90} label>
                        {Object.keys(analytics.users_by_role).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                      </Pie>
                      <Tooltip/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </DashboardCard>
            </div>
          )}
        </>
      )}

      {user.role === 'verifier' && vstats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={Clock} label="Pending Queue" value={vstats.pending} accent="amber"/>
          <StatCard icon={CheckCircle2} label="Approved by Me" value={vstats.my_approved} accent="emerald"/>
          <StatCard icon={XCircle} label="Rejected by Me" value={vstats.my_rejected} accent="rose"/>
        </div>
      )}

      {user.role === 'employee' && (
        <DashboardCard title="Recent uploads">
          <div className="space-y-3">
            {docs.length === 0 ? (
              <p className="text-slate-500 text-sm">No documents yet. Upload your first one!</p>
            ) : docs.map((d) => <DocumentCard key={d.id} doc={d}/>)}
          </div>
        </DashboardCard>
      )}
    </div>
  )
}
