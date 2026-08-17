'use client'

import 'mapbox-gl/dist/mapbox-gl.css'

// Mock data for heatmaps
const mockIncidents = [
  { id: 1, lat: 5.6037, lng: -0.1870, type: 'general_abuse', location: 'Accra' }, 
  { id: 2, lat: 6.6666, lng: -1.6163, type: 'child_abuse', location: 'Kumasi' },   
  { id: 3, lat: 9.4008, lng: -0.8393, type: 'gbv', location: 'Tamale' },           
]

export default function AnalyticsPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="mb-8">
        <h1 className="display-sm text-ink">Analytics & Heatmaps</h1>
        <p className="body-md text-body">Geographic distribution of reported incidents.</p>
      </header>

      <div className="flex-1 bg-white rounded-2xl border border-border overflow-hidden relative shadow-sm p-6">
        {mapboxToken ? (
          <div className="w-full h-full rounded-xl bg-canvas-soft border-2 border-dashed border-border flex flex-col items-center justify-center p-8 relative overflow-hidden">
            <h3 className="body-lg-strong text-ink mb-6 z-10">Mapbox Analytics (MVP Simulated View)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl z-10">
              {mockIncidents.map(incident => (
                <div key={incident.id} className="bg-canvas p-4 rounded-xl border border-border shadow-sm flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                  </div>
                  <span className="body-sm-strong text-ink">{incident.location}</span>
                  <span className="caption text-body uppercase">{incident.type.replace('_', ' ')}</span>
                </div>
              ))}
            </div>

            {/* Decorative background grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(var(--ink) 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-canvas-soft text-body p-6 text-center">
            <svg className="w-12 h-12 mb-4 text-mute" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="body-md-strong text-ink mb-2">Mapbox Token Missing</p>
            <p className="body-sm">
              Please set <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in your environment variables.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

