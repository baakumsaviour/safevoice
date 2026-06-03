import Link from 'next/link'
import { Shield, Lock, MessageCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* Navigation - Dark Ink Band */}
      <header className="bg-ink text-on-dark sticky top-0 z-50">
        <div className="max-w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-white font-black text-lg">"</span>
            </div>
            <span className="body-sm-strong">SAFEVOICE</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/report" className="body-sm hover:text-primary transition-colors">Report</Link>
            <Link href="/dashboard" className="body-sm hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/analytics" className="body-sm hover:text-primary transition-colors">Analytics</Link>
          </nav>
        </div>
      </header>

      {/* Hero Band - Dark with Massive Headline */}
      <section className="bg-ink text-on-dark py-24 md:py-40 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <h1 className="display-hero mb-8 text-balance">PROTECTED VOICE</h1>
          <p className="body-lg max-w-2xl text-on-dark/90 mb-12">
            Trauma-informed case management system with military-grade security. Report safely. Manage securely. Thrive together.
          </p>
          <div className="flex gap-6 flex-wrap">
            <Link href="/report">
              <button className="bg-primary text-on-primary body-md font-normal py-3 px-12 rounded-[60px] hover:opacity-90 transition-opacity">
                Report Now
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="border-2 border-on-dark text-on-dark body-md font-normal py-3 px-12 rounded-[60px] hover:bg-on-dark/10 transition-colors">
                Caseworker Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Content Band - Three Features */}
      <section className="bg-canvas py-20 md:py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="flex flex-col gap-6">
              <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
                <Lock className="w-8 h-8 text-on-primary" />
              </div>
              <div>
                <h3 className="display-xs mb-4 text-ink">End-to-End Encrypted</h3>
                <p className="body-md text-body">All case narratives, messages, and evidence are protected with military-grade AES-256 encryption before transmission.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-6">
              <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
                <Shield className="w-8 h-8 text-on-primary" />
              </div>
              <div>
                <h3 className="display-xs mb-4 text-ink">Trauma-Informed</h3>
                <p className="body-md text-body">Quick escape button, minimal navigation, supportive language, and resources throughout. Designed by survivors, for survivors.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-6">
              <div className="w-16 h-16 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-8 h-8 text-on-primary" />
              </div>
              <div>
                <h3 className="display-xs mb-4 text-ink">Secure Messaging</h3>
                <p className="body-md text-body">Encrypted communication between victims and caseworkers. Full audit trail for compliance and accountability.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Selection Band - Light with Cards */}
      <section className="bg-canvas-soft py-20 md:py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="display-md text-ink text-center mb-4">ACCESS YOUR PORTAL</h2>
          <p className="body-md text-center text-body mb-16 max-w-2xl mx-auto">Choose your role to access the secure case management system.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Victim Portal Card */}
            <Link href="/report" className="group">
              <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10 hover:border-primary transition-all h-full flex flex-col">
                <div className="w-14 h-14 bg-primary rounded-sm flex items-center justify-center mb-6 group-hover:opacity-90 transition-opacity">
                  <Shield className="w-7 h-7 text-on-primary" />
                </div>
                <h3 className="display-xs text-ink mb-3">Victim Portal</h3>
                <p className="body-md text-body flex-grow mb-6">Report abuse securely and anonymously. Upload evidence. Access support resources 24/7.</p>
                <div className="body-sm-strong text-primary group-hover:gap-2 transition-all inline-flex items-center">
                  <span>Begin Report</span>
                  <span>→</span>
                </div>
              </div>
            </Link>

            {/* Caseworker Card */}
            <Link href="/dashboard" className="group">
              <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10 hover:border-primary transition-all h-full flex flex-col">
                <div className="w-14 h-14 bg-primary rounded-sm flex items-center justify-center mb-6 group-hover:opacity-90 transition-opacity">
                  <MessageCircle className="w-7 h-7 text-on-primary" />
                </div>
                <h3 className="display-xs text-ink mb-3">Caseworker Dashboard</h3>
                <p className="body-md text-body flex-grow mb-6">Manage cases, communicate securely, assign cases, and track progress with your team.</p>
                <div className="body-sm-strong text-primary group-hover:gap-2 transition-all inline-flex items-center">
                  <span>Access Dashboard</span>
                  <span>→</span>
                </div>
              </div>
            </Link>

            {/* Analytics Card */}
            <Link href="/analytics" className="group">
              <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10 hover:border-primary transition-all h-full flex flex-col">
                <div className="w-14 h-14 bg-primary rounded-sm flex items-center justify-center mb-6 group-hover:opacity-90 transition-opacity">
                  <svg className="w-7 h-7 text-on-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h18v18H3z" opacity="0.2"/>
                    <path d="M3 15h4v6H3zm6-9h4v15h-4zm6-3h4v18h-4z"/>
                  </svg>
                </div>
                <h3 className="display-xs text-ink mb-3">Analytics Hub</h3>
                <p className="body-md text-body flex-grow mb-6">View trends, geographic data, case metrics, and key performance indicators for your organization.</p>
                <div className="body-sm-strong text-primary group-hover:gap-2 transition-all inline-flex items-center">
                  <span>View Analytics</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Support Resources - Ink Band */}
      <section className="bg-ink text-on-dark py-20 md:py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="display-md mb-8 text-balance">IMMEDIATE SUPPORT</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <p className="body-sm-strong mb-2">National Sexual Assault Hotline</p>
              <p className="display-sm text-primary">1-800-656-4673</p>
              <p className="caption text-on-dark/70 mt-2">Available 24/7 | Confidential</p>
            </div>
            <div>
              <p className="body-sm-strong mb-2">National Domestic Violence Hotline</p>
              <p className="display-sm text-primary">1-800-799-7233</p>
              <p className="caption text-on-dark/70 mt-2">Available 24/7 | Multilingual</p>
            </div>
          </div>
          <div className="border-t border-on-dark/20 pt-8">
            <p className="caption text-on-dark/70">SafeVoice is a trauma-informed platform built in partnership with survivor advocacy organizations. Your privacy and safety are our highest priority.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
