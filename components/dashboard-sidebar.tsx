'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LayoutDashboard, MessageSquare, Settings, LogOut } from 'lucide-react'

export function DashboardSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <aside className="w-64 border-r border-mute bg-ink flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-on-dark/20">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-on-primary font-black">S</span>
          </div>
          <span className="body-sm-strong text-on-dark">SAFEVOICE</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 px-4 py-3 rounded-[6px] transition-colors ${
            isActive('/dashboard') && !isActive('/dashboard/settings')
              ? 'bg-primary text-on-primary'
              : 'text-on-dark/70 hover:bg-on-dark/10'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="body-sm-strong">Triage Queue</span>
        </Link>

        <Link
          href="/dashboard/messages"
          className={`flex items-center gap-3 px-4 py-3 rounded-[6px] transition-colors ${
            isActive('/dashboard/messages')
              ? 'bg-primary text-on-primary'
              : 'text-on-dark/70 hover:bg-on-dark/10'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="body-sm-strong">Messages</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-[6px] transition-colors ${
            isActive('/dashboard/settings')
              ? 'bg-primary text-on-primary'
              : 'text-on-dark/70 hover:bg-on-dark/10'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="body-sm-strong">Settings</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-on-dark/20">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-on-dark/70 hover:bg-on-dark/10 rounded-[6px] transition-colors body-sm-strong">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
