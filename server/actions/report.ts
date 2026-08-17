'use server'

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { uploadEvidenceFile } from '@/lib/supabase/storage'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const reportSchema = z.object({
  narrative: z.string().min(10, "Please provide more details about the incident."),
  incident_date: z.string().optional(),
  incident_location: z.string().optional(),
  incident_region: z.string().optional(),
  incident_district: z.string().optional(),
  contact_info: z.string().optional(), // email or phone, optional
  consent_given: z.boolean().default(true),
  case_type: z.string().optional().default('general_abuse')
})

function calculatePriority(caseType: string, narrative: string): 'low' | 'medium' | 'high' | 'urgent' {
  const urgentKeywords = ['weapon', 'gun', 'knife', 'kill', 'immediate', 'danger', 'bleeding', 'emergency', 'right now', 'suicide']
  const highKeywords = ['child', 'minor', 'daily', 'threat', 'stalk', 'beat', 'hit', 'hurt']
  
  const lowerNarrative = narrative.toLowerCase()
  
  if (urgentKeywords.some(kw => lowerNarrative.includes(kw))) {
    return 'urgent'
  }
  if (caseType === 'child_abuse' || highKeywords.some(kw => lowerNarrative.includes(kw))) {
    return 'high'
  }
  if (caseType === 'domestic_violence' || caseType === 'gbv' || caseType === 'sexual_assault') {
    return 'high'
  }
  return 'medium'
}

export async function submitReportAction(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries())
    const parsed = reportSchema.safeParse({
      ...rawData,
      consent_given: rawData.consent_given === 'on' || rawData.consent_given === 'true',
      case_type: rawData.case_type || 'general_abuse'
    })

    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors }
    }

    const data = parsed.data
    const evidenceFile = formData.get('evidence_file') as File | null
    const audioFile = formData.get('audio_file') as File | null

    // We use service role to bypass RLS since the user might be completely anonymous
    // MVP pseudo-encryption for highly sensitive fields
    const encryptedNarrative = Buffer.from(data.narrative).toString('base64') 

    const caseNumber = 'CAS-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const priority = calculatePriority(data.case_type, data.narrative)
    
    const locationParts = [data.incident_region, data.incident_district, data.incident_location].filter(Boolean)
    const fullLocation = locationParts.length > 0 ? locationParts.join(', ') : null

    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {}
        }
      }
    )

    const { data: { user } } = await supabaseServer.auth.getUser()

    let victimId = ''
    
    if (user) {
      victimId = user.id
    } else {
      // Create an anonymous user record in public.users
      const { data: anonUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email: `anon-${Date.now()}@safevoice.local`, // Fake email for anon
          role: 'victim',
          phone_number: data.contact_info || null
        })
        .select('id')
        .single()

      if (userError || !anonUser) {
        console.error('Failed to create anon user', userError)
        return { error: 'Failed to create report securely.' }
      }
      victimId = anonUser.id
    }

    const { data: newCase, error: caseError } = await supabaseAdmin
      .from('cases')
      .insert({
        case_number: caseNumber,
        victim_id: victimId,
        created_by_user_id: victimId,
        narrative_encrypted: encryptedNarrative,
        incident_date: data.incident_date || null,
        incident_location: fullLocation,
        consent_given: data.consent_given,
        case_type: data.case_type,
        status: 'open',
        priority: priority
      })
      .select('id, case_number')
      .single()

    if (caseError || !newCase) {
      console.error('Case insert error:', caseError)
      return { error: 'Failed to submit report. Please try again.' }
    }

    // Collect files to upload (both standard evidence file and audio note if provided)
    const filesToUpload: File[] = []
    if (evidenceFile && evidenceFile.size > 0 && evidenceFile.name !== 'undefined') {
      filesToUpload.push(evidenceFile)
    }
    if (audioFile && audioFile.size > 0 && audioFile.name !== 'undefined') {
      filesToUpload.push(audioFile)
    }

    // Upload files and record in DB
    for (const file of filesToUpload) {
      const storagePath = await uploadEvidenceFile(file, caseNumber)
      if (storagePath) {
        await supabaseAdmin.from('evidence').insert({
          case_id: newCase.id,
          file_name: file.name || 'evidence_file',
          file_path: storagePath,
          file_type: file.type || 'application/octet-stream',
          file_size: file.size,
          uploaded_by: victimId
        })
      }
    }

    return { success: true, caseNumber: newCase.case_number }
  } catch (error) {
    console.error('Submission error:', error)
    return { error: 'An unexpected error occurred.' }
  }
}
