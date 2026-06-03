import CryptoJS from 'crypto-js'

// Use a secure encryption key from environment variables
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-unsafe-key-change-in-production'

/**
 * Encrypt sensitive data using AES-256
 * Used for storing case narratives, messages, and notes before upload
 */
export function encryptData(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString()
  } catch (error) {
    console.error('[v0] Encryption failed:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt sensitive data using AES-256
 * Used for retrieving encrypted case information
 */
export function decryptData(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('[v0] Decryption failed:', error)
    throw new Error('Failed to decrypt data')
  }
}

/**
 * Hash sensitive values for comparison without storing plaintext
 * Used for audit trails and verification
 */
export function hashValue(value: string): string {
  return CryptoJS.SHA256(value).toString()
}

/**
 * Generate a random encryption key for client-side operations
 * Used for temporary session encryption
 */
export function generateSessionKey(): string {
  return CryptoJS.lib.WordArray.random(32).toString()
}
