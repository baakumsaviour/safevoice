/**
 * Client-side in-memory ephemeral draft vault for SafeVoice Stealth Mode.
 *
 * Guarantees Zero-DOM-Leakage:
 * When camouflage is active, report text and sensitive attachments are serialized,
 * encrypted via native Web Crypto AES-GCM using an in-memory ephemeral key,
 * and completely removed from the DOM tree.
 *
 * A 15-minute auto-expiry timer automatically wipes the key and ciphertext
 * from memory if unmasking does not occur.
 */

interface DraftSerializer {
  (): Promise<Record<string, any>> | Record<string, any>
}

interface DraftRestorer {
  (draft: Record<string, any>): void
}

let cachedKey: CryptoKey | null = null
let cachedIV: Uint8Array | null = null
let encryptedBuffer: ArrayBuffer | null = null
let expiryTimer: ReturnType<typeof setTimeout> | null = null

let activeSerializer: DraftSerializer | null = null
let activeRestorer: DraftRestorer | null = null

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000

/**
 * Register active form serializer & restorer callbacks.
 * Allows components like ReportForm to dynamically provide their state.
 */
export function registerDraftHandlers(
  serializer: DraftSerializer,
  restorer: DraftRestorer
): () => void {
  activeSerializer = serializer
  activeRestorer = restorer

  return () => {
    if (activeSerializer === serializer) activeSerializer = null
    if (activeRestorer === restorer) activeRestorer = null
  }
}

/**
 * Immediately purges all in-memory drafts and cryptographic keys.
 */
export function purgeDraft(): void {
  if (expiryTimer) {
    clearTimeout(expiryTimer)
    expiryTimer = null
  }
  cachedKey = null
  cachedIV = null
  encryptedBuffer = null
}

/**
 * Checks if an encrypted draft is currently held in the vault.
 */
export function hasStashedDraft(): boolean {
  return cachedKey !== null && encryptedBuffer !== null
}

/**
 * Serializes and encrypts active form/state data using an in-memory AES-GCM key.
 */
export async function stashDraft(data?: Record<string, any>): Promise<boolean> {
  try {
    const payload = data || (activeSerializer ? await activeSerializer() : null)
    if (!payload || Object.keys(payload).length === 0) {
      return false
    }

    const jsonString = JSON.stringify(payload)
    const encoder = new TextEncoder()
    const encodedData = encoder.encode(jsonString)

    // Check subtle crypto availability
    const cryptoSubtle = typeof window !== 'undefined' ? window.crypto?.subtle : globalThis.crypto?.subtle
    if (!cryptoSubtle) {
      // Fallback: If SubtleCrypto is unavailable, discard rather than leak
      return false
    }

    // Generate fresh 256-bit AES-GCM ephemeral key
    const key = await cryptoSubtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false, // non-extractable
      ['encrypt', 'decrypt']
    )

    const iv = new Uint8Array(12)
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(iv)
    } else if (globalThis.crypto) {
      globalThis.crypto.getRandomValues(iv)
    }

    const encrypted = await cryptoSubtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    )

    purgeDraft()

    cachedKey = key
    cachedIV = iv
    encryptedBuffer = encrypted

    // Start 15-minute garbage collection timer
    expiryTimer = setTimeout(() => {
      purgeDraft()
    }, FIFTEEN_MINUTES_MS)

    return true
  } catch (err) {
    console.error('[DraftVault] Failed to stash draft securely:', err)
    purgeDraft()
    return false
  }
}

/**
 * Decrypts and restores the held draft, notifying registered restorers.
 */
export async function restoreDraft(): Promise<Record<string, any> | null> {
  try {
    if (!cachedKey || !cachedIV || !encryptedBuffer) {
      return null
    }

    const cryptoSubtle = typeof window !== 'undefined' ? window.crypto?.subtle : globalThis.crypto?.subtle
    if (!cryptoSubtle) {
      purgeDraft()
      return null
    }

    const decrypted = await cryptoSubtle.decrypt(
      { name: 'AES-GCM', iv: cachedIV as BufferSource },
      cachedKey,
      encryptedBuffer
    )

    const decoder = new TextDecoder()
    const jsonString = decoder.decode(decrypted)
    const draft = JSON.parse(jsonString)

    // Clear vault after successful restore
    purgeDraft()

    if (activeRestorer && draft) {
      activeRestorer(draft)
    }

    return draft
  } catch (err) {
    console.error('[DraftVault] Failed to restore draft:', err)
    purgeDraft()
    return null
  }
}
