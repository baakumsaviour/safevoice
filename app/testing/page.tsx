import type { Metadata } from 'next'
import Link from 'next/link'
import { AlertTriangle, ClipboardList, KeyRound, Bug, CheckCircle2 } from 'lucide-react'

import { TESTER_ACCOUNTS, TESTER_PASSWORD } from '@/constants/testers.mjs'

// Shared tester credentials live on this page. It is deliberately kept out of
// search engines and must be deleted (with `node scripts/create-testers.mjs
// --remove`) before real survivors use the platform.
export const metadata: Metadata = {
  title: 'SafeVoice — Tester Guide',
  robots: { index: false, follow: false, nocache: true },
}

type Scenario = {
  id: string
  title: string
  account: string
  goal: string
  steps: string[]
  expected: string[]
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  caseworker: 'Caseworker',
  analyst: 'Analyst',
  victim: 'Survivor (reporter)',
}

const ROLE_HINT: Record<string, string> = {
  admin: 'Full staff portal: all cases, assign caseworkers, invite staff, analytics.',
  caseworker: 'Staff portal: read and reply to cases assigned to you.',
  analyst: 'Staff portal, read-focused: dashboard and analytics.',
  victim: 'Public side: submit reports, track them, chat with caseworkers.',
}

const SCENARIOS: Scenario[] = [
  {
    id: 'T1',
    title: 'Anonymous report (no account)',
    account: 'None — use a private/incognito window',
    goal: 'Confirm a survivor can report without ever signing up.',
    steps: [
      'Open the site home page and click "Report an Incident" (or go to /report).',
      'Step 1 — choose an incident type (e.g. "Harassment & Stalking"), then "Next: Incident Details".',
      'Step 2 — write a narrative of at least 10 characters. Try leaving it empty first to see the validation message.',
      'Step 3 — optionally attach an image or PDF (under 8 MB). Also try a file over 8 MB to see it rejected.',
      'Step 4 — optionally add a contact (phone, WhatsApp or email), then "Submit Secure Report".',
    ],
    expected: [
      'You see "Report Submitted Safely" and a case number like SV-XXXX-XXXX.',
      'Write that case number down — you will need it for T4 and T5.',
      'You were never asked to create an account or give your name.',
    ],
  },
  {
    id: 'T2',
    title: 'Anonymous AI chat',
    account: 'None — private window',
    goal: 'Check the first-contact assistant on the home page.',
    steps: [
      'On the home page, type a message in the chat box (e.g. "I need help, someone is threatening me") and send it.',
      'Send two or three follow-up messages.',
    ],
    expected: [
      'A case is opened for the chat and a case number appears.',
      'Your messages appear immediately in the thread.',
      'An automated reply may take a few seconds. If no reply ever arrives, note it — that is a known configuration item, not a crash — but the page must not error.',
    ],
  },
  {
    id: 'T3',
    title: 'Quick Escape',
    account: 'None',
    goal: 'Verify the safety exit works on every survivor-facing page.',
    steps: [
      'On the home page, /report and /dashboard, click the "Quick Escape" button.',
      'Repeat by pressing the Escape key twice quickly.',
    ],
    expected: [
      'The tab immediately leaves SafeVoice for a neutral site.',
      'Pressing the browser Back button should not show what you typed.',
    ],
  },
  {
    id: 'T4',
    title: 'Survivor account: submit and track',
    account: 'survivor1@safevoice.test (or survivor2–4)',
    goal: 'Confirm a signed-in survivor can see only their own reports.',
    steps: [
      'Go to /auth/login and sign in with a survivor account.',
      'You land on "My Dashboard". Click "Submit a Report" and complete the wizard as in T1.',
      'Back on the dashboard, find the new case and open its secure chat.',
      'Send a message to the caseworker.',
      'Sign out, sign in as a different survivor (e.g. survivor2) and check the dashboard.',
    ],
    expected: [
      'Each survivor sees only the cases they created — survivor2 must NOT see survivor1\'s case.',
      'Trying to open /chat/<someone else\'s case number> directly must fail or show nothing.',
      'Opening /admin as a survivor redirects you away from the staff portal.',
    ],
  },
  {
    id: 'T5',
    title: 'Staff: read a case and reply',
    account: 'admin1@safevoice.test',
    goal: 'Prove reports are readable by staff and the chat round-trip works.',
    steps: [
      'Sign in at /auth/admin-login (or /auth/login) with an admin account. You land on the staff dashboard.',
      'Find the case number from T1 or T4 in the case list and open it.',
      'Read the narrative — it must be exactly what the reporter typed.',
      'Type a reply in "Type a secure message..." and press Enter.',
      'In another window, as the survivor from T4, open the chat for that case.',
    ],
    expected: [
      'The narrative, incident type, status and any evidence are visible to staff.',
      'The staff reply shows up in the survivor\'s chat (refresh if it does not appear within a few seconds).',
      'Staff sign-in never lands on the survivor dashboard.',
    ],
  },
  {
    id: 'T6',
    title: 'Assign a caseworker',
    account: 'admin1@safevoice.test then caseworker1@safevoice.test',
    goal: 'Check assignment and that caseworkers see the right cases.',
    steps: [
      'As admin, open a case and use the "Assign caseworker" control to assign it to Test Caseworker One.',
      'Sign out and sign in as caseworker1@safevoice.test.',
      'Open the dashboard and the assigned case; reply in the chat.',
      'Sign in as caseworker2@safevoice.test and look for the same case.',
    ],
    expected: [
      'The case shows the assigned caseworker and status changes from "open" to "in_progress".',
      'caseworker1 can open and reply; caseworker2 should not see a case not assigned to them.',
    ],
  },
  {
    id: 'T7',
    title: 'Admin: users and analytics',
    account: 'admin1@safevoice.test and analyst1@safevoice.test',
    goal: 'Exercise the remaining staff pages.',
    steps: [
      'As admin, open "Users" in the sidebar and try "Invite Caseworker" with a made-up @safevoice.test address.',
      'Open "Analytics" and interact with the map.',
      'Sign in as the analyst and visit the same pages.',
    ],
    expected: [
      'Pages load without errors; the analytics map renders (if it says "Mapbox Token Missing", report it).',
      'Note anything the analyst can change that they probably should not be able to.',
    ],
  },
  {
    id: 'T8',
    title: 'Access control (try to break it)',
    account: 'Any, plus a signed-out window',
    goal: 'Make sure protected routes cannot be reached without the right role.',
    steps: [
      'Signed out: visit /admin, /admin/analytics, /admin/users, /dashboard directly.',
      'As a survivor: visit /admin and /admin/cases/<a case number>.',
      'As a caseworker: visit /dashboard.',
      'Try signing in with the wrong password, and with an email that does not exist.',
    ],
    expected: [
      'Signed-out visitors are sent to /auth/login.',
      'Survivors are bounced away from /admin; staff are bounced away from /dashboard — with no redirect loop.',
      'Bad credentials show a clear error and nothing else.',
    ],
  },
  {
    id: 'T9',
    title: 'Mobile and accessibility',
    account: 'Any',
    goal: 'Most survivors will use a phone.',
    steps: [
      'Repeat T1 and T2 on a phone (or a narrow browser window).',
      'Navigate the report wizard using only the keyboard (Tab / Enter / Space).',
      'Turn on your phone\'s dark mode and reload.',
    ],
    expected: [
      'No horizontal scrolling, no overlapping buttons, all text readable.',
      'Every control is reachable and usable with the keyboard.',
    ],
  },
]

