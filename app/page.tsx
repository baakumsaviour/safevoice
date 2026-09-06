'use client'

import { useState } from 'react'
import { LandingNavbar } from '@/components/feature/LandingNavbar'
import { LandingHero } from '@/components/feature/LandingHero'
import { HelplineBar } from '@/components/feature/HelplineBar'
import { HowItWorks } from '@/components/feature/HowItWorks'
import { VoiceShowcase } from '@/components/feature/VoiceShowcase'
import { LandingFooter } from '@/components/feature/LandingFooter'
import { CaseTrackerModal } from '@/components/feature/CaseTrackerModal'
import { FloatingChatWidget } from '@/components/feature/FloatingChatWidget'

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isTrackerOpen, setIsTrackerOpen] = useState(false)

  return (
    <main className="min-h-screen bg-canvas flex flex-col relative text-ink selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <LandingNavbar onOpenTracker={() => setIsTrackerOpen(true)} />

      {/* Hero Section */}
      <LandingHero onOpenChat={() => setIsChatOpen(true)} />

      {/* Emergency Crisis Helplines Grid */}
      <HelplineBar />

      {/* 3-Step Privacy & How It Works */}
      <HowItWorks />

      {/* Voice-First Crisis Reporting Showcase */}
      <VoiceShowcase />

      {/* Footer with safety instructions & quick escape banner */}
      <LandingFooter onOpenTracker={() => setIsTrackerOpen(true)} />

      {/* Anonymous Case Status Lookup Modal */}
      <CaseTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

      {/* Expandable Bottom-Right Floating AI Chat Widget */}
      <FloatingChatWidget
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
      />
    </main>
  )
}
