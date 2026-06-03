'use server'

import { supabase } from '@/lib/supabase'

interface UploadEvidenceInput {
  caseId: string
  file: File
  fileType: string
}

/**
 * Securely upload evidence files to Supabase Storage
 * Files are encrypted on the client side before upload
 */
export async function uploadEvidence(
  caseId: string,
  formData: FormData
) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return { error: 'Unauthorized' }
    }

    const file = formData.get('file') as File
    if (!file) {
      return { error: 'No file provided' }
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      return { error: 'File size exceeds 100MB limit' }
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'audio/mpeg',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      return { error: 'File type not allowed' }
    }

    // Create secure file path
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = `${timestamp}-${randomString}-${file.name}`
    const filePath = `cases/${caseId}/${fileName}`

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('[v0] Upload error:', uploadError)
      return { error: uploadError.message }
    }

    // Create database record
    const { data: evidenceRecord, error: dbError } = await supabase
      .from('evidence')
      .insert({
        case_id: caseId,
        file_name: file.name,
        file_path: data.path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: session.user.id,
      })
      .select()
      .single()

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from('evidence').remove([data.path])
      return { error: dbError.message }
    }

    // Log to audit trail
    await supabase.from('audit_log').insert({
      case_id: caseId,
      user_id: session.user.id,
      action: 'EVIDENCE_UPLOADED',
      description: `Evidence uploaded: ${file.name}`,
    })

    return { success: true, data: evidenceRecord }
  } catch (error) {
    console.error('[v0] Upload action error:', error)
    return { error: 'Failed to upload evidence' }
  }
}

/**
 * Download evidence file with audit logging
 */
export async function downloadEvidence(evidenceId: string) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return { error: 'Unauthorized' }
    }

    // Get evidence record
    const { data: evidence, error: fetchError } = await supabase
      .from('evidence')
      .select('*')
      .eq('id', evidenceId)
      .single()

    if (fetchError) {
      return { error: fetchError.message }
    }

    // Log access
    await supabase.from('audit_log').insert({
      case_id: evidence.case_id,
      user_id: session.user.id,
      action: 'EVIDENCE_ACCESSED',
      description: `Evidence downloaded: ${evidence.file_name}`,
    })

    // Generate signed URL (valid for 1 hour)
    const { data, error: signError } = await supabase.storage
      .from('evidence')
      .createSignedUrl(evidence.file_path, 3600)

    if (signError) {
      return { error: signError.message }
    }

    return { success: true, url: data.signedUrl }
  } catch (error) {
    console.error('[v0] Download action error:', error)
    return { error: 'Failed to download evidence' }
  }
}

/**
 * Delete evidence with security checks
 */
export async function deleteEvidence(evidenceId: string) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return { error: 'Unauthorized' }
    }

    // Get evidence record
    const { data: evidence, error: fetchError } = await supabase
      .from('evidence')
      .select('*')
      .eq('id', evidenceId)
      .single()

    if (fetchError) {
      return { error: fetchError.message }
    }

    // Check if evidence is locked
    if (evidence.is_locked) {
      return { error: 'This evidence is locked and cannot be deleted' }
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('evidence')
      .remove([evidence.file_path])

    if (deleteError) {
      return { error: deleteError.message }
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('evidence')
      .delete()
      .eq('id', evidenceId)

    if (dbError) {
      return { error: dbError.message }
    }

    // Log action
    await supabase.from('audit_log').insert({
      case_id: evidence.case_id,
      user_id: session.user.id,
      action: 'EVIDENCE_DELETED',
      description: `Evidence deleted: ${evidence.file_name}`,
    })

    return { success: true }
  } catch (error) {
    console.error('[v0] Delete action error:', error)
    return { error: 'Failed to delete evidence' }
  }
}
