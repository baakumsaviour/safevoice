'use client'

import { IncidentMap } from '@/components/feature/IncidentMap'

export default function AnalyticsPage() {
  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="mb-8">
        <h1 className="display-sm text-ink">Analytics & Heatmaps</h1>
        <p className="body-md text-body">Geographic distribution of reported incidents.</p>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-border overflow-hidden relative shadow-sm p-6">
        <IncidentMap />
      </div>
    </div>
  )
}

