'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  GHANA_REGIONS,
  SIMULATION_TEMPLATES,
  INCIDENT_CATEGORIES,
} from '@/constants/ghana-regions'
import { getAnalyticsDataAction } from '@/server/actions/analytics'
import { ExecutiveKpiBar } from '@/components/feature/analytics/ExecutiveKpiBar'
import { GhanaVectorMap, LiveIncidentPing } from '@/components/feature/analytics/GhanaVectorMap'
import { RealtimeIncidentFeed, FeedIncident } from '@/components/feature/analytics/RealtimeIncidentFeed'
import { AnalyticsChartsSuite } from '@/components/feature/analytics/AnalyticsChartsSuite'
import { Radio, RefreshCw, Sparkles, Shield, MapPin, Zap } from 'lucide-react'

export default function AnalyticsPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState<boolean>(true)
  const [speedMs, setSpeedMs] = useState<number>(6000)
  const [activePings, setActivePings] = useState<LiveIncidentPing[]>([])

  // Regional case totals initialized with baseline values
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    GHANA_REGIONS.forEach((r) => {
      initial[r.id] = r.baseIncidents
    })
    return initial
  })

  // Category totals initialized with baseline values
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    general_abuse: 245,
    child_abuse: 142,
    gbv: 118,
    stalking: 94,
    financial: 68,
    other: 32,
  })

  // Feed items
  const [feed, setFeed] = useState<FeedIncident[]>([])
  const [totalCases, setTotalCases] = useState<number>(699)
  const [activeTriage, setActiveTriage] = useState<number>(47)

  const feedIdRef = useRef<number>(1000)

  // Generate a random simulated incident
  const generateSimulatedIncident = useCallback((): FeedIncident => {
    feedIdRef.current += 1
    const id = `sim-${feedIdRef.current}-${Date.now()}`

    // Weighted selection: Greater Accra & Ashanti get higher probability
    const weightedPool = [
      ...GHANA_REGIONS,
      GHANA_REGIONS.find((r) => r.id === 'greater_accra')!,
      GHANA_REGIONS.find((r) => r.id === 'greater_accra')!,
      GHANA_REGIONS.find((r) => r.id === 'ashanti')!,
      GHANA_REGIONS.find((r) => r.id === 'ashanti')!,
      GHANA_REGIONS.find((r) => r.id === 'western')!,
      GHANA_REGIONS.find((r) => r.id === 'central')!,
    ].filter(Boolean)

    const region = weightedPool[Math.floor(Math.random() * weightedPool.length)]
    const locality = region.localities[Math.floor(Math.random() * region.localities.length)]
    const template = SIMULATION_TEMPLATES[Math.floor(Math.random() * SIMULATION_TEMPLATES.length)]

    const randomPart1 = Math.floor(1000 + Math.random() * 9000)
    const randomPart2 = Math.floor(1000 + Math.random() * 9000)
    const caseNumber = `SV-${randomPart1}-${randomPart2}`

    return {
      id,
      caseNumber,
      category: template.type,
      priority: template.priority as 'urgent' | 'high' | 'medium',
      locality,
      regionId: region.id,
      regionName: region.name,
      narrative: template.narrative,
      timestamp: new Date(),
    }
  }, [])

  // Ingest an incident into the dashboard state
  const ingestIncident = useCallback((incident: FeedIncident) => {
    // Prepend to feed (limit to 50 items)
    setFeed((prev) => [incident, ...prev.slice(0, 49)])

    // Increment counters
    setTotalCases((prev) => prev + 1)
    setActiveTriage((prev) => prev + 1)

    setRegionCounts((prev) => ({
      ...prev,
      [incident.regionId]: (prev[incident.regionId] || 0) + 1,
    }))

    setCategoryCounts((prev) => ({
      ...prev,
      [incident.category]: (prev[incident.category] || 0) + 1,
    }))

    // Add animated map radar ping
    const ping: LiveIncidentPing = {
      id: incident.id,
      regionId: incident.regionId,
      category: incident.category,
      caseNumber: incident.caseNumber,
      locality: incident.locality,
      timestamp: incident.timestamp,
    }

    setActivePings((prev) => [...prev, ping])

    // Auto-clean ping from active animation after 10 seconds
    setTimeout(() => {
      setActivePings((prev) => prev.filter((p) => p.id !== ping.id))
    }, 10000)
  }, [])

  // Initial population on mount: load real cases + seed initial feed
  useEffect(() => {
    async function initData() {
      try {
        const result = await getAnalyticsDataAction()
        if (result.success && result.cases) {
          // Merge real cases if any exist
          result.cases.forEach((c: any) => {
            if (c.region) {
              const matched = GHANA_REGIONS.find(
                (r) => r.name.toLowerCase() === c.region.toLowerCase()
              )
              if (matched) {
                setRegionCounts((prev) => ({
                  ...prev,
                  [matched.id]: (prev[matched.id] || 0) + 1,
                }))
              }
            }
          })
        }
      } catch {
        // Fallback gracefully to baseline
      }

      // Seed 6 initial feed items so stream is immediately populated
      const initialFeed: FeedIncident[] = []
      for (let i = 0; i < 6; i++) {
        const inc = generateSimulatedIncident()
        // Stagger timestamps backwards
        inc.timestamp = new Date(Date.now() - (i + 1) * 25000)
        initialFeed.push(inc)
      }
      setFeed(initialFeed)
    }

    initData()
  }, [generateSimulatedIncident])

  // Periodic simulation loop
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      const newInc = generateSimulatedIncident()
      ingestIncident(newInc)
    }, speedMs)

    return () => clearInterval(interval)
  }, [isStreaming, speedMs, generateSimulatedIncident, ingestIncident])

  // Manual Trigger handler
  const handleTriggerManualIncident = () => {
    const inc = generateSimulatedIncident()
    ingestIncident(inc)
  }

  // Clear feed
  const handleClearFeed = () => {
    setFeed([])
    setActivePings([])
  }

  // Focus region
  const handleFocusRegion = (regionId: string) => {
    setSelectedRegionId(regionId)
  }

  // Assignment rate calculation
  const assignedRate = Math.round(((totalCases - activeTriage) / Math.max(totalCases, 1)) * 100)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Top Header & Operations Banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="display-sm text-ink sm:text-3xl font-bold tracking-tight">
              Operations & Geographic Intelligence
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Live Operations Mode
            </span>
          </div>
          <p className="body-sm text-body">
            Realtime nationwide surveillance, interactive Ghana regional clusters, and automated triage analytics.
          </p>
        </div>

        {/* Quick Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerManualIncident}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Live Ping</span>
          </button>
        </div>
      </header>

      {/* 1. Executive Operational KPI Bar */}
      <section>
        <ExecutiveKpiBar
          totalCases={totalCases}
          activeTriage={activeTriage}
          assignedRate={assignedRate}
          medianResponseMinutes={14}
          isStreaming={isStreaming}
        />
      </section>

      {/* 2. Main Command Split: Ghana Regional Map + Realtime Incident Feed */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Map): 7 columns on desktop */}
        <div className="lg:col-span-7 h-full">
          <GhanaVectorMap
            regionCounts={regionCounts}
            selectedRegionId={selectedRegionId}
            onSelectRegion={setSelectedRegionId}
            activePings={activePings}
          />
        </div>

        {/* Right Column (Live Feed): 5 columns on desktop */}
        <div className="lg:col-span-5 h-full">
          <RealtimeIncidentFeed
            feed={feed}
            isStreaming={isStreaming}
            onToggleStreaming={() => setIsStreaming(!isStreaming)}
            speedMs={speedMs}
            onChangeSpeed={setSpeedMs}
            onTriggerManualIncident={handleTriggerManualIncident}
            onClearFeed={handleClearFeed}
            onFocusRegion={handleFocusRegion}
            selectedRegionId={selectedRegionId}
          />
        </div>
      </section>

      {/* 3. Deep Analytics Section: Recharts Visualizations */}
      <section className="pt-4 border-t border-border">
        <div className="mb-6">
          <h2 className="body-lg-strong text-ink text-xl">
            National GBV & Domestic Abuse Reporting Trends
          </h2>
          <p className="body-sm text-body">
            Categorical, geographic, and temporal performance indicators synchronized with the national intake stream.
          </p>
        </div>

        <AnalyticsChartsSuite
          categoryCounts={categoryCounts}
          regionCounts={regionCounts}
          totalCases={totalCases}
        />
      </section>
    </div>
  )
}
