import { createClient } from '@supabase/supabase-js'

// We use service role to securely upload evidence on the server if the user is anonymous
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function uploadEvidenceFile(file: File, caseNumber: string): Promise<string | null> {
  if (!file) return null

  try {
    const fileExt = file.name.split('.').pop()
    // Generate a unique filename using case number and timestamp
    const fileName = `${caseNumber}/${Date.now()}.${fileExt}`

    const { data, error } = await supabaseAdmin.storage
      .from('evidence')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw error
    }

    return data.path
  } catch (err) {
    console.error('Error in uploadEvidenceFile:', err)
    return null
  }
}

export async function getEvidenceUrl(path: string): Promise<string> {
  const { data } = await supabaseAdmin.storage
    .from('evidence')
    .createSignedUrl(path, 60 * 60) // 1 hour expiry
    
  return data?.signedUrl || ''
}
