#!/usr/bin/env node
/**
 * Proves cross-tenant isolation on whatever project .env.local points at.
 *
 *   node scripts/verify-rls.mjs
 *
 * The checks themselves use ONLY the publishable key and two independent
 * anonymous sessions, so they exercise exactly the trust level a real
 * reporter's browser has. Anything reachable here is reachable by anyone.
 *
 * This is the property that matters most on this platform: one survivor must
 * never be able to read, alter, or write into another survivor's case. Re-run
 * it after any change to the RLS policies in supabase/migrations/.
 *
 * SUPABASE_SERVICE_ROLE_KEY is optional and used only to clean up afterwards.
 * Without it the tagged RLSTEST rows are left behind and must be deleted by
 * hand — never leave them in a project that holds real reports.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(root, '.env.local') })

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const TAG = 'RLSTEST'

if (!URL_BASE || !KEY) {
  console.error('error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local')
  process.exit(1)
}

let passed = 0
let failed = 0

function check(name, ok, detail = '') {
  if (ok) {
    passed++
    console.log(`  PASS  ${name}`)
  } else {
    failed++
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

/**
 * A denial must be a real row-level-security rejection. Accepting any 4xx would
 * let a typo'd column name masquerade as a passing security check — which is
 * exactly what happened the first time this was written.
 */
function deniedByRls(res) {
  const code = res.body?.code
  const msg = (res.body?.message || '').toLowerCase()
  return (
    (res.status === 401 || res.status === 403 || code === '42501') &&
    (msg.includes('row-level security') || msg.includes('policy') || code === '42501')
  )
}

async function rest(token, resource, init = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${resource}`, {
    ...init,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  let body
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }
  return { status: res.status, body }
}

async function makeReporter(label) {
  const signup = await fetch(`${URL_BASE}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  const session = await signup.json()
  if (!session.access_token) {
    throw new Error(
      `${label}: anonymous sign-in failed (${JSON.stringify(session)}). ` +
        'Anonymous sign-ins must be enabled on the project.'
    )
  }

  const token = session.access_token
  const uid = session.user.id

  const profile = await rest(token, 'users', {
    method: 'POST',
    body: JSON.stringify({
      id: uid,
      email: `${TAG}-${uid}@example.invalid`,
      role: 'victim',
      full_name: `${TAG} ${label}`,
    }),
  })
  if (profile.status >= 300) throw new Error(`${label}: profile insert failed: ${JSON.stringify(profile.body)}`)

  const created = await rest(token, 'cases', {
    method: 'POST',
    body: JSON.stringify({
      victim_id: uid,
      created_by_user_id: uid,
      case_number: `${TAG}-${label}-${uid.slice(0, 8)}`,
      case_type: 'gbv',
      narrative_encrypted: `${TAG} narrative for ${label}`,
    }),
  })
  if (created.status >= 300) throw new Error(`${label}: case insert failed: ${JSON.stringify(created.body)}`)

  return { label, token, uid, caseId: created.body[0].id }
}

console.log(`Verifying RLS isolation on ${URL_BASE}\n`)
console.log('Creating two independent anonymous reporters…')
const a = await makeReporter('A')
const b = await makeReporter('B')
console.log(`  A: uid=${a.uid.slice(0, 8)}… case=${a.caseId.slice(0, 8)}…`)
console.log(`  B: uid=${b.uid.slice(0, 8)}… case=${b.caseId.slice(0, 8)}…\n`)

console.log("Isolation checks (A acting against B's data):")

const ownList = await rest(a.token, 'cases?select=id')
check(
  "A's case list contains only A's own case",
  Array.isArray(ownList.body) && ownList.body.length === 1 && ownList.body[0].id === a.caseId,
  `saw ${Array.isArray(ownList.body) ? ownList.body.length : '?'} rows`
)

const readOther = await rest(a.token, `cases?id=eq.${b.caseId}&select=id,narrative_encrypted`)
check(
  "A cannot read B's case by direct id",
  Array.isArray(readOther.body) && readOther.body.length === 0,
  JSON.stringify(readOther.body)
)

const updateOther = await rest(a.token, `cases?id=eq.${b.caseId}`, {
  method: 'PATCH',
  body: JSON.stringify({ status: 'closed' }),
})
check(
  "A cannot close B's case",
  Array.isArray(updateOther.body) ? updateOther.body.length === 0 : updateOther.status >= 400,
  `status=${updateOther.status} ${JSON.stringify(updateOther.body)}`
)

const msgOther = await rest(a.token, 'case_messages', {
  method: 'POST',
  body: JSON.stringify({
    case_id: b.caseId,
    sender_id: a.uid,
    sender_role: 'victim',
    message_encrypted: `${TAG} intrusion`,
  }),
})
check("A cannot post a message into B's case", deniedByRls(msgOther), `status=${msgOther.status}`)

const spoof = await rest(a.token, 'case_messages', {
  method: 'POST',
  body: JSON.stringify({
    case_id: a.caseId,
    sender_id: a.uid,
    sender_role: 'caseworker',
    message_encrypted: `${TAG} spoof`,
  }),
})
check('A cannot post as a caseworker in their own case', deniedByRls(spoof), `status=${spoof.status}`)

const aiSpoof = await rest(a.token, 'case_messages', {
  method: 'POST',
  body: JSON.stringify({
    case_id: a.caseId,
    sender_id: null,
    sender_role: 'ai',
    message_encrypted: `${TAG} fake ai`,
  }),
})
check('A cannot forge an AI message', deniedByRls(aiSpoof), `status=${aiSpoof.status}`)

const readOtherProfile = await rest(a.token, `users?id=eq.${b.uid}&select=id,email`)
check(
  "A cannot read B's profile row",
  Array.isArray(readOtherProfile.body) && readOtherProfile.body.length === 0,
  JSON.stringify(readOtherProfile.body)
)

const promote = await rest(a.token, `users?id=eq.${a.uid}`, {
  method: 'PATCH',
  body: JSON.stringify({ role: 'admin' }),
})
check(
  'A cannot promote themselves to admin',
  promote.status >= 400 || (Array.isArray(promote.body) && promote.body.length === 0),
  `status=${promote.status} ${JSON.stringify(promote.body)}`
)

const audit = await rest(a.token, 'audit_log?select=id')
check(
  'A cannot read the audit log',
  Array.isArray(audit.body) && audit.body.length === 0,
  JSON.stringify(audit.body)
)

// Positive control: without this, a project that denied everything would look
// perfectly secure while being completely broken.
const ownMessage = await rest(a.token, 'case_messages', {
  method: 'POST',
  body: JSON.stringify({
    case_id: a.caseId,
    sender_id: a.uid,
    sender_role: 'victim',
    message_encrypted: `${TAG} legitimate`,
  }),
})
check(
  'A CAN post a victim message in their own case (no false lockout)',
  ownMessage.status < 300,
  `status=${ownMessage.status} ${JSON.stringify(ownMessage.body)}`
)

if (SERVICE_KEY) {
  const del = async (resource) =>
    fetch(`${URL_BASE}/rest/v1/${resource}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    })
  await del(`cases?case_number=like.${TAG}-*`)
  await del(`users?email=like.${TAG}-*`)
  console.log('\nCleaned up test rows.')
  console.log('Note: the two anonymous auth.users remain — delete them in Dashboard → Authentication → Users.')
} else {
  console.log('\nSUPABASE_SERVICE_ROLE_KEY not set, so nothing was cleaned up.')
  console.log(`Delete rows tagged ${TAG} by hand before this project holds real reports.`)
}

console.log(`\n${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
