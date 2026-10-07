export interface GhanaRegion {
  id: string
  name: string
  capital: string
  lat: number
  lng: number
  // SVG center point for pins in a 500x700 viewBox
  mapX: number
  mapY: number
  svgPath: string
  localities: string[]
  baseIncidents: number
}

export interface IncidentCategoryConfig {
  id: string
  label: string
  color: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
}

export const INCIDENT_CATEGORIES: Record<string, IncidentCategoryConfig> = {
  general_abuse: {
    id: 'general_abuse',
    label: 'Domestic Violence & Assault',
    color: '#EF4444',
    badgeBg: 'bg-red-50',
    badgeText: 'text-red-700',
    badgeBorder: 'border-red-200',
  },
  child_abuse: {
    id: 'child_abuse',
    label: 'Child Abuse & Endangerment',
    color: '#F97316',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
  },
  gbv: {
    id: 'gbv',
    label: 'Physical & Gender-Based Violence',
    color: '#DC2626',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
  stalking: {
    id: 'stalking',
    label: 'Harassment & Threat Stalking',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
  },
  financial: {
    id: 'financial',
    label: 'Economic & Financial Deprivation',
    color: '#10B981',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  other: {
    id: 'other',
    label: 'Other Sensitive Disclosures',
    color: '#64748B',
    badgeBg: 'bg-slate-50',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-200',
  },
}

// 16 Regions of Ghana with coordinated map coordinates in viewBox 0 0 500 700
export const GHANA_REGIONS: GhanaRegion[] = [
  {
    id: 'upper_west',
    name: 'Upper West',
    capital: 'Wa',
    lat: 10.3,
    lng: -2.2,
    mapX: 130,
    mapY: 100,
    svgPath: 'M 70,50 L 190,50 L 190,150 L 120,170 L 70,140 Z',
    localities: ['Wa Central', 'Jirapa', 'Lawra', 'Nandom', 'Tumu'],
    baseIncidents: 14,
  },
  {
    id: 'upper_east',
    name: 'Upper East',
    capital: 'Bolgatanga',
    lat: 10.7058,
    lng: -0.9822,
    mapX: 290,
    mapY: 80,
    svgPath: 'M 190,50 L 370,50 L 370,120 L 250,130 L 190,110 Z',
    localities: ['Bolgatanga Central', 'Navrongo', 'Bawku', 'Paga', 'Zuarungu'],
    baseIncidents: 19,
  },
  {
    id: 'north_east',
    name: 'North East',
    capital: 'Nalerigu',
    lat: 10.2,
    lng: -0.2,
    mapX: 340,
    mapY: 150,
    svgPath: 'M 250,130 L 370,120 L 410,170 L 280,180 Z',
    localities: ['Nalerigu', 'Walewale', 'Gambaga', 'Chereponi', 'Bunkpurugu'],
    baseIncidents: 11,
  },
  {
    id: 'savannah',
    name: 'Savannah',
    capital: 'Damongo',
    lat: 8.8,
    lng: -1.5,
    mapX: 160,
    mapY: 230,
    svgPath: 'M 70,140 L 120,170 L 190,150 L 250,180 L 220,300 L 90,270 Z',
    localities: ['Damongo', 'Bole', 'Salaga', 'Sawla', 'Buipe'],
    baseIncidents: 16,
  },
  {
    id: 'northern',
    name: 'Northern',
    capital: 'Tamale',
    lat: 9.4065,
    lng: -0.8393,
    mapX: 300,
    mapY: 220,
    svgPath: 'M 250,180 L 410,170 L 430,260 L 300,280 L 220,240 Z',
    localities: ['Tamale Central', 'Tamale South', 'Savelugu', 'Yendi', 'Bimbilla'],
    baseIncidents: 38,
  },
  {
    id: 'bono',
    name: 'Bono',
    capital: 'Sunyani',
    lat: 7.5,
    lng: -2.0,
    mapX: 120,
    mapY: 340,
    svgPath: 'M 90,270 L 170,290 L 160,390 L 80,380 Z',
    localities: ['Sunyani Central', 'Berekum', 'Dormaa Ahenkro', 'Wenchi'],
    baseIncidents: 22,
  },
  {
    id: 'bono_east',
    name: 'Bono East',
    capital: 'Techiman',
    lat: 7.7,
    lng: -1.2,
    mapX: 230,
    mapY: 330,
    svgPath: 'M 170,290 L 300,280 L 330,360 L 220,380 Z',
    localities: ['Techiman Central', 'Kintampo', 'Atebubu', 'Nkoranza', 'Yeji'],
    baseIncidents: 27,
  },
  {
    id: 'oti',
    name: 'Oti',
    capital: 'Dambai',
    lat: 7.6,
    lng: 0.3,
    mapX: 390,
    mapY: 320,
    svgPath: 'M 300,280 L 430,260 L 440,370 L 340,370 Z',
    localities: ['Dambai', 'Nkwanta', 'Jasikan', 'Kadjebi'],
    baseIncidents: 15,
  },
  {
    id: 'ahafo',
    name: 'Ahafo',
    capital: 'Goaso',
    lat: 7.0,
    lng: -2.3,
    mapX: 110,
    mapY: 410,
    svgPath: 'M 80,380 L 160,390 L 150,450 L 70,440 Z',
    localities: ['Goaso', 'Bechem', 'Duayaw Nkwanta', 'Kenyasi', 'Mim'],
    baseIncidents: 12,
  },
  {
    id: 'ashanti',
    name: 'Ashanti',
    capital: 'Kumasi',
    lat: 6.6885,
    lng: -1.6244,
    mapX: 200,
    mapY: 430,
    svgPath: 'M 160,390 L 280,380 L 270,490 L 160,470 Z',
    localities: ['Bantama', 'Asokwa', 'Suame', 'Obuasi', 'Mampong', 'Ejisu', 'Tafo'],
    baseIncidents: 94,
  },
  {
    id: 'eastern',
    name: 'Eastern',
    capital: 'Koforidua',
    lat: 6.3325,
    lng: -0.458,
    mapX: 300,
    mapY: 470,
    svgPath: 'M 280,380 L 370,400 L 360,520 L 260,510 Z',
    localities: ['Koforidua Central', 'Nkawkaw', 'Nsawam', 'Akuapem North', 'Suhum'],
    baseIncidents: 46,
  },
  {
    id: 'volta',
    name: 'Volta',
    capital: 'Ho',
    lat: 6.15,
    lng: 0.4,
    mapX: 410,
    mapY: 460,
    svgPath: 'M 370,400 L 440,370 L 450,530 L 380,550 Z',
    localities: ['Ho Central', 'Kpando', 'Hohoe', 'Aflao', 'Anloga', 'Sogakope'],
    baseIncidents: 31,
  },
  {
    id: 'western_north',
    name: 'Western North',
    capital: 'Sefwi Wiawso',
    lat: 6.3,
    lng: -2.8,
    mapX: 90,
    mapY: 480,
    svgPath: 'M 70,440 L 150,450 L 140,540 L 50,520 Z',
    localities: ['Sefwi Wiawso', 'Bibiani', 'Juaboso', 'Enchi'],
    baseIncidents: 17,
  },
  {
    id: 'western',
    name: 'Western',
    capital: 'Sekondi-Takoradi',
    lat: 5.0131,
    lng: -1.9755,
    mapX: 110,
    mapY: 570,
    svgPath: 'M 50,520 L 140,540 L 170,640 L 70,630 Z',
    localities: ['Takoradi Market Circle', 'Sekondi', 'Tarkwa', 'Anaji', 'Kwesimintsim', 'Axim'],
    baseIncidents: 53,
  },
  {
    id: 'central',
    name: 'Central',
    capital: 'Cape Coast',
    lat: 5.1478,
    lng: -1.2587,
    mapX: 200,
    mapY: 560,
    svgPath: 'M 140,540 L 260,510 L 280,620 L 170,640 Z',
    localities: ['Cape Coast Metro', 'Kasoa', 'Winneba', 'Elmina', 'Mankessim', 'Agona Swedru'],
    baseIncidents: 61,
  },
  {
    id: 'greater_accra',
    name: 'Greater Accra',
    capital: 'Accra',
    lat: 5.6037,
    lng: -0.187,
    mapX: 310,
    mapY: 570,
    svgPath: 'M 260,510 L 360,520 L 350,600 L 280,620 Z',
    localities: ['Kaneshie', 'Madina', 'Dansoman', 'Adenta', 'Osu', 'Tema Community 1', 'Achimota', 'Lapaz'],
    baseIncidents: 142,
  },
]

export const SIMULATION_TEMPLATES = [
  {
    type: 'general_abuse',
    narrative: 'Survivor reports repeated domestic abuse and intimidation by partner; requested safety planning and DOVVSU interview.',
    priority: 'high',
  },
  {
    type: 'gbv',
    narrative: 'Physical assault incident reported outside private residence. Survivor transported to clinic; requested police protective escort.',
    priority: 'urgent',
  },
  {
    type: 'child_abuse',
    narrative: 'Teacher submitted report regarding visible marks and neglect of 10-year-old child; social welfare intervention requested.',
    priority: 'high',
  },
  {
    type: 'stalking',
    narrative: 'Survivor reports relentless cyber harassment, phone threats, and unannounced appearances outside workplace.',
    priority: 'medium',
  },
  {
    type: 'financial',
    narrative: 'Spouse seized passport, national ID card, and all household funds to prevent survivor leaving with dependents.',
    priority: 'medium',
  },
  {
    type: 'general_abuse',
    narrative: 'Threats of physical harm and forced eviction after disclosure of marital separation; needs immediate shelter referral.',
    priority: 'urgent',
  },
]
