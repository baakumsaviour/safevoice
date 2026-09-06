import Link from 'next/link'
import Image from 'next/image'
import { Mic, ArrowRight, ShieldCheck, Volume2 } from 'lucide-react'

export function VoiceShowcase() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-ink text-on-dark rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 text-primary px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/10">
              <Volume2 className="w-4 h-4 text-primary" />
              <span>Voice-First Crisis Reporting</span>
            </div>

            <h2 className="display-sm text-white font-extrabold tracking-tight">
              Can't type safely? <br />
              <span className="text-primary">Just speak.</span> We record securely.
            </h2>

            <p className="body-md text-white/80 max-w-2xl leading-relaxed">
              Typing during an ongoing crisis or after traumatic events can be overwhelming or dangerous. SafeVoice
              allows you to record an encrypted voice note directly in your browser. No written description is
              required.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Encrypted WebM Audio</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Auto-stops on Quick Escape</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Listened only by certified caseworkers</span>
              </div>
            </div>

            <div className="pt-4">
              <Link href="/report">
                <button className="bg-primary text-on-primary py-4 px-8 rounded-full hover:opacity-90 transition-all font-bold body-md flex items-center gap-2 cursor-pointer shadow-lg">
                  <Mic className="w-5 h-5" />
                  <span>Start Voice or Form Report</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-white/5">
              <Image
                src="/security-lock.png"
                alt="Encrypted voice notes security illustration"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Decorative background grid */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(var(--canvas) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>
    </section>
  )
}
