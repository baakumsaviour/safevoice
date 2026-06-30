'use client'

import { useEffect } from 'react'

export function QuickEscape() {
  const handleEscape = () => {
    // Replace the current history state to prevent using the back button
    window.location.replace('https://www.google.com')
  }

  // Keyboard shortcut: Pressing 'Esc' three times quickly
  useEffect(() => {
    let escCount = 0
    let lastEscTime = 0

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const now = Date.now()
        if (now - lastEscTime < 1000) {
          escCount++
        } else {
          escCount = 1
        }
        lastEscTime = now

        if (escCount >= 2) {
          handleEscape()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <button
      onClick={handleEscape}
      className="fixed bottom-6 right-6 z-[100] bg-red-600 hover:bg-red-700 text-white shadow-xl rounded-full px-6 py-4 flex items-center gap-2 transition-all font-semibold"
      title="Quick Escape (Press Esc twice)"
    >
      <span>Leave Site</span>
    </button>
  )
}
