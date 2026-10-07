# Ghana Analytics, Interactive Map & Realtime Incident Simulation Engine — Design Specification

**Document Path:** `docs/superpowers/specs/2026-10-07-ghana-analytics-map-realtime-feed-design.md`  
**Status:** Approved by User  
**Author:** Antigravity Pairing Assistant  
**Date:** 2026-10-07  
**Target Route:** `/admin/analytics`  

---

## 1. Executive Summary & Purpose

To provide DOVVSU officers, regional supervisors, intelligence analysts, and academic examiners with actionable operational awareness, SafeVoice requires a high-performance **Geographic Analytics & Realtime Incident Command Center**.

The analytics experience on `/admin/analytics` is upgraded from a single static map placeholder into an integrated operations dashboard that provides:
1. **Executive Operational KPIs:** Live metrics showing total logged incidents, active triage backlog, caseworker assignment rate, and median response timeline.
2. **Interactive Ghana Regional Map (Hybrid Vector + Mapbox Engine):** A high-detail, zero-dependency SVG representation of Ghana's 16 administrative regions that works 100% reliably in any environment without external API tokens, while gracefully supporting Mapbox GL tiles when `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is present.
3. **Realtime Incident Simulation Stream & Injector:** A live streaming ticker that simulates incoming incident reports across Ghana with automated radar pings on the map, playback controls (Play/Pause, Speed), and an instant test report injector.
4. **Recharts Deep Analytics Suite:** 4 synchronized visualizations covering incident category distribution (Donut), regional volume rankings (Horizontal Bar), 7-day intake trends (Area Chart), and case triage progression (Status Pipeline).

---

## 2. Page Architecture & Component Decomposition

### 2.1 File Organization
- **Page Container:** [`app/(dashboard)/admin/analytics/page.tsx`](file:///Users/user/development/safevoice/app/(dashboard)/admin/analytics/page.tsx)
- **Modular Components:**
  - [`components/feature/analytics/ExecutiveKpiBar.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/ExecutiveKpiBar.tsx): Top 4 operational metric cards.
  - [`components/feature/analytics/GhanaVectorMap.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/GhanaVectorMap.tsx): Vector SVG map of Ghana's 16 regions with heat density fills, interactive hover cards, and pulsing radar pings.
  - [`components/feature/analytics/RealtimeIncidentFeed.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/RealtimeIncidentFeed.tsx): Live streaming ticker with play/pause, speed controls, manual trigger button, and localized Ghanaian incident records.
  - [`components/feature/analytics/AnalyticsChartsSuite.tsx`](file:///Users/user/development/safevoice/components/feature/analytics/AnalyticsChartsSuite.tsx): 4 Recharts data visualizations.
  - [`constants/ghana-regions.ts`](file:///Users/user/development/safevoice/constants/ghana-regions.ts): Regional metadata, coordinates, capital cities, and SVG path polygons for all 16 regions of Ghana.

---

## 3. Ghana Map Specifications

### 3.1 The 16 Administrative Regions
All 16 official regions of Ghana are mapped with geographic coordinates, capitals, and baseline demographic weightings:
1. **Greater Accra** (Capital: Accra | High density corridor)
2. **Ashanti** (Capital: Kumasi | High density corridor)
3. **Western** (Capital: Sekondi-Takoradi)
4. **Western North** (Capital: Sefwi Wiawso)
5. **Central** (Capital: Cape Coast)
6. **Eastern** (Capital: Koforidua)
7. **Volta** (Capital: Ho)
8. **Oti** (Capital: Dambai)
9. **Northern** (Capital: Tamale)
10. **Savannah** (Capital: Damongo)
11. **North East** (Capital: Nalerigu)
12. **Upper East** (Capital: Bolgatanga)
13. **Upper West** (Capital: Wa)
14. **Bono** (Capital: Sunyani)
15. **Bono East** (Capital: Techiman)
16. **Ahafo** (Capital: Goaso)

### 3.2 Visual Design & Interactions
- **Choropleth Shading:** Regional polygons shade dynamically based on case volume, using brand teal gradations (`#006B5E15` to `#006B5E99`) with subtle borders.
- **Hover & Click Behavior:** Hovering highlights the regional boundary, displays active case count, top category, and regional capital. Clicking selects the region, filtering the live feed and charts.
- **Radar Ping Beacons:** New incoming incidents render an expanding concentric ring ripple animation at the region's centroid, color-coded by incident category:
  - Red (`#EF4444`): Physical Assault & Domestic Violence
  - Orange (`#F97316`): Child Abuse & Neglect
  - Violet (`#8B5CF6`): Stalking & Threat Harassment
  - Emerald (`#10B981`): Economic & Financial Deprivation
  - Gray (`#64748B`): General / Other Disclosures

---

## 4. Realtime Simulation Engine Specifications

### 4.1 Synthetic Stream Mechanics
- **Initial Baseline:** Merges real cases from the Supabase database with realistic synthetic incident records distributed across Ghanaian localities (e.g. *Kaneshie, Madina, Bantama, Asokwa, Tamale Central, Takoradi Market Circle, Ho Central*).
- **Automated Interval Generator:**
  - Interval options: Normal (6 seconds), Fast (3 seconds), Relaxed (12 seconds).
  - Can be paused/resumed at any time via a toggle button.
- **Manual Injector:** "Trigger Live Report" button allows evaluators to simulate an immediate high-priority case.
- **State Propagation:** Each generated incident updates the active case list, pushes a card to the top of the feed, triggers an animated pulse beacon on the map, and increments total counters.

---

## 5. Recharts Analytics Suite Specifications

### 5.1 Chart 1: Incident Category Breakdown (Donut)
- Component: `recharts` `PieChart`, `Pie`, `Cell`, `Tooltip`.
- Displays relative proportions across domestic violence, child abuse, harassment, and economic abuse.
- Custom tooltip with case count and percentage.

### 5.2 Chart 2: Regional Incident Volume Ranking (Horizontal Bar)
- Component: `recharts` `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`.
- Sorted descending by incident frequency across Ghana's 16 regions.
- Visual accent for Greater Accra and Ashanti clusters.

### 5.3 Chart 3: 7-Day Ingestion & Resolution Trend (Area Chart)
- Component: `recharts` `AreaChart`, `Area`, `XAxis`, `YAxis`.
- Dual series: "Reports Ingested" (teal area with gradient fill) vs "Cases Handled / Assigned" (emerald stroke).
- Captures surge days and resolution velocity.

### 5.4 Chart 4: Triage & Case Status Pipeline (Funnel / Stacked Bar)
- Tracks progression from `Needs Triage (Open)` to `In Progress (Caseworker Assigned)` to `Under Investigation` to `Resolved`.
- Highlights a key performance SLA indicator: 91.4% triaged within 24 hours.

---

## 6. Access Control & Quality Assurance
1. **Route Protection:** Route `/admin/analytics` remains strictly gated behind [`DashboardLayout`](file:///Users/user/development/safevoice/app/(dashboard)/layout.tsx) and middleware. Unauthenticated visitors are redirected to `/auth/admin-login`.
2. **Zero-Token Resiliency:** If `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is unset or invalid, the standalone vector map renders automatically with zero errors or warnings.
3. **Build & Typecheck Cleanliness:** All components must compile cleanly via `npm run build` and pass type-checking with zero errors.
