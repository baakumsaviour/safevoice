'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Shield, PhoneCall, Search, LogIn } from 'lucide-react'

interface LandingNavbarProps {
  onOpenTracker: () => void
}

export function LandingNavbar({ onOpenTracker }: LandingNavbarProps) {
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
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer shrink-0">
          <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Image
              src="/safevoice logo.png"
              alt="SafeVoice Logo"
              width={30}
              height={30}
              className="object-contain"
            />
          </div>
          <div>
            <span className="body-md-strong text-ink tracking-tight block">SafeVoice</span>
            <span className="caption text-body text-xs hidden sm:block">Ghana Crisis & Abuse Support</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 body-sm text-body">
          <a href="#hotlines" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-primary" />
            <span>Emergency Hotlines</span>
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span>How It Protects You</span>
          </a>
          <button
            onClick={onOpenTracker}
            className="hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer font-medium text-ink"
          >
            <Search className="w-4 h-4 text-primary" />
            <span>Check Case Status</span>
          </button>
        </nav>

        {/* Right Actions: Auth + Quick Escape */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenTracker}
            className="md:hidden p-2.5 rounded-full border border-border text-ink hover:bg-canvas-soft transition-colors cursor-pointer"
            title="Check Case Status"
          >
            <Search className="w-4 h-4 text-primary" />
          </button>

          <Link href="/auth/login" className="hidden sm:inline-flex">
            <button className="border border-border bg-canvas text-ink body-sm py-2.5 px-5 rounded-full hover:bg-canvas-soft transition-colors flex items-center gap-2 font-medium cursor-pointer">
              <LogIn className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          </Link>

          {/* Quick Escape */}
          <button
            onClick={handleQuickEscape}
            className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 sm:px-5 rounded-full transition-all shadow-md flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Press Esc twice or click to leave immediately"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>Leave Site</span>
            <span className="hidden lg:inline text-red-200 text-xs font-normal">(Esc x2)</span>
          </button>
        </div>
      </div>
    </header>
  )
}
