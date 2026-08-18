#!/usr/bin/env node
/**
 * Creates a SafeVoice staff account on the configured Supabase project.
 *
 *   node scripts/create-staff.mjs <email> "<Full Name>" <admin|caseworker|analyst>
 *
 * Staff cannot be created through the app: signup only ever produces `victim`,
 * and `trg_prevent_role_self_change` blocks self-promotion. Service-role writes
 * are exempt from that trigger (auth.uid() is NULL), which is what this uses.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * Prints the generated password once — it is never stored anywhere else.
 */
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

const ROLES = ['admin', 'caseworker', 'analyst']
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

dotenv.config({ path: path.join(root, '.env.local') })

function fail(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

const [email, fullName, role] = process.argv.slice(2)

if (!email || !fullName || !role) {
  fail('usage: node scripts/create-staff.mjs <email> "<Full Name>" <admin|caseworker|analyst>')
}
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  fail(`"${email}" is not a valid email address`)
}
if (!ROLES.includes(role)) {
  fail(`role must be one of ${ROLES.join(', ')} — got "${role}"`)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url) fail('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
if (!serviceKey) {
  fail('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local — paste the sb_secret_… key from Project Settings → API Keys')
}

// 32 url-safe chars from 24 random bytes. Base64url avoids shell-quoting pain
// when the password is pasted into a terminal or a password manager.
const password = randomBytes(24).toString('base64url')

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

console.log(`Creating ${role} "${fullName}" <${email}> on ${url}`)

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
})

let userId = created?.user?.id
let passwordIsNew = true

if (createError) {
  // Re-running after a partial failure is a normal recovery path: the auth user
  // may already exist while the public.users row is missing. Adopt it rather
  // than forcing a manual cleanup, but never silently reset its password.
  if (!/already|exists|registered/i.test(createError.message)) {
    fail(`could not create auth user: ${createError.message}`)
  }

  console.log('  auth user already exists — reusing it and leaving its password unchanged')
  passwordIsNew = false

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listError) fail(`could not look up the existing user: ${listError.message}`)

  const match = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
  if (!match) fail(`Supabase reports ${email} exists but it was not found in the user list`)
  userId = match.id
}

if (!userId) fail('no user id was returned by Supabase')

const { error: rowError } = await supabase
  .from('users')
  .upsert({ id: userId, email, full_name: fullName, role, is_active: true }, { onConflict: 'id' })

if (rowError) {
  fail(
    `auth user ${userId} exists but its public.users row failed: ${rowError.message}\n` +
      'Re-run this command to retry — it will adopt the existing auth user.'
  )
}

console.log(`\n✓ ${role} ready`)
console.log(`  id:    ${userId}`)
console.log(`  email: ${email}`)
if (passwordIsNew) {
  console.log(`  password: ${password}`)
  console.log('\nStore that password in a password manager now — it is not recoverable.')
} else {
  console.log('  password: unchanged (send a reset email if it is unknown)')
}
