import { ReactNode } from 'react'
import Link from 'next/link'
import { Shield, Map, MessageSquare, LogOut } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ink text-on-dark flex flex-col md:h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="body-md-strong">SafeVoice Admin</span>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/caseworker" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
            <MessageSquare className="w-5 h-5" />
            <span>Active Cases</span>
          </Link>
          <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors">
            <Map className="w-5 h-5" />
            <span>Analytics & Map</span>
          </Link>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button className="flex items-center gap-3 text-on-dark/70 hover:text-white transition-colors w-full">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen bg-canvas-soft">
        {children}
      </main>
    </div>
  )
}
