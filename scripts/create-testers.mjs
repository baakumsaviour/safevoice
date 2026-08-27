#!/usr/bin/env node
/**
 * Provisions the shared TESTER accounts listed on /testing.
 *
 *   node scripts/create-testers.mjs           # create / repair all tester accounts
 *   node scripts/create-testers.mjs --remove  # delete them all (run before real launch)
 *
 * Every account uses the same deliberately weak password so testers can be
 * onboarded from a single page. These accounts must NOT exist in production
 * once real survivors use the platform — run --remove first.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

import { TESTER_ACCOUNTS, TESTER_PASSWORD } from '../constants/testers.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(root, '.env.local') })

function fail(message) {
  console.error(`error: ${message}`)
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url) fail('NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
if (!serviceKey) fail('SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')

const remove = process.argv.includes('--remove')
const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
if (listError) fail(`could not list users: ${listError.message}`)
const byEmail = new Map(list.users.map((u) => [u.email?.toLowerCase(), u]))

console.log(`${remove ? 'Removing' : 'Provisioning'} ${TESTER_ACCOUNTS.length} tester accounts on ${url}\n`)

for (const account of TESTER_ACCOUNTS) {
  const existing = byEmail.get(account.email.toLowerCase())

  if (remove) {
    if (!existing) {
      console.log(`  - ${account.email}: not present`)
      continue
    }
    // public.users cascades from auth.users; cases owned by victims are removed
    // with them so no orphaned test data lingers.
    const { error } = await supabase.auth.admin.deleteUser(existing.id)
    if (error) fail(`could not delete ${account.email}: ${error.message}`)
    console.log(`  ✓ ${account.email}: deleted`)
    continue
  }

  let userId = existing?.id
  if (existing) {
    // Re-running must be safe: reset to the published password and confirm email.
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: TESTER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    })
    if (error) fail(`could not update ${account.email}: ${error.message}`)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: TESTER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
    })
    if (error) fail(`could not create ${account.email}: ${error.message}`)
    userId = data.user.id
  }

  const { error: rowError } = await supabase.from('users').upsert(
    { id: userId, email: account.email, full_name: account.fullName, role: account.role, is_active: true },
    { onConflict: 'id' }
  )
  if (rowError) fail(`public.users row for ${account.email} failed: ${rowError.message}`)

  console.log(`  ✓ ${account.role.padEnd(10)} ${account.email}`)
}

if (!remove) console.log(`\nAll accounts use password: ${TESTER_PASSWORD}`)
