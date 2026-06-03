'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, MessageSquare, Settings, LogOut } from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <span className="font-bold text-slate-900 dark:text-white">SafeVoice</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive('/dashboard') && !isActive('/dashboard/settings')
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-sm font-medium">Triage Queue</span>
        </Link>

        <Link
          href="/dashboard/messages"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive('/dashboard/messages')
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-medium">Messages</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive('/dashboard/settings')
              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
