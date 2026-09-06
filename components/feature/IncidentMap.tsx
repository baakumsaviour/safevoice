'use client'

import { useEffect, useState, useMemo } from 'react'
import Map, { Marker, Popup } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getAnalyticsDataAction } from '@/server/actions/analytics'

type CaseData = {
  id: string
  case_type: string
  incident_location: string
  incident_date: string
  status: string
  created_at: string
  lat: number
  lng: number
  region: string
}

const CASE_COLORS: Record<string, string> = {
  'general_abuse': '#ef4444', // red-500
  'child_abuse': '#f97316', // orange-500
  'gbv': '#8b5cf6', // violet-500
  'financial': '#10b981', // emerald-500
  'other': '#6b7280' // gray-500
}

export function IncidentMap() {
  const [incidents, setIncidents] = useState<CaseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<CaseData | null>(null)

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getAnalyticsDataAction()
        if (result.error) {
          setError(result.error)
        } else if (result.success && result.cases) {
          setIncidents(result.cases as CaseData[])
        }
      } catch (err) {
        setError('Failed to load map data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const legendItems = useMemo(() => {
    const types = Array.from(new Set(incidents.map(i => i.case_type)))
    return types.map(t => ({
      type: t,
      color: CASE_COLORS[t] || CASE_COLORS['other']
    }))
  }, [incidents])

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-canvas-soft text-body p-6 text-center">
        <svg className="w-12 h-12 mb-4 text-primary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="body-md-strong text-ink mb-2">Mapbox Token Missing</p>
        <p className="body-sm">
          Please set <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in your environment variables.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas-soft">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-canvas-soft text-ink body-md">
        {error}
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: -1.0232,
          latitude: 7.9465,
          zoom: 6
        }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
      >
        {incidents.map(incident => (
          <Marker
            key={incident.id}
            longitude={incident.lng}
            latitude={incident.lat}
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedIncident(incident);
            }}
          >
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer"
              style={{ backgroundColor: CASE_COLORS[incident.case_type] || CASE_COLORS['other'] }}
            />
          </Marker>
        ))}

        {selectedIncident && (
          <Popup
            longitude={selectedIncident.lng}
            latitude={selectedIncident.lat}
            anchor="bottom"
            onClose={() => setSelectedIncident(null)}
            closeOnClick={false}
            className="rounded-lg shadow-md text-left"
            maxWidth="300px"
          >
            <div className="p-1">
              <h4 className="body-sm-strong text-ink capitalize mb-1">
                {selectedIncident.case_type.replace(/_/g, ' ')}
              </h4>
              <p className="caption text-body mb-1">
                {selectedIncident.region} Region
              </p>
              <p className="caption text-body">
                {new Date(selectedIncident.incident_date || selectedIncident.created_at).toLocaleDateString()}
              </p>
              <p className="caption-strong text-ink mt-2 capitalize">
                Status: {selectedIncident.status.replace(/_/g, ' ')}
              </p>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-canvas/90 backdrop-blur-sm p-4 rounded-xl border border-border shadow-sm z-10">
        <h4 className="body-sm-strong text-ink mb-2">Incident Types</h4>
        <div className="flex flex-col gap-2">
          {legendItems.map(({ type, color }) => (
            <div key={type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
              <span className="caption text-body capitalize">{type.replace(/_/g, ' ')}</span>
            </div>
          ))}
          {legendItems.length === 0 && (
            <span className="caption text-body">No data available</span>
          )}
        </div>
      </div>
    </div>
  )
}
