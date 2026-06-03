'use client'

import { AlertCircle } from 'lucide-react'

export function QuickEscapeButton() {
  const handleEscape = () => {
    // Use replace to avoid leaving trace in browser history
    window.location.replace('https://www.google.com')
  }

  return (
    <button
      onClick={handleEscape}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
      aria-label="Quick escape to safe website"
      title="Click to quickly leave this site"
    >
      <AlertCircle className="w-4 h-4" />
      <span>Quick Escape</span>
    </button>
  )
}
