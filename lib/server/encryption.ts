import 'server-only'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const PREFIX = 'enc:v1:'
const DEV_FALLBACK_SECRET = 'safevoice-dev-only-key'

function deriveKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest()
}

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('ENCRYPTION_KEY is not set')
    }
    console.warn('[encryption] ENCRYPTION_KEY not set — using an insecure development key')
    return deriveKey(DEV_FALLBACK_SECRET)
  }
  return deriveKey(secret)
}

/** AES-256-GCM. Output format: enc:v1:<b64 iv>:<b64 auth tag>:<b64 ciphertext> */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${PREFIX}${iv.toString('base64')}:${tag.toString('base64')}:${ciphertext.toString('base64')}`
}

function tryDecryptWithKey(ivB64: string, tagB64: string, dataB64: string, key: Buffer): string | null {
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'))
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'))
    return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

/** True when the string is overwhelmingly printable text (not binary noise). */
function looksLikeText(s: string): boolean {
  if (s.length === 0) return false
  let printable = 0
  for (const ch of s) {
    const code = ch.codePointAt(0)!
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 0xfffd)) printable++
  }
  return printable / [...s].length > 0.95
}

/**
 * Decrypts enc:v1 values. Rows written before ENCRYPTION_KEY was configured
 * are also tried with the development fallback key so they stay readable.
 * Legacy MVP rows (plain base64 of the text) are decoded; crypto-js
 * ciphertext ("Salted__"-prefixed) and binary noise render as '[unreadable]'
 * instead of mojibake. Never throws — one bad row must not take down a case
 * view.
 */
export function decrypt(stored: string | null | undefined): string {
  if (!stored) return ''

  if (stored.startsWith(PREFIX)) {
    const parts = stored.slice(PREFIX.length).split(':')
    if (parts.length !== 3) return '[unreadable]'
    const [ivB64, tagB64, dataB64] = parts

    const primary = tryDecryptWithKey(ivB64, tagB64, dataB64, getKey())
    if (primary !== null) return primary
    // Recovery path for rows encrypted before the operator set a real key.
    const fallback = tryDecryptWithKey(ivB64, tagB64, dataB64, deriveKey(DEV_FALLBACK_SECRET))
    if (fallback !== null) return fallback
    return '[unreadable]'
  }

  // Legacy MVP rows were base64-encoded plaintext.
  try {
    const roundTrips = Buffer.from(stored, 'base64').toString('base64').replace(/=+$/, '') === stored.replace(/=+$/, '')
    if (!roundTrips) return stored
    const decoded = Buffer.from(stored, 'base64').toString('utf8')
    // crypto-js AES output decodes to 'Salted__' + binary — that plaintext is
    // gone (the key shipped in a browser bundle); don't render the noise.
    if (decoded.startsWith('Salted__') || !looksLikeText(decoded)) return '[unreadable]'
    return decoded
  } catch {
    return stored
  }
}
