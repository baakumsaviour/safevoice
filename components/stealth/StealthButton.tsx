'use client'

import React from 'react'
import { Calculator, EyeOff } from 'lucide-react'
import { useStealth } from './StealthContext'

interface StealthButtonProps {
  variant?: 'pill' | 'icon' | 'subtle'
  className?: string
  label?: string
}

export function StealthButton({
  variant = 'pill',
  className = '',
  label = 'Disguise',
}: StealthButtonProps) {
  const { activateCamouflage } = useStealth()

  if (variant === 'icon') {
    return (
      <button
        onClick={() => activateCamouflage()}
        type="button"
        className={`p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 ${className}`}
        title="Quick Disguise (or press Esc twice)"
        aria-label="Quick Disguise to Calculator"
      >
        <Calculator className="w-5 h-5" />
      </button>
    )
  }

  if (variant === 'subtle') {
    return (
      <button
        onClick={() => activateCamouflage()}
        type="button"
        className={`inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 ${className}`}
        title="Quick Disguise (or press Esc twice)"
      >
        <EyeOff className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    )
  }

  // Default 'pill' variant
  return (
    <button
      onClick={() => activateCamouflage()}
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-slate-200 bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-300 ${className}`}
      title="Quick Disguise to Calculator (or press Esc twice)"
    >
      <Calculator className="w-4 h-4 text-slate-600" />
      <span>{label}</span>
    </button>
  )
}
