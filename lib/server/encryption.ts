import 'server-only'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const PREFIX = 'enc:v1:'

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY is not set')
    }
    console.warn('[encryption] ENCRYPTION_KEY not set — using an insecure development key')
    return createHash('sha256').update('safevoice-dev-only-key').digest()
  }
  return createHash('sha256').update(secret).digest()
}

/** AES-256-GCM. Output format: enc:v1:<b64 iv>:<b64 auth tag>:<b64 ciphertext> */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

/**
 * Decrypts enc:v1 values. Legacy rows (plain base64 from the MVP) are decoded
 * as a fallback. Returns '[unreadable]' rather than throwing, so one bad row
 * cannot take down a case view.
 */
export function decrypt(stored: string | null | undefined): string {
  if (!stored) return ''
  if (stored.startsWith(PREFIX)) {
    try {
      const [ivB64, tagB64, dataB64] = stored.slice(PREFIX.length).split(':')
      const decipher = createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'))
      decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
      return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8')
    } catch {
      return '[unreadable]'
    }
  }
  // Legacy MVP rows were base64-encoded plaintext.
  try {
    const decoded = Buffer.from(stored, 'base64').toString('utf8')
    // Heuristic: if re-encoding round-trips, it was valid base64.
    return Buffer.from(decoded, 'utf8').length > 0 && Buffer.from(stored, 'base64').toString('base64').replace(/=+$/, '') === stored.replace(/=+$/, '')
      ? decoded
      : stored
  } catch {
    return stored
  }
}
