import 'server-only'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // 8 MB — must fit the Server Action body limit
const ALLOWED_MIME_PREFIXES = ['image/', 'audio/']
const ALLOWED_MIME_EXACT = ['video/mp4', 'application/pdf']

export type UploadResult =
  | { path: string }
  | { error: string }

export function validateEvidenceFile(file: File): string | null {
  if (file.size <= 0) return 'The file is empty.'
  if (file.size > MAX_UPLOAD_BYTES) return 'Files must be 8 MB or smaller.'
  const type = file.type || ''
  const allowed =
    ALLOWED_MIME_PREFIXES.some((p) => type.startsWith(p)) || ALLOWED_MIME_EXACT.includes(type)
  if (!allowed) return 'Only images, audio, MP4 video, and PDF files are accepted.'
  return null
}

/**
 * Uploads an evidence file under `<caseId>/<uuid>.<ext>`. The object key never
 * contains the case reference number, and existing objects are never
 * overwritten. Callers must have authorized the request first.
 */
export async function uploadEvidenceFile(file: File, caseId: string): Promise<UploadResult> {
  const validationError = validateEvidenceFile(file)
  if (validationError) return { error: validationError }

  const rawExt = file.name.includes('.') ? file.name.split('.').pop()! : 'bin'
  const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'bin'
  const objectKey = `${caseId}/${randomUUID()}.${ext}`

  const { data, error } = await createAdminClient()
    .storage.from('evidence')
    .upload(objectKey, file, { contentType: file.type || 'application/octet-stream', upsert: false })

  if (error || !data) {
    console.error('[storage] evidence upload failed:', error)
    return { error: 'The file could not be stored. Please keep your copy and try again later.' }
  }
  return { path: data.path }
}

/** 1-hour signed URL. Callers MUST verify case access before calling. */
export async function getEvidenceUrl(path: string): Promise<string> {
  const { data } = await createAdminClient()
    .storage.from('evidence')
    .createSignedUrl(path, 60 * 60)
  return data?.signedUrl || ''
}