export default function TestingPage() {
  return (
    <main className="min-h-screen bg-canvas-soft py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-canvas rounded-[12px] p-8 border-2 border-mute/20">
          <p className="caption text-primary font-semibold uppercase tracking-wide mb-2">SafeVoice · User Acceptance Testing</p>
          <h1 className="display-sm text-ink mb-3">Tester Guide</h1>
          <p className="body-md text-body">
            Thank you for helping test SafeVoice, a trauma-informed platform for reporting gender-based violence and child abuse in Ghana.
            Work through the scenarios below in order, and log every problem you find using the bug template at the bottom.
          </p>
        </header>

        <section className="bg-primary/10 border border-primary rounded-[12px] p-6 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="body-md-strong text-ink">Test data only</p>
            <ul className="body-sm text-body list-disc pl-5 space-y-1">
              <li>Never enter a real person&apos;s name, phone number, address or story. Invent everything.</li>
              <li>These accounts are shared with other testers and will be deleted before launch.</li>
              <li>If you need real help now, call the Ghana Domestic Violence hotline on 0800 111 222 (toll free) or the police on 191.</li>
            </ul>
          </div>
        </section>

        <section className="bg-canvas rounded-[12px] p-8 border-2 border-mute/20">
          <h2 className="body-lg-strong text-ink flex items-center gap-2 mb-4">
            <KeyRound className="w-5 h-5 text-primary" /> Test accounts
          </h2>
          <p className="body-sm text-body mb-4">
            Sign in at <Link href="/auth/login" className="text-primary font-semibold">/auth/login</Link> (survivors) or{' '}
            <Link href="/auth/admin-login" className="text-primary font-semibold">/auth/admin-login</Link> (staff).
            Every account uses the password <code className="px-2 py-0.5 bg-canvas-soft rounded font-mono text-ink">{TESTER_PASSWORD}</code>.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left body-sm">
              <thead>
                <tr className="border-b border-mute/30 text-ink">
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2">What it can do</th>
                </tr>
              </thead>
              <tbody>
                {TESTER_ACCOUNTS.map((account) => (
                  <tr key={account.email} className="border-b border-mute/20 align-top">
                    <td className="py-2 pr-4 whitespace-nowrap text-ink font-semibold">{ROLE_LABEL[account.role]}</td>
                    <td className="py-2 pr-4 font-mono text-ink whitespace-nowrap">{account.email}</td>
                    <td className="py-2 text-body">{ROLE_HINT[account.role]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="caption text-body mt-4">
            Tip: use a separate browser profile or private window for each account so sessions don&apos;t collide.
            Anonymous scenarios (T1–T3) need no account at all.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="body-lg-strong text-ink flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" /> Test scenarios
          </h2>
          {SCENARIOS.map((s) => (
            <article key={s.id} className="bg-canvas rounded-[12px] p-6 border-2 border-mute/20">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                <span className="font-mono text-primary font-semibold">{s.id}</span>
                <h3 className="body-md-strong text-ink">{s.title}</h3>
              </div>
              <p className="caption text-body mb-1"><span className="font-semibold text-ink">Account:</span> {s.account}</p>
              <p className="caption text-body mb-4"><span className="font-semibold text-ink">Goal:</span> {s.goal}</p>

              <p className="body-sm-strong text-ink mb-1">Steps</p>
              <ol className="body-sm text-body list-decimal pl-5 space-y-1 mb-4">
                {s.steps.map((step, i) => <li key={i}>{step}</li>)}
              </ol>

              <p className="body-sm-strong text-ink mb-1 flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-primary" /> Expected result</p>
              <ul className="body-sm text-body list-disc pl-5 space-y-1">
                {s.expected.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </article>
          ))}
        </section>

        <section className="bg-canvas rounded-[12px] p-8 border-2 border-mute/20">
          <h2 className="body-lg-strong text-ink flex items-center gap-2 mb-4">
            <Bug className="w-5 h-5 text-primary" /> Reporting a problem
          </h2>
          <p className="body-sm text-body mb-4">
            For every issue, send the project owner one message using this template. Screenshots help enormously.
          </p>
          <pre className="bg-ink text-canvas rounded-[8px] p-4 text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap">{`Scenario:      T5
Account used:  admin1@safevoice.test
Device/browser: iPhone 13, Safari  (or: Windows laptop, Chrome)
What I did:    Opened case SV-AB12-CD34 and pressed Enter after typing a reply
What happened: The reply disappeared and nothing was shown
What I expected: The reply to appear in the thread
Severity:      Blocker / Major / Minor / Cosmetic
Screenshot:    (attach)`}</pre>
          <p className="caption text-body mt-4">
            <span className="font-semibold text-ink">Severity guide:</span> Blocker = cannot complete the scenario ·
            Major = wrong data, wrong access, or data loss · Minor = works but awkward · Cosmetic = visual only.
          </p>
        </section>

        <footer className="caption text-body text-center pb-6">
          Internal testing page — not linked from the app and excluded from search engines.
        </footer>
      </div>
    </main>
  )
}
