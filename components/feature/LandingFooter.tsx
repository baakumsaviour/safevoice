import Link from 'next/link'
import Image from 'next/image'
import { Shield, Phone, Lock, AlertTriangle } from 'lucide-react'

interface LandingFooterProps {
  onOpenTracker: () => void
}

export function LandingFooter({ onOpenTracker }: LandingFooterProps) {
  const handleQuickEscape = () => {
    try {
      document.title = 'Google'
      window.history.replaceState(null, '', '/')
      sessionStorage.clear()
    } catch {
      // Best effort
    }
    window.location.replace('https://www.google.com')
  }

  return (
    <footer className="bg-canvas border-t border-border mt-20 pt-16 pb-28 sm:pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Safety Alert Banner */}
        <div className="bg-red-50 border border-red-200 text-red-900 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="body-sm-strong">Emergency Safety Notice</p>
              <p className="caption text-red-800">
                If your device or internet history is monitored, use a safe phone, or click Leave Site below.
                Pressing <kbd className="bg-red-100 px-1.5 py-0.5 rounded font-mono font-semibold">ESC</kbd> twice will
                instantly replace this window with Google.
              </p>
            </div>
          </div>
          <button
            onClick={handleQuickEscape}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs py-2 px-5 rounded-full transition-colors shrink-0 cursor-pointer"
          >
            Leave Site Now
          </button>
        </div>

        {/* Main Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Image src="/safevoice logo.png" alt="SafeVoice Logo" width={28} height={28} className="object-contain" />
              </div>
              <span className="body-md-strong text-ink">SafeVoice Ghana</span>
            </div>
            <p className="body-sm text-body max-w-md">
              A trauma-informed incident documentation and crisis intervention platform. Designed to protect vulnerable
              citizens and survivors of abuse across all 16 regions of Ghana.
            </p>
          </div>

          <div>
            <h4 className="body-sm-strong text-ink mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-body">
              <li>
                <Link href="/report" className="hover:text-primary transition-colors">
                  Submit Encrypted Report
                </Link>
              </li>
              <li>
                <button onClick={onOpenTracker} className="hover:text-primary transition-colors cursor-pointer text-left">
                  Check Case Status
                </button>
              </li>
              <li>
                <a href="#hotlines" className="hover:text-primary transition-colors">
                  Emergency Helplines
                </a>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-primary transition-colors">
                  Caseworker Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="body-sm-strong text-ink mb-3">Privacy & Trust</h4>
            <ul className="space-y-2 text-sm text-body">
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>AES-256-GCM Encrypted</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Zero Logging Policy</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>Toll-Free 112 Linked</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-body">
          <p>© {new Date().getFullYear()} SafeVoice Ghana. All rights reserved. Confidential & Protected.</p>
          <p>Emergency Dispatch: Call 112 or DOVVSU directly if in life-threatening peril.</p>
        </div>
      </div>
    </footer>
  )
}
