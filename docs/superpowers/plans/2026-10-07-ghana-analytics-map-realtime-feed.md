# Implementation Plan: Ghana Analytics, Interactive Map & Realtime Incident Simulation Engine

**Spec:** [`docs/superpowers/specs/2026-10-07-ghana-analytics-map-realtime-feed-design.md`](file:///Users/user/development/safevoice/docs/superpowers/specs/2026-10-07-ghana-analytics-map-realtime-feed-design.md)  
**Date:** 2026-10-07  
**Branch:** main  

---

## Plan Overview
Upgrade [`/admin/analytics`](file:///Users/user/development/safevoice/app/(dashboard)/admin/analytics/page.tsx) into an operational Command Center featuring an interactive Ghana Regional Map (with zero-token SVG vector fallback and Mapbox GL support), live incident streaming ticker with playback controls and manual report injector, executive KPIs, and deep Recharts data visualizations.

---

## Tasks

### Task 1: Ghana Geographic & Regional Metadata Baseline
- Create [`constants/ghana-regions.ts`](file:///Users/user/development/safevoice/constants/ghana-regions.ts) defining:
  - All 16 administrative regions of Ghana.
  - Capitals, geographic centroids, normalized SVG bounding polygon coordinates.
  - Authentic Ghanaian localities (districts, towns, neighborhoods) for synthetic incident generation.
  - Incident category color mappings and icons.

### Task 2: Build Modular Analytics Components
- Create [`components/feature/analytics/ExecutiveKpiBar.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/ExecutiveKpiBar.tsx):
  - Total Logged Incidents, Active High-Priority Triage, Caseworker Assignment Rate, Median Response Window.
- Create [`components/feature/analytics/GhanaVectorMap.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/GhanaVectorMap.tsx):
  - SVG map rendering Ghana's 16 regions with heat density fills.
  - Interactive hover tooltips (capital, case count, top category).
  - Animated CSS radar pulse rings when new incidents arrive.
  - Mapbox GL toggle when `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is present.
- Create [`components/feature/analytics/RealtimeIncidentFeed.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/RealtimeIncidentFeed.tsx):
  - Streaming incident ticker with live relative timestamps.
  - Play / Pause simulation toggle, speed controls (1x / 2x / 4x), and "Trigger Instant Report" injector button.
  - Category and priority badges, Ghanaian locality tags, and click-to-focus on map action.
- Create [`components/feature/analytics/AnalyticsChartsSuite.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/AnalyticsChartsSuite.tsx):
  - Recharts Category Distribution Donut Chart.
  - Recharts 16-Region Incident Volume Horizontal Bar Chart.
  - Recharts 7-Day Ingestion & Resolution Curve Area Chart.
  - Recharts Case Triage Progression Pipeline.

### Task 3: Assemble Command Center in `app/(dashboard)/admin/analytics/page.tsx`
- Refactor page into client component managing synchronized live incident state between KPI bar, map, feed, and charts.
- Pull real initial records via `getAnalyticsDataAction()` while allowing continuous live simulation overlay.
- Region filtering: Clicking a region on the map filters both the feed and deep analytics charts.

### Task 4: Verification & Build Quality Gate
- Run `npm run build` to verify clean SSR compilation of `/admin/analytics`.
- Verify admin route gating remains intact.
- Commit and push to origin main.
