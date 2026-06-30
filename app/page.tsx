'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Lock, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* Simple Navigation */}
      <header className="bg-canvas border-b border-mute sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-on-primary font-black text-lg">"</span>
            </div>
            <span className="body-sm-strong text-ink">SafeVoice</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/auth/login" className="body-sm text-ink hover:text-primary transition-colors">
              Sign in
            </Link>
            <Link href="/auth/signup" className="bg-primary text-on-primary body-sm font-normal py-2 px-6 rounded-[32px] hover:opacity-90 transition-opacity">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Image-Heavy */}
      <section className="py-12 md:py-20 px-8 bg-canvas-soft">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="caption-uppercase text-primary mb-4 inline-block">Your voice matters</span>
            <h1 className="display-lg text-ink mb-6 text-balance">
              Report safely and securely
            </h1>
            <p className="body-md text-body mb-8 max-w-md">
              Tell us what happened. We'll listen without judgment and connect you with professional support.
            </p>
            <Link href="/report">
              <button className="bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[32px] hover:opacity-90 transition-opacity">
                Start Report
              </button>
            </Link>
          </div>
          <div className="relative h-80 md:h-96">
            <Image
              src="/hero-support.png"
              alt="Supportive hands coming together"
              fill
              className="object-cover rounded-[12px]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Trust Section - Why SafeVoice */}
      <section className="py-20 md:py-32 px-8 bg-canvas">
        <div className="max-w-7xl mx-auto">
          <h2 className="display-md text-ink text-center mb-4">We keep you safe</h2>
          <p className="body-md text-center text-body mb-16 max-w-2xl mx-auto">
            Three things we promise you
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col gap-6">
              <div className="h-64 relative">
                <Image
                  src="/security-lock.png"
                  alt="Private and secure lock illustration"
                  fill
                  className="object-cover rounded-[12px]"
                />
              </div>
              <div>
                <h3 className="body-lg-strong text-ink mb-3">Completely private</h3>
                <p className="body-md text-body">Your report is encrypted. Only trained professionals can access it with your permission.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-6">
              <div className="h-64 relative">
                <Image
                  src="/confidential-private.png"
                  alt="Confidentiality icon"
                  fill
                  className="object-cover rounded-[12px]"
                />
              </div>
              <div>
                <h3 className="body-lg-strong text-ink mb-3">You're in control</h3>
                <p className="body-md text-body">Share only what you're comfortable with. You can update or add information anytime.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-6">
              <div className="h-64 bg-canvas-soft rounded-[12px] flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle className="w-20 h-20 text-primary mx-auto mb-4" />
                  <p className="body-md text-body">Accessible offline</p>
                </div>
              </div>
              <div>
                <h3 className="body-lg-strong text-ink mb-3">Always available</h3>
                <p className="body-md text-body">Access support resources anytime, even without internet. Your safety first.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-20 md:py-32 px-8 bg-ink text-on-dark">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="display-md mb-6 text-balance">Ready to share your story?</h2>
          <p className="body-md mb-12 text-on-dark/90">
            Start a report whenever you're ready. It's simple, safe, and confidential.
          </p>
          <Link href="/report">
            <button className="bg-primary text-on-primary body-md font-normal py-3 px-12 rounded-[32px] hover:opacity-90 transition-opacity inline-block">
              Report an Incident
            </button>
          </Link>
        </div>
      </section>

      {/* Support Resources Footer */}
      <section className="py-16 px-8 bg-canvas-soft border-t border-mute">
        <div className="max-w-7xl mx-auto">
          <h3 className="body-sm-strong text-ink text-center mb-8">Immediate help available 24/7</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <a href="tel:1-800-656-4673" className="bg-canvas rounded-[12px] p-6 border-2 border-primary/20 hover:border-primary transition-all text-center">
              <p className="caption-uppercase text-body mb-2">Sexual Assault Support</p>
              <p className="display-sm text-primary font-mono">1-800-656-HOPE</p>
              <p className="caption text-body mt-2">24/7 | Confidential</p>
            </a>
            <a href="tel:1-800-799-7233" className="bg-canvas rounded-[12px] p-6 border-2 border-primary/20 hover:border-primary transition-all text-center">
              <p className="caption-uppercase text-body mb-2">Domestic Violence Support</p>
              <p className="display-sm text-primary font-mono">1-800-799-SAFE</p>
              <p className="caption text-body mt-2">24/7 | Multilingual</p>
            </a>
          </div>
          <p className="caption text-body text-center mt-12">
            SafeVoice is confidential, trauma-informed, and judgment-free. You deserve support.
          </p>
        </div>
      </section>
    </main>
  )
}
