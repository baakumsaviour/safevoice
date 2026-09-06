'use client'

import { useState } from 'react'
import { Phone, ShieldAlert, HeartHandshake, Scale, Copy, Check } from 'lucide-react'

const GHANA_HELPLINES = [
  {
    name: 'DOVVSU (Police Domestic Violence)',
    number: '0302-773906',
    altNumber: '055-7799997',
    icon: ShieldAlert,
    desc: 'Ghana Police Unit for Domestic Violence & Child Protection',
    badge: 'Police Dispatch',
  },
  {
    name: 'National Emergency Service',
    number: '112',
    altNumber: null,
    icon: Phone,
    desc: 'Toll-free 24/7 Police, Ambulance & Fire Services across Ghana',
    badge: 'Toll-Free 24/7',
  },
  {
    name: 'National Gender & GBV Hotline',
    number: '0800-111-222',
    altNumber: null,
    icon: HeartHandshake,
    desc: 'Ministry of Gender, Children & Social Protection Helpline',
    badge: 'Confidential Toll-Free',
  },
  {
    name: 'Legal Aid Commission Ghana',
    number: '0302-662150',
    altNumber: null,
    icon: Scale,
    desc: 'Free legal counseling and representation for abuse victims',
    badge: 'Legal Support',
  },
]

export function HelplineBar() {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num.replace(/-/g, ''))
    setCopiedNumber(num)
    setTimeout(() => setCopiedNumber(null), 2000)
  }

  return (
    <section id="hotlines" className="bg-canvas-soft border-y border-border py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              <Phone className="w-3.5 h-3.5" />
              <span>Immediate Crisis Assistance</span>
            </div>
            <h2 className="display-xs text-ink font-bold">Verified Ghana Emergency Helplines</h2>
            <p className="body-sm text-body mt-1">
              If you or someone you know is in immediate life-threatening danger, call these official authorities directly.
            </p>
          </div>
          <span className="caption text-body">Toll-free & local rates apply</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GHANA_HELPLINES.map((line) => {
            const Icon = line.icon
            const cleanDial = line.number.replace(/-/g, '')

            return (
              <div
                key={line.name}
                className="bg-canvas p-5 rounded-2xl border border-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full">
                      {line.badge}
                    </span>
                  </div>

                  <h3 className="body-sm-strong text-ink leading-snug mb-1">{line.name}</h3>
                  <p className="caption text-body text-xs leading-relaxed mb-4">{line.desc}</p>
                </div>

                <div className="pt-3 border-t border-border flex items-center gap-2">
                  <a
                    href={`tel:${cleanDial}`}
                    className="flex-1 bg-primary text-on-primary text-center py-2.5 px-3 rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call {line.number}</span>
                  </a>
                  <button
                    onClick={() => handleCopy(line.number)}
                    className="p-2.5 rounded-xl border border-border text-body hover:text-ink hover:bg-canvas-soft transition-colors"
                    title="Copy phone number"
                  >
                    {copiedNumber === line.number ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
