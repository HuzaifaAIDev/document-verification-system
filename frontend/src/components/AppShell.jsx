import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function AppShell() {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar onToggleSidebar={() => setOpen(true)}/>
      <div className="flex">
        <Sidebar open={open} onClose={() => setOpen(false)}/>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
