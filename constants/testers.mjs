/**
 * Shared tester roster. Imported by scripts/create-testers.mjs (Node) and by
 * app/testing/page.tsx (Next.js), so the page and the database never drift.
 *
 * REMOVE BEFORE REAL LAUNCH: `node scripts/create-testers.mjs --remove`
 * and delete app/testing.
 */
export const TESTER_PASSWORD = '00000000'

/** @type {{ email: string, fullName: string, role: 'admin' | 'caseworker' | 'analyst' | 'victim' }[]} */
export const TESTER_ACCOUNTS = [
  { email: 'admin1@safevoice.test', fullName: 'Test Admin One', role: 'admin' },
  { email: 'admin2@safevoice.test', fullName: 'Test Admin Two', role: 'admin' },
  { email: 'caseworker1@safevoice.test', fullName: 'Test Caseworker One', role: 'caseworker' },
  { email: 'caseworker2@safevoice.test', fullName: 'Test Caseworker Two', role: 'caseworker' },
  { email: 'caseworker3@safevoice.test', fullName: 'Test Caseworker Three', role: 'caseworker' },
  { email: 'analyst1@safevoice.test', fullName: 'Test Analyst One', role: 'analyst' },
  { email: 'survivor1@safevoice.test', fullName: 'Test Survivor One', role: 'victim' },
  { email: 'survivor2@safevoice.test', fullName: 'Test Survivor Two', role: 'victim' },
  { email: 'survivor3@safevoice.test', fullName: 'Test Survivor Three', role: 'victim' },
  { email: 'survivor4@safevoice.test', fullName: 'Test Survivor Four', role: 'victim' },
]
