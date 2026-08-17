import 'server-only'
import { randomBytes } from 'crypto'

// No 0/O/1/I/L to keep references easy to read back over the phone.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/** Cryptographically random case reference, e.g. SV-K3TP-9WQA (~40 bits). */
export function generateCaseNumber(): string {
  const bytes = randomBytes(8)
  let out = ''
  for (let i = 0; i < 8; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]
    if (i === 3) out += '-'
  }
  return `SV-${out}`
}
