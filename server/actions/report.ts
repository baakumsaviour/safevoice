'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { encrypt } from '@/lib/server/encryption'
import { generateCaseNumber } from '@/lib/server/case-number'
import { uploadEvidenceFile } from '@/lib/supabase/storage'
import { INCIDENT_TYPE_VALUES } from '@/constants/incident-types'

const reportSchema = z.object({
  narrative: z
    .string()
    .max(10000, 'Please keep your description under 10,000 characters.')
    .default(''),
  has_audio: z.boolean().default(false),
  incident_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date.')
    .refine((d) => d <= new Date().toISOString().slice(0, 10), 'The incident date cannot be in the future.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  incident_location: z.string().max(300).optional(),
  incident_region: z.string().max(100).optional(),
  incident_district: z.string().max(100).optional(),
  contact_info: z.string().max(200).optional(),
  consent_given: z.literal(true, {
    errorMap: () => ({ message: 'Consent is required to submit a report.' }),
  }),
  case_type: z.enum(INCIDENT_TYPE_VALUES).default('general_abuse'),
}).refine(
  (data) => data.has_audio || data.narrative.trim().length >= 10,
  { message: 'Please provide at least 10 characters describing the incident, or record an audio note.', path: ['narrative'] }
)

const URGENT_KEYWORDS = ['weapon', 'gun', 'knife', 'kill', 'killing', 'immediate', 'danger', 'bleeding', 'emergency', 'right now', 'suicide']
const HIGH_KEYWORDS = ['child', 'minor', 'daily', 'threat', 'threats', 'stalk', 'stalking', 'beat', 'beating', 'hit', 'hurt']

// Word-boundary matching: 'skilled' must not match 'kill', 'shirt' not 'hit'.
function containsKeyword(narrative: string, keywords: string[]): boolean {
  const lower = narrative.toLowerCase()
  return keywords.some((kw) => new RegExp(`\\b${kw}\\b`).test(lower))
}

function calculatePriority(caseType: string, narrative: string): 'low' | 'medium' | 'high' | 'urgent' {
  if (containsKeyword(narrative, URGENT_KEYWORDS)) return 'urgent'
  if (caseType === 'child_abuse' || containsKeyword(narrative, HIGH_KEYWORDS)) return 'high'
  if (caseType === 'domestic_violence' || caseType === 'gbv' || caseType === 'sexual_assault') return 'high'
  return 'medium'
}

export type SubmitReportResult =
  | { success: true; caseNumber: string; warnings: string[] }
  | { error: string }

/**
 * Resolves the reporter's identity. Signed-in users are used as-is; everyone
 * else gets an anonymous Supabase auth session so the case is tied to a real
 * auth.uid() — this is what makes RLS and Realtime work for anonymous
 * reporters, and lets them see their case again from the same browser.
 */
async function resolveReporter(contactInfo?: string): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient()
  const admin = createAdminClient()

  let userId: string
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    userId = user.id
  } else {
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
    if (anonError || !anonData.user) {
      console.error('[report] anonymous sign-in failed:', anonError)
      return { error: 'Could not create a secure anonymous session. Please try again.' }
    }
    userId = anonData.user.id
  }

  const { data: existing } = await admin.from('users').select('id, phone_number').eq('id', userId).maybeSingle()
  if (existing) {
    // Never overwrite an existing contact number with free-text form input —
    // it may be the only safe way to reach the victim.
    if (contactInfo && !existing.phone_number) {
      await admin.from('users').update({ phone_number: contactInfo }).eq('id', userId)
    }
  } else {
    const { error: insertError } = await admin.from('users').insert({
      id: userId,
      email: user?.email ?? `anon-${userId}@safevoice.local`,
      role: 'victim',
      phone_number: contactInfo ?? null,
    })
    if (insertError) {
      console.error('[report] user insert failed:', insertError)
      return { error: 'Failed to create your report securely. Please try again.' }
    }
  }
  return { id: userId }
}

export async function submitReportAction(formData: FormData): Promise<SubmitReportResult> {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const parsed = reportSchema.safeParse({
      ...rawData,
      consent_given: rawData.consent_given === 'on' || rawData.consent_given === 'true',
      has_audio: rawData.has_audio === 'true',
      case_type: rawData.case_type || 'general_abuse',
    })

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      return { error: firstIssue?.message ?? 'Please check the form and try again.' }
    }

    const data = parsed.data
    const admin = createAdminClient()
    const warnings: string[] = []

    const reporter = await resolveReporter(data.contact_info)
    if ('error' in reporter) return { error: reporter.error }
    const victimId = reporter.id

    const narrativeText = data.narrative.trim() || '[Audio-only report — please review the attached voice recording]'
    const encryptedNarrative = encrypt(narrativeText)
    const priority = calculatePriority(data.case_type, narrativeText)
    const locationParts = [data.incident_region, data.incident_district, data.incident_location].filter(Boolean)
    const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : null

    // Insert with a fresh CSPRNG case number; retry on the (unlikely) unique
    // collision.
    let newCase: { id: string; case_number: string } | null = null
    for (let attempt = 0; attempt < 3 && !newCase; attempt++) {
      const caseNumber = generateCaseNumber()
      const { data: inserted, error: caseError } = await admin
        .from('cases')
        .insert({
          case_number: caseNumber,
          victim_id: victimId,
          created_by_user_id: victimId,
          narrative_encrypted: encryptedNarrative,
          incident_date: data.incident_date ?? null,
          incident_location: fullLocation,
          consent_given: true,
          case_type: data.case_type,
          status: 'open',
          priority,
        })
        .select('id, case_number')
        .single()

      if (inserted) {
        newCase = inserted
      } else if (caseError?.code !== '23505') {
        console.error('[report] case insert error:', caseError)
        return { error: 'Failed to submit report. Please try again.' }
      }
    }
    if (!newCase) return { error: 'Failed to submit report. Please try again.' }

    const evidenceFile = formData.get('evidence_file')
    const audioFile = formData.get('audio_file')
    const filesToUpload = [evidenceFile, audioFile].filter(
      (f): f is File => f instanceof File && f.size > 0 && f.name !== 'undefined'
    )

    for (const file of filesToUpload) {
      const result = await uploadEvidenceFile(file, newCase.id)
      if ('error' in result) {
        warnings.push(`"${file.name}": ${result.error}`)
        continue
      }
      const { error: evidenceError } = await admin.from('evidence').insert({
        case_id: newCase.id,
        file_name: file.name || 'evidence_file',
        file_path: result.path,
        file_type: file.type || 'application/octet-stream',
        file_size: file.size,
        uploaded_by: victimId,
      })
      if (evidenceError) {
        console.error('[report] evidence record insert failed:', evidenceError)
        warnings.push(`"${file.name}": the file was stored but could not be linked to your case. Support has been notified.`)
      }
    }

    await admin.from('audit_log').insert({
      case_id: newCase.id,
      user_id: victimId,
      action: 'case_created',
      description: `Case ${newCase.case_number} created via report form`,
    })

    return { success: true, caseNumber: newCase.case_number, warnings }
  } catch (error) {
    console.error('[report] submission error:', error)
    return { error: 'An unexpected error occurred. Your report was not submitted — please try again.' }
  }
}
