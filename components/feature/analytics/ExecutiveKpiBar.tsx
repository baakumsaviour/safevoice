'use client'

import { AlertCircle, Clock, ShieldCheck, TrendingUp, Radio } from 'lucide-react'

interface ExecutiveKpiBarProps {
  totalCases: number
  activeTriage: number
  assignedRate: number
  medianResponseMinutes: number
  isStreaming: boolean
}

export function ExecutiveKpiBar({
  totalCases,
  activeTriage,
  assignedRate,
  medianResponseMinutes,
  isStreaming,
}: ExecutiveKpiBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Incidents */}
      <div className="bg-canvas border border-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="caption-uppercase text-body">Total Incidents</span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="display-sm text-ink font-bold tracking-tight">{totalCases}</span>
          <span className="caption text-emerald-700 font-semibold flex items-center gap-1">
            {isStreaming && <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />}
            Live Intake
          </span>
        </div>
        <p className="caption text-body mt-1">Aggregated across all 16 Ghana regions</p>
      </div>

      {/* Needs Triage */}
      <div className="bg-canvas border border-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="caption-uppercase text-body">Awaiting Triage</span>
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="display-sm text-red-600 font-bold tracking-tight">{activeTriage}</span>
          <span className="caption text-red-600 font-semibold">Priority Queue</span>
        </div>
        <p className="caption text-body mt-1">Pending caseworker assignment or review</p>
      </div>

      {/* Caseworker Assignment Rate */}
      <div className="bg-canvas border border-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="caption-uppercase text-body">Assignment Rate</span>
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="display-sm text-ink font-bold tracking-tight">{assignedRate}%</span>
          <span className="caption text-primary font-semibold">Active Care</span>
        </div>
        <p className="caption text-body mt-1">Cases matched with DOVVSU officers</p>
      </div>

      {/* Median Response Time */}
      <div className="bg-canvas border border-border rounded-2xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="caption-uppercase text-body">Median Response</span>
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="display-sm text-ink font-bold tracking-tight">{medianResponseMinutes}m</span>
          <span className="caption text-emerald-700 font-semibold">SLA Met</span>
        </div>
        <p className="caption text-body mt-1">First outreach window from intake</p>
      </div>
    </div>
  )
}
