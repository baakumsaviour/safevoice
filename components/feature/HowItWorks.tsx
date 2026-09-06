import { Mic, Lock, UserCheck, ShieldCheck } from 'lucide-react'

const STEPS = [
  {
    step: '01',
    icon: Mic,
    title: 'Report Your Way',
    desc: 'Speak freely with a secure voice note, upload documents/photos, or type what happened. No real name or registration is ever requested.',
  },
  {
    step: '02',
    icon: Lock,
    title: 'Zero-Knowledge Encryption',
    desc: 'All narratives and attached files are encrypted with server-side AES-256-GCM. Your story cannot be accessed by unauthorised parties or leaked.',
  },
  {
    step: '03',
    icon: UserCheck,
    title: 'Trauma-Informed Triage',
    desc: 'Certified Ghanaian caseworkers review the report securely, assign priority, and coordinate protective assistance or emergency intervention.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Simple, Safe & Confidential</span>
        </div>
        <h2 className="display-sm text-ink font-bold">How SafeVoice Protects You</h2>
        <p className="body-md text-body">
          We designed every step around trauma-informed care and victim privacy. You stay in control from start to finish.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.step}
              className="bg-canvas p-8 rounded-3xl border border-border shadow-xs hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-2xl font-black text-body/30 font-mono">{s.step}</span>
                </div>
                <h3 className="body-lg-strong text-ink mb-3">{s.title}</h3>
                <p className="body-sm text-body leading-relaxed">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
