'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireRole, AuthError } from '@/server/auth'

const regionCoordinates: Record<string, { lat: number, lng: number }> = {
  'Greater Accra': { lat: 5.6037, lng: -0.1870 },
  'Ashanti': { lat: 6.6885, lng: -1.6244 },
  'Central': { lat: 5.1478, lng: -1.2587 },
  'Eastern': { lat: 6.3325, lng: -0.4580 },
  'Western': { lat: 5.0131, lng: -1.9755 },
  'Western North': { lat: 6.3000, lng: -2.8000 },
  'Volta': { lat: 6.1500, lng: 0.4000 },
  'Oti': { lat: 7.6000, lng: 0.3000 },
  'Northern': { lat: 9.4065, lng: -0.8393 },
  'Savannah': { lat: 8.8000, lng: -1.5000 },
  'North East': { lat: 10.2000, lng: -0.2000 },
  'Upper East': { lat: 10.7058, lng: -0.9822 },
  'Upper West': { lat: 10.3000, lng: -2.2000 },
  'Bono': { lat: 7.5000, lng: -2.0000 },
  'Bono East': { lat: 7.7000, lng: -1.2000 },
  'Ahafo': { lat: 7.0000, lng: -2.3000 },
}

export async function getAnalyticsDataAction() {
  try {
    await requireRole('caseworker', 'admin', 'analyst')
    const supabaseAdmin = createAdminClient()

    const { data: cases, error } = await supabaseAdmin
      .from('cases')
      .select('id, case_type, incident_location, incident_date, status, created_at')
      .neq('status', 'archived')

    if (error) throw error

    // Map location to coordinates
    const mappedCases = cases?.map(c => {
      // Try finding a match in the region string for our geocoded coordinates
      let lat = 7.9465
      let lng = -1.0232
      let matchedRegion = 'Unknown'

      if (c.incident_location) {
        for (const [region, coords] of Object.entries(regionCoordinates)) {
          if (c.incident_location.toLowerCase().includes(region.toLowerCase())) {
            lat = coords.lat
            lng = coords.lng
            matchedRegion = region
            break
          }
        }
      }

      // Add a small random jitter to avoid all markers stacking exactly on top of each other
      const jitterLat = (Math.random() - 0.5) * 0.1
      const jitterLng = (Math.random() - 0.5) * 0.1

      return {
        ...c,
        lat: matchedRegion !== 'Unknown' ? lat + jitterLat : null,
        lng: matchedRegion !== 'Unknown' ? lng + jitterLng : null,
        region: matchedRegion
      }
    }).filter(c => c.lat !== null && c.lng !== null) || []

    return { success: true, cases: mappedCases }
  } catch (error) {
    console.error('[analytics] fetch data error:', error)
    if (error instanceof AuthError) {
        return { error: error.code === 'UNAUTHENTICATED' ? 'Please sign in.' : 'You are not authorized to do this.' }
    }
    return { error: 'Failed to fetch analytics data' }
  }
}
