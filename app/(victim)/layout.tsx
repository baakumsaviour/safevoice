import { type ReactNode } from 'react'
import { QuickEscape } from '@/components/ui/QuickEscape'

export default function VictimLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-canvas">
      {/* 
        This layout wraps the victim portal. 
        It ensures the Quick Escape button is always visible.
      */}
      {children}
      <QuickEscape />
    </div>
  )
}
