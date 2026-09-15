'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Calculator, ExternalLink, ShieldAlert, X } from 'lucide-react'
import { useStealth } from '@/components/stealth/StealthContext'

/**
 * Trauma-Informed Quick Escape & Camouflage Trigger.
 *
 * Provides two immediate options:
 * 1. Disguise to Calculator: Instantly transforms site to QuickCalc, stashing active draft in-memory.
 * 2. Jump to Google: Leaves site immediately and purges session.
 *
 * Keyboard shortcut: Press 'Esc' twice to instantly activate Calculator Disguise.
 */
export function QuickEscape() {
  const { isCamouflaged, activateCamouflage } = useStealth()
  const [showOptions, setShowOptions] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleExternalEscape = () => {
    try {
      document.title = 'Google'
      window.history.replaceState(null, '', '/')
      sessionStorage.clear()
    } catch {
      // Best effort
    }
    window.location.replace('https://www.google.com')
  }

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowOptions(false)
      }
    }
    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showOptions])

  // If already camouflaged, hide the escape button to avoid covering the calculator
  if (isCamouflaged) {
    return null
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bottom-6 left-4 sm:bottom-6 sm:right-6 sm:left-auto"
    >
      {/* Expanded Safety Options Popover */}
      {showOptions && (
        <div className="mb-3 bg-slate-900 border border-slate-700 text-white rounded-2xl p-4 shadow-2xl w-64 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Safety Escape
            </span>
            <button
              onClick={() => setShowOptions(false)}
              className="text-slate-400 hover:text-white p-1 rounded"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={async () => {
                setShowOptions(false)
                await activateCamouflage()
              }}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left transition-colors cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-slate-900 text-amber-400 group-hover:scale-105 transition-transform">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Disguise to Calculator</p>
                <p className="text-[10px] text-slate-400">Hides screen & saves draft</p>
              </div>
            </button>

            <button
              onClick={handleExternalEscape}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900/90 text-left border border-red-800/50 transition-colors cursor-pointer group"
            >
              <div className="p-2 rounded-lg bg-red-900/80 text-red-200 group-hover:scale-105 transition-transform">
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-red-100">Exit to Google</p>
                <p className="text-[10px] text-red-300">Leaves site & wipes session</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setShowOptions((prev) => !prev)}
        className="bg-red-600 hover:bg-red-700 text-white shadow-xl rounded-full transition-all font-semibold flex items-center gap-2
          px-4 py-2.5 text-sm sm:px-6 sm:py-3.5 sm:text-base cursor-pointer active:scale-95"
        title="Emergency Escape (Esc x 2 to disguise)"
      >
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        <span>Leave Site</span>
        <span className="hidden sm:inline text-xs font-normal text-red-200">(Esc x 2)</span>
      </button>
    </div>
  )
}
