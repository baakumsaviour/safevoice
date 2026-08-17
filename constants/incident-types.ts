// Single source of truth for incident/case types.
// Used by the report form selector (labels/descriptions), server-side Zod
// validation, and the database CHECK constraint in supabase/migrations.

export const INCIDENT_TYPE_VALUES = [
  'domestic_violence',
  'child_abuse',
  'sexual_assault',
  'gbv',
  'harassment',
  'general_abuse',
  'other',
] as const

export type IncidentTypeValue = (typeof INCIDENT_TYPE_VALUES)[number]

export const INCIDENT_TYPE_LABELS: Record<IncidentTypeValue, string> = {
  domestic_violence: 'Domestic Violence',
  child_abuse: 'Child Abuse',
  sexual_assault: 'Sexual Assault',
  gbv: 'Gender-Based Violence (GBV)',
  harassment: 'Harassment & Stalking',
  general_abuse: 'General Abuse',
  other: 'Other Concern',
}

/** Human-readable label with a safe fallback for unknown/legacy values. */
export function incidentTypeLabel(value: string | null | undefined): string {
  if (!value) return 'General Abuse'
  return INCIDENT_TYPE_LABELS[value as IncidentTypeValue] ?? value.replaceAll('_', ' ')
}
