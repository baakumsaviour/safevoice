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
      className="fixed bottom-6 right-6 z-[100] bg-red-600 hover:bg-red-700 text-white shadow-xl rounded-full px-6 py-4 flex items-center gap-2 transition-all font-semibold"
      title="Quick Escape (press Esc twice)"
    >
      <span>Leave Site</span>
    </button>
  )
}
