'use client'

import { useState, useMemo } from 'react'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  GHANA_REGIONS,
  GhanaRegion,
  INCIDENT_CATEGORIES,
} from '@/constants/ghana-regions'
import { Layers, MapPin, Radio, Shield, Info, Maximize2 } from 'lucide-react'

export interface LiveIncidentPing {
  id: string
  regionId: string
  category: string
  caseNumber: string
  locality: string
  timestamp: Date
}

interface GhanaVectorMapProps {
  regionCounts: Record<string, number>
  selectedRegionId: string | null
  onSelectRegion: (regionId: string | null) => void
  activePings: LiveIncidentPing[]
}

export function GhanaVectorMap({
  regionCounts,
  selectedRegionId,
  onSelectRegion,
  activePings,
}: GhanaVectorMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<GhanaRegion | null>(null)
  const [useMapbox, setUseMapbox] = useState(false)
  const [selectedMapboxCase, setSelectedMapboxCase] = useState<LiveIncidentPing | null>(null)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  // Maximum incident count for density normalization
  const maxIncidents = useMemo(() => {
    const counts = Object.values(regionCounts)
    return counts.length > 0 ? Math.max(...counts, 1) : 100
  }, [regionCounts])

  // Get fill color for region based on case density
  const getRegionFill = (regionId: string) => {
    const count = regionCounts[regionId] || 0
    const ratio = count / maxIncidents

    if (selectedRegionId === regionId) {
      return '#006B5E' // Active selection teal
    }

    if (ratio > 0.75) return '#C2410C' // High volume warm terracotta
    if (ratio > 0.5) return '#D97706' // Amber
    if (ratio > 0.25) return '#0D9488' // Medium teal
    return '#E2E8F0' // Low volume slate
  }

  const selectedRegion = GHANA_REGIONS.find((r) => r.id === selectedRegionId)

  return (
    <div className="bg-canvas border border-border rounded-2xl overflow-hidden shadow-xs flex flex-col h-full min-h-[580px]">
      {/* Map Control Header */}
      <div className="p-4 sm:p-5 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-canvas-soft/50">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="body-md-strong text-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Ghana Regional Incident Command Map
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              16 Regions
            </span>
          </div>
          <p className="caption text-body mt-0.5">
            Click any region to inspect localized incident load or clear filter.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedRegionId && (
            <button
              onClick={() => onSelectRegion(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
            >
              <span>Clear Filter ({selectedRegion?.name})</span>
              <span>×</span>
            </button>
          )}

          {mapboxToken && (
            <button
              onClick={() => setUseMapbox(!useMapbox)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-canvas border border-border text-ink hover:border-primary transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{useMapbox ? 'Switch to Vector Radar' : 'Switch to Mapbox GL'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Display Viewport */}
      <div className="relative flex-1 bg-slate-900 overflow-hidden flex items-center justify-center min-h-[480px]">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Mapbox Mode (Only if enabled and token present) */}
        {useMapbox && mapboxToken ? (
          <div className="w-full h-full min-h-[480px]">
            <Map
              mapboxAccessToken={mapboxToken}
              initialViewState={{
                longitude: -1.0232,
                latitude: 7.9465,
                zoom: 6.2,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/dark-v11"
            >
              {activePings.map((ping) => {
                const reg = GHANA_REGIONS.find((r) => r.id === ping.regionId)
                if (!reg) return null
                return (
                  <Marker
                    key={ping.id}
                    longitude={reg.lng}
                    latitude={reg.lat}
                    anchor="center"
                    onClick={(e) => {
                      e.originalEvent.stopPropagation()
                      setSelectedMapboxCase(ping)
                    }}
                  >
                    <div className="relative flex items-center justify-center cursor-pointer">
                      <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-md" />
                    </div>
                  </Marker>
                )
              })}

              {selectedMapboxCase && (
                <Popup
                  longitude={
                    GHANA_REGIONS.find((r) => r.id === selectedMapboxCase.regionId)?.lng || -1.0
                  }
                  latitude={
                    GHANA_REGIONS.find((r) => r.id === selectedMapboxCase.regionId)?.lat || 7.9
                  }
                  anchor="bottom"
                  onClose={() => setSelectedMapboxCase(null)}
                >
                  <div className="p-2 text-xs space-y-1">
                    <p className="font-bold text-ink">{selectedMapboxCase.caseNumber}</p>
                    <p className="text-body">{selectedMapboxCase.locality}</p>
                  </div>
                </Popup>
              )}
            </Map>
          </div>
        ) : (
          /* Native Interactive Ghana Vector SVG Map */
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <svg
              viewBox="0 0 500 700"
              className="w-full h-full max-h-[580px] drop-shadow-2xl select-none"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Glow filter for active radar pings */}
                <filter id="radar-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Ocean / Gulf of Guinea watermark text at bottom */}
              <text
                x="250"
                y="680"
                textAnchor="middle"
                fill="#475569"
                fontSize="12"
                fontWeight="600"
                letterSpacing="4"
              >
                GULF OF GUINEA (ATLANTIC OCEAN)
              </text>

              {/* 16 Regional Polygons */}
              {GHANA_REGIONS.map((region) => {
                const count = regionCounts[region.id] || 0
                const isSelected = selectedRegionId === region.id
                const isHovered = hoveredRegion?.id === region.id

                return (
                  <g
                    key={region.id}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    onClick={() =>
                      onSelectRegion(selectedRegionId === region.id ? null : region.id)
                    }
                  >
                    <path
                      d={region.svgPath}
                      fill={getRegionFill(region.id)}
                      stroke={isSelected ? '#FFFFFF' : isHovered ? '#38BDF8' : '#334155'}
                      strokeWidth={isSelected ? '3' : isHovered ? '2' : '1'}
                      className="transition-colors duration-200"
                      opacity={selectedRegionId && !isSelected ? 0.4 : 0.9}
                    />

                    {/* Regional Label */}
                    <text
                      x={region.mapX}
                      y={region.mapY - 8}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : '#CBD5E1'}
                      fontSize="9"
                      fontWeight="bold"
                      className="pointer-events-none tracking-tight select-none"
                    >
                      {region.name}
                    </text>

                    {/* Case Count Badge */}
                    <rect
                      x={region.mapX - 14}
                      y={region.mapY - 2}
                      width="28"
                      height="14"
                      rx="4"
                      fill={isSelected ? '#006B5E' : '#0F172A'}
                      stroke="#475569"
                      strokeWidth="0.5"
                      className="pointer-events-none"
                    />
                    <text
                      x={region.mapX}
                      y={region.mapY + 8}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="8"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      {count}
                    </text>
                  </g>
                )
              })}

              {/* Active Radar Beacons (Animated Incoming Reports) */}
              {activePings.map((ping) => {
                const reg = GHANA_REGIONS.find((r) => r.id === ping.regionId)
                if (!reg) return null
                const catColor = INCIDENT_CATEGORIES[ping.category]?.color || '#EF4444'

                return (
                  <g key={ping.id} className="pointer-events-none" filter="url(#radar-glow)">
                    {/* Concentric radar ripples */}
                    <circle cx={reg.mapX} cy={reg.mapY} r="8" fill="none" stroke={catColor} strokeWidth="2">
                      <animate
                        attributeName="r"
                        from="6"
                        to="36"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.9"
                        to="0"
                        dur="1.8s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle cx={reg.mapX} cy={reg.mapY} r="4" fill="none" stroke={catColor} strokeWidth="1.5">
                      <animate
                        attributeName="r"
                        from="4"
                        to="24"
                        dur="1.8s"
                        begin="0.4s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.8"
                        to="0"
                        dur="1.8s"
                        begin="0.4s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Central radar beacon core */}
                    <circle cx={reg.mapX} cy={reg.mapY} r="5" fill={catColor} stroke="#FFFFFF" strokeWidth="1.5" />
                  </g>
                )
              })}
            </svg>

            {/* Hover Tooltip Card (Overlay) */}
            {hoveredRegion && (
              <div
                className="absolute z-20 bg-ink/95 text-white backdrop-blur-md rounded-xl p-3 shadow-2xl border border-white/20 text-xs space-y-1.5 pointer-events-none transition-all"
                style={{
                  top: '16px',
                  right: '16px',
                  width: '210px',
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <span className="font-bold text-white text-sm">{hoveredRegion.name}</span>
                  <span className="caption text-emerald-400 font-mono">
                    {regionCounts[hoveredRegion.id] || 0} cases
                  </span>
                </div>
                <p className="text-white/70">
                  <span className="text-white/50">Capital:</span> {hoveredRegion.capital}
                </p>
                <p className="text-white/70">
                  <span className="text-white/50">High-volume zones:</span>{' '}
                  {hoveredRegion.localities.slice(0, 3).join(', ')}
                </p>
                <p className="caption text-amber-300 pt-0.5">
                  Click to lock dashboard focus to this region
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map Legend Bar */}
      <div className="p-4 border-t border-border bg-canvas flex flex-wrap items-center justify-between gap-3 text-xs text-body">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="caption-strong text-ink">Density Heat:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#E2E8F0] border border-slate-400" />
            <span>Low (&lt;25%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#0D9488]" />
            <span>Moderate (25–50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#D97706]" />
            <span>Elevated (50–75%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#C2410C]" />
            <span>High Cluster (&gt;75%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="caption text-body">
            Active Radar Pings: <strong>{activePings.length} Live</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
