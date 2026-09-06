'use client'

import { useEffect } from 'react'

/**
 * Safety feature: instantly leaves the site (press Esc twice, or click).
 * Replaces the current history entry and clears the tab title so the visit
 * is less discoverable if someone else takes over the device.
 */
export function QuickEscape() {
  const handleEscape = () => {
    try {
      // Hide where we were: neutral title + replace this history entry.
      document.title = 'Google'
      window.history.replaceState(null, '', '/')
      sessionStorage.clear()
    } catch {
      // Best effort — leaving the page matters more than the cleanup.
    }
    window.location.replace('https://www.google.com')
  }

  // Keyboard shortcut: press 'Esc' twice within one second.
  useEffect(() => {
    let escCount = 0
    let lastEscTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now()
        escCount = now - lastEscTime < 1000 ? escCount + 1 : 1
        lastEscTime = now
        if (escCount >= 2) handleEscape()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <button
      onClick={handleEscape}
      className="fixed z-[100] bg-red-600 hover:bg-red-700 text-white shadow-xl rounded-full transition-all font-semibold
        bottom-6 left-4 px-4 py-2.5 text-sm
        sm:bottom-6 sm:right-6 sm:left-auto sm:px-6 sm:py-4 sm:text-base"
      title="Quick Escape (press Esc twice)"
    >
      <span>Leave Site</span>
    </button>
  )
}
