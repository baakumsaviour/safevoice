'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, Lock, ArrowRight, MessageSquare, Mic, FileText, CheckCircle2 } from 'lucide-react'

interface LandingHeroProps {
  onOpenChat: () => void
}

export function LandingHero({ onOpenChat }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-canvas via-canvas-soft/40 to-canvas">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Left Column: Copy & Actions */}
        <div className="lg:col-span-7 space-y-8 text-left">
          {/* Trust Pill */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>100% Anonymous • AES-256 Encrypted • Ghana Support</span>
          </div>

          {/* Heading */}
          <h1 className="display-sm sm:display-md lg:display-lg text-ink font-extrabold tracking-tight text-balance">
            Speak up safely. <br className="hidden sm:inline" />
            <span className="text-primary">Your voice matters,</span> your identity stays protected.
          </h1>

          {/* Description */}
          <p className="body-md text-body max-w-2xl text-balance leading-relaxed">
            SafeVoice provides trauma-informed crisis reporting and intervention for Gender-Based Violence,
            domestic abuse, and child maltreatment across Ghana. Report with voice notes or written details. No
            account or personal identity required.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <Link href="/report" className="flex-1 sm:flex-initial">
              <button className="w-full bg-primary text-on-primary py-4 px-8 rounded-full hover:opacity-95 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2.5 font-bold body-md cursor-pointer group">
                <FileText className="w-5 h-5" />
                <span>Submit Confidential Report</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            <button
              onClick={onOpenChat}
              className="border-2 border-ink text-ink py-4 px-8 rounded-full hover:bg-ink hover:text-white transition-all flex items-center justify-center gap-2.5 font-semibold body-md cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>Chat with AI Assistant</span>
            </button>
          </div>

          {/* Key Safety Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2.5 text-body text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No signup or login required</span>
            </div>
            <div className="flex items-center gap-2.5 text-body text-xs">
              <Mic className="w-4 h-4 text-primary shrink-0" />
              <span>Voice notes or text reporting</span>
            </div>
            <div className="flex items-center gap-2.5 text-body text-xs">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>Wipes clean with Quick Escape</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-border/80 shadow-2xl bg-canvas-soft">
            <Image
              src="/hero-support.png"
              alt="SafeVoice compassionate support illustration"
              fill
              className="object-cover"
              priority
            />
            {/* Floating Protection Badge */}
            <div className="absolute bottom-4 left-4 right-4 bg-canvas/95 backdrop-blur-md p-4 rounded-2xl border border-border shadow-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="body-sm-strong text-ink leading-tight">Verified Anonymous</p>
                <p className="caption text-body text-xs truncate">Your IP & device are never stored or logged.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
