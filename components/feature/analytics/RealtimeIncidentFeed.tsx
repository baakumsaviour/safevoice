'use client'

import { useState } from 'react'
import {
  Play,
  Pause,
  Zap,
  Radio,
  MapPin,
  Clock,
  Filter,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  Shield,
} from 'lucide-react'
import { INCIDENT_CATEGORIES } from '@/constants/ghana-regions'

export interface FeedIncident {
  id: string
  caseNumber: string
  category: string
  priority: 'urgent' | 'high' | 'medium'
  locality: string
  regionId: string
  regionName: string
  narrative: string
  timestamp: Date
}

interface RealtimeIncidentFeedProps {
  feed: FeedIncident[]
  isStreaming: boolean
  onToggleStreaming: () => void
  speedMs: number
  onChangeSpeed: (ms: number) => void
  onTriggerManualIncident: () => void
  onClearFeed: () => void
  onFocusRegion: (regionId: string) => void
  selectedRegionId: string | null
}

export function RealtimeIncidentFeed({
  feed,
  isStreaming,
  onToggleStreaming,
  speedMs,
  onChangeSpeed,
  onTriggerManualIncident,
  onClearFeed,
  onFocusRegion,
  selectedRegionId,
}: RealtimeIncidentFeedProps) {
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high'>('all')

  const filteredFeed = feed.filter((item) => {
    if (selectedRegionId && item.regionId !== selectedRegionId) return false
    if (priorityFilter === 'all') return true
    if (priorityFilter === 'urgent') return item.priority === 'urgent'
    if (priorityFilter === 'high') return item.priority === 'urgent' || item.priority === 'high'
    return true
  })

  // Format relative timestamp
  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  return (
    <div className="bg-canvas border border-border rounded-2xl overflow-hidden shadow-xs flex flex-col h-full min-h-[580px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border bg-canvas-soft/50 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isStreaming && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-3 w-3 ${
                  isStreaming ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
            </span>
            <h3 className="body-md-strong text-ink">Realtime Dispatch Feed</h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-canvas border border-border text-body">
              {isStreaming ? 'Streaming' : 'Paused'}
            </span>
          </div>

          {/* Injector button */}
          <button
            onClick={onTriggerManualIncident}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            title="Simulate a new incoming incident immediately"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Report</span>
          </button>
        </div>

        {/* Stream Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleStreaming}
              className={`p-1.5 rounded-lg border flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                isStreaming
                  ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume'}</span>
            </button>

            {/* Speed pills */}
            <div className="flex items-center rounded-lg border border-border overflow-hidden bg-canvas">
              <button
                onClick={() => onChangeSpeed(6000)}
                className={`px-2 py-1 transition-colors cursor-pointer ${
                  speedMs === 6000 ? 'bg-primary text-on-primary font-bold' : 'text-body hover:text-ink'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => onChangeSpeed(3000)}
                className={`px-2 py-1 transition-colors cursor-pointer border-l border-border ${
                  speedMs === 3000 ? 'bg-primary text-on-primary font-bold' : 'text-body hover:text-ink'
                }`}
              >
                2x
              </button>
              <button
                onClick={() => onChangeSpeed(1500)}
                className={`px-2 py-1 transition-colors cursor-pointer border-l border-border ${
                  speedMs === 1500 ? 'bg-primary text-on-primary font-bold' : 'text-body hover:text-ink'
                }`}
              >
                4x
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2 py-1 rounded-md border border-border bg-canvas text-xs text-ink cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent Only</option>
              <option value="high">High + Urgent</option>
            </select>

            <button
              onClick={onClearFeed}
              className="p-1 text-body hover:text-ink transition-colors cursor-pointer"
              title="Clear Feed History"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Feed List Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
        {filteredFeed.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-body space-y-2">
            <Radio className="w-8 h-8 opacity-40 text-primary" />
            <p className="body-sm-strong text-ink">No Incoming Incidents in View</p>
            <p className="caption text-body">
              Click &quot;Simulate Report&quot; or resume the feed to stream synthetic intake pings.
            </p>
          </div>
        ) : (
          filteredFeed.map((item) => {
            const cat = INCIDENT_CATEGORIES[item.category] || INCIDENT_CATEGORIES['other']
            const isUrgent = item.priority === 'urgent'
            const isHigh = item.priority === 'high'

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 bg-canvas space-y-2 ${
                  isUrgent
                    ? 'border-red-300 bg-red-50/20'
                    : isHigh
                    ? 'border-amber-200 bg-amber-50/15'
                    : 'border-border'
                }`}
              >
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-ink">{item.caseNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.badgeBg} ${cat.badgeText} ${cat.badgeBorder}`}
                    >
                      {cat.label}
                    </span>
                  </div>

                  <span className="caption text-body flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {getRelativeTime(item.timestamp)}
                  </span>
                </div>

                {/* Narrative Snippet */}
                <p className="caption text-body leading-relaxed line-clamp-2">{item.narrative}</p>

                {/* Bottom Row */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
                  <span className="caption font-medium text-ink flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-primary" />
                    {item.locality}, <strong className="text-primary">{item.regionName}</strong>
                  </span>

                  <button
                    onClick={() => onFocusRegion(item.regionId)}
                    className="caption font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Focus on Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border bg-canvas-soft text-center text-xs text-body flex items-center justify-between">
        <span>Showing {filteredFeed.length} streamed reports</span>
        <span className="caption text-body/80">Simulated Ghana Public Incident Stream</span>
      </div>
    </div>
  )
}
