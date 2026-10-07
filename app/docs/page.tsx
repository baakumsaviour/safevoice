'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield,
  KeyRound,
  ClipboardList,
  Terminal,
  Bug,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Lock,
  EyeOff,
  UserCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  MapPin,
  MessageSquare,
  FileText,
  CheckCircle2,
} from 'lucide-react'

import { TESTER_ACCOUNTS, TESTER_PASSWORD } from '@/constants/testers.mjs'

type TabType = 'overview' | 'accounts' | 'workflows' | 'verification'

interface Scenario {
  id: string
  title: string
  category: 'survivor' | 'staff' | 'security' | 'accessibility'
  persona: string
  personaEmail?: string
  portalUrl: string
  portalLabel: string
  goal: string
  steps: string[]
  expected: string[]
}

const SCENARIOS: Scenario[] = [
  {
    id: 'T1',
    title: 'Anonymous Incident Report (Zero Credentials)',
    category: 'survivor',
    persona: 'Anonymous Citizen (No Account)',
    portalUrl: '/report',
    portalLabel: 'Open Report Wizard',
    goal: 'Confirm a survivor can file a complete, encrypted report without creating an account or revealing their identity.',
    steps: [
      'Open the report wizard at /report (or click "Report an Incident" from the homepage).',
      'Step 1 (Incident Type): Choose a category (e.g. "Physical Assault" or "Domestic Harassment") and click Next.',
      'Step 2 (Narrative): Enter a description (minimum 10 characters). Try clicking Next while empty to test form validation.',
      'Step 3 (Evidence): Optionally attach a test image or PDF (under 8 MB limit).',
      'Step 4 (Contact & Pin): Notice contact info is strictly optional. Leave blank for 100% anonymity, then click "Submit Secure Report".',
    ],
    expected: [
      'You are redirected to the confirmation screen with a cryptographic case number (e.g. SV-XXXX-XXXX).',
      'You are provided with a discreet tracking link and cryptographic receipt.',
      'You were never prompted for a username, email, phone number, or password.',
    ],
  },
  {
    id: 'T2',
    title: 'First-Contact AI Trauma-Informed Triage',
    category: 'survivor',
    persona: 'Anonymous Citizen',
    portalUrl: '/',
    portalLabel: 'Open AI Chat Widget',
    goal: 'Validate the conversational AI assistant that offers immediate comfort, safety guidance, and incident onboarding.',
    steps: [
      'Navigate to the homepage (/) in a private browser window.',
      'Locate the SafeVoice AI First-Contact chat widget on the landing page.',
      'Send a triage message, such as: "Someone is following me and threatening to harm me at my house."',
      'Observe the empathetic, de-escalating response with immediate safety advice and case initiation.',
      'Send follow-up details to verify continuity in the conversation thread.',
    ],
    expected: [
      'The AI responds with trauma-informed tone, validates the survivor\'s safety, and offers emergency numbers.',
      'A secure case thread is automatically established with an active case number.',
      'No personal identity is demanded at any point.',
    ],
  },
  {
    id: 'T3',
    title: 'Emergency Quick Escape & Anti-Detection',
    category: 'security',
    persona: 'Any Visitor / In-Danger Survivor',
    portalUrl: '/report',
    portalLabel: 'Test on Report Page',
    goal: 'Verify that the emergency safety exit instantaneously flushes application state and navigates to a neutral decoy site.',
    steps: [
      'Navigate to /report or /dashboard.',
      'Type partially filled information into a form input.',
      'Click the red/prominent "Quick Escape" button in the upper header or floating toolbar.',
      'Alternatively, press the "Escape" key twice in rapid succession.',
      'Attempt to click the browser "Back" button.',
    ],
    expected: [
      'The browser tab immediately navigates to a neutral external site (such as BBC Weather, Google, or Wikipedia).',
      'Session storage and form inputs are wiped.',
      'Pressing Back does not restore sensitive incident text or reveal SafeVoice in history.',
    ],
  },
  {
    id: 'T4',
    title: 'Authenticated Survivor Case Tracking & Isolation',
    category: 'survivor',
    persona: 'survivor1@safevoice.test vs survivor2@safevoice.test',
    personaEmail: 'survivor1@safevoice.test',
    portalUrl: '/auth/login?email=survivor1@safevoice.test',
    portalLabel: 'Sign In as Survivor 1',
    goal: 'Confirm registered survivors can manage their cases, and verify Row-Level Security (RLS) ensures absolute data isolation between users.',
    steps: [
      'Sign in at /auth/login using survivor1@safevoice.test (password: 00000000).',
      'You will land on the citizen dashboard (/dashboard). Submit a new test case.',
      'Note the generated case number and send a message in the secure caseworker chat.',
      'Sign out, and sign in as survivor2@safevoice.test (password: 00000000).',
      'Inspect survivor2\'s dashboard and attempt to access survivor1\'s case URL directly.',
    ],
    expected: [
      'survivor1 can view and manage only their own submitted cases.',
      'survivor2 cannot see any case submitted by survivor1.',
      'Attempting to navigate directly to /chat/[survivor1_case_number] as survivor2 returns 404 or an access denied state.',
    ],
  },
  {
    id: 'T5',
    title: 'Staff Portal Triaging & Two-Way Secure Chat',
    category: 'staff',
    persona: 'admin1@safevoice.test (DOVVSU Supervisor)',
    personaEmail: 'admin1@safevoice.test',
    portalUrl: '/auth/admin-login?email=admin1@safevoice.test',
    portalLabel: 'Sign In as Admin',
    goal: 'Demonstrate how law enforcement and DOVVSU officers receive cases, inspect evidence, and converse securely with survivors.',
    steps: [
      'Sign in at /auth/admin-login using admin1@safevoice.test (password: 00000000).',
      'You are directed to the staff Active Cases table at /admin.',
      'Click on any active case (e.g. from T1 or T4) to open the Case Details view (/admin/cases/[id]).',
      'Review the incident metadata, trauma classification, narrative, and attached evidence.',
      'Type an official response in the secure message box and click Send.',
      'In a separate window, verify the message arrives in the survivor\'s chat thread.',
    ],
    expected: [
      'The case narrative, severity tags, and attachments are clearly displayed.',
      'Two-way chat messages synchronize between the staff officer and the survivor.',
      'Staff accounts are never routed to the citizen dashboard.',
    ],
  },
  {
    id: 'T6',
    title: 'Case Delegation & Caseworker Role Scoping',
    category: 'staff',
    persona: 'admin1@safevoice.test → caseworker1@safevoice.test',
    personaEmail: 'admin1@safevoice.test',
    portalUrl: '/auth/admin-login?email=admin1@safevoice.test',
    portalLabel: 'Open Staff Portal',
    goal: 'Verify case assignment workflows and enforce that field caseworkers only access cases assigned to their jurisdiction.',
    steps: [
      'Sign in as admin1@safevoice.test and navigate to /admin/cases/[id].',
      'Use the "Assign Caseworker" dropdown to delegate the case to "Test Caseworker One" (caseworker1@safevoice.test).',
      'Observe the case status change from "open" (Needs Triage) to "in_progress" (In Progress).',
      'Sign out and log in as caseworker1@safevoice.test — verify the case is visible on their dashboard.',
      'Sign out and log in as caseworker2@safevoice.test — verify caseworker2 does not see unassigned private cases.',
    ],
    expected: [
      'The assigned caseworker is saved in the database audit log.',
      'Status transitions smoothly to "in_progress".',
      'Caseworker 1 has full triage access, while other caseworkers are scoped appropriately.',
    ],
  },
  {
    id: 'T7',
    title: 'Geospatial Analytics & Incident Heatmap',
    category: 'staff',
    persona: 'analyst1@safevoice.test (Data Analyst)',
    personaEmail: 'analyst1@safevoice.test',
    portalUrl: '/auth/admin-login?email=analyst1@safevoice.test',
    portalLabel: 'Sign In as Analyst',
    goal: 'Demonstrate administrative intelligence, regional incident distribution across Ghana, and category analytics.',
    steps: [
      'Sign in at /auth/admin-login as analyst1@safevoice.test (password: 00000000).',
      'Navigate to /admin/analytics via the sidebar navigation.',
      'Interact with the regional map, zoom into Accra, Kumasi, and Tamale clusters.',
      'Examine the category breakdown charts (Domestic Violence, Physical Assault, Child Abuse, Stalking).',
      'Check the triage resolution metrics and average response timeline indicators.',
    ],
    expected: [
      'Analytics dashboard loads with real aggregated case metrics.',
      'Geospatial points render clearly across Ghana administrative regions.',
      'Analyst account has read-only intelligence access and cannot delete case logs.',
    ],
  },
  {
    id: 'T8',
    title: 'RBAC Boundary Enforcement (Perimeter Resistance)',
    category: 'security',
    persona: 'Unauthenticated Visitor / Citizen Actor',
    portalUrl: '/admin',
    portalLabel: 'Test Direct /admin Access',
    goal: 'Prove that protected staff routes (/admin, /admin/cases, /admin/analytics, /admin/users) are strictly inaccessible without staff credentials.',
    steps: [
      'In a completely signed-out or private browser window, navigate directly to /admin.',
      'Attempt to access /admin/analytics or /admin/users directly via URL address bar.',
      'Log in as survivor1@safevoice.test, and manually navigate to /admin in the URL bar.',
      'Log in as caseworker1@safevoice.test, and manually navigate to /dashboard in the URL bar.',
      'Try submitting the admin login form with an invalid password or nonexistent email.',
    ],
    expected: [
      'Unauthenticated requests to /admin are instantly blocked and redirected to /auth/admin-login.',
      'Authenticated survivors visiting /admin are redirected to /auth/admin-login?error=unauthorized.',
      'Staff accounts visiting /dashboard are redirected to /admin.',
      'Zero sensitive case data is exposed via SSR or client bundles.',
    ],
  },
  {
    id: 'T9',
    title: 'Mobile Touch Ergonomics & Keyboard Accessibility',
    category: 'accessibility',
    persona: 'Mobile Device / Keyboard-Only User',
    portalUrl: '/report',
    portalLabel: 'Open Mobile View',
    goal: 'Ensure survivors on low-cost Android phones or using assistive technologies can seamlessly file reports.',
    steps: [
      'Open Chrome DevTools and toggle Device Emulation (e.g. iPhone SE / Pixel 7, 375px width).',
      'Navigate through the report wizard at /report on the mobile viewport.',
      'Test keyboard navigation: unplug your mouse and use only Tab, Shift+Tab, Enter, and Space.',
      'Inspect focus rings on interactive inputs, radio cards, and buttons.',
      'Check contrast and legibility across all form labels.',
    ],
    expected: [
      'No horizontal overflow or clipped text occurs on small screens.',
      'All interactive controls have touch targets of at least 44x44px.',
      'Keyboard focus outline is clearly visible on every step.',
    ],
  },
]

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [roleFilter, setRoleFilter] = useState<'all' | 'staff' | 'victim' | 'anonymous'>('all')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [completedScenarios, setCompletedScenarios] = useState<Record<string, boolean>>({})
  const [expandedScenarios, setExpandedScenarios] = useState<Record<string, boolean>>({
    T1: true,
    T5: true,
  })

  // Load checklist state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('safevoice_docs_completed_scenarios')
      if (saved) {
        setCompletedScenarios(JSON.parse(saved))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  const toggleScenarioStep = (id: string) => {
    setCompletedScenarios((prev) => {
      const next = { ...prev, [id]: !prev[id] }
      try {
        localStorage.setItem('safevoice_docs_completed_scenarios', JSON.stringify(next))
      } catch {
        // Ignore localStorage errors
      }
      return next
    })
  }

  const resetChecklist = () => {
    setCompletedScenarios({})
    try {
      localStorage.removeItem('safevoice_docs_completed_scenarios')
    } catch {
      // Ignore localStorage errors
    }
  }

  const toggleAccordion = (id: string) => {
    setExpandedScenarios((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch {
      // Fallback
    }
  }

  const completedCount = Object.values(completedScenarios).filter(Boolean).length
  const progressPercent = Math.round((completedCount / SCENARIOS.length) * 100)

  const filteredAccounts = TESTER_ACCOUNTS.filter((acc) => {
    if (roleFilter === 'all') return true
    if (roleFilter === 'staff') return ['admin', 'caseworker', 'analyst'].includes(acc.role)
    if (roleFilter === 'victim') return acc.role === 'victim'
    return false
  })

  return (
    <div className="min-h-screen bg-canvas-soft text-ink">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-canvas border-b border-border shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-xs">
                <Image src="/safevoice logo.png" alt="SafeVoice Logo" width={22} height={22} className="object-contain" />
              </div>
              <div>
                <span className="body-md-strong text-ink tracking-tight">SafeVoice</span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-semibold">
                  Documentation & Testing Hub
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-body hover:text-ink hover:bg-canvas-soft transition-colors"
            >
              ← Back to App
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-xs"
            >
              <Shield className="w-3.5 h-3.5" />
              Report Incident
            </Link>
            <button
              onClick={() => {
                window.location.replace('https://www.bbc.com/weather')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
              title="Leave site immediately (Quick Escape)"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Quick</span> Escape
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-canvas border-b border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Interactive Evaluation Sandbox
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-canvas-soft text-body border border-border">
                  University of Ghana CS Thesis Showcase
                </span>
                <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-canvas-soft text-body border border-border">
                  Ghana Act 732 Compliant
                </span>
              </div>
              <h1 className="display-sm text-ink sm:text-3xl font-bold tracking-tight">
                Platform Architecture, Test Accounts & Verification Guide
              </h1>
              <p className="body-md text-body leading-relaxed">
                Welcome to the complete testing portal for SafeVoice. Explore system architecture, copy credentials for all administrative
                and survivor personas, execute step-by-step guided evaluation workflows, and verify cryptographic security and access controls.
              </p>
            </div>

            {/* Progress Card */}
            <div className="bg-canvas-soft border border-border rounded-2xl p-5 w-full md:w-72 shadow-xs shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="caption-strong text-ink">Testing Progress</span>
                <span className="caption text-primary font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-mute/20 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-body">
                <span>{completedCount} of {SCENARIOS.length} Scenarios</span>
                {completedCount > 0 && (
                  <button
                    onClick={resetChecklist}
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex overflow-x-auto gap-2 pt-8 mt-6 border-t border-border no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-canvas-soft text-body hover:text-ink hover:bg-canvas'
              }`}
            >
              <FileText className="w-4 h-4" />
              1. Platform Overview & Architecture
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-canvas-soft text-body hover:text-ink hover:bg-canvas'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              2. Test Accounts Switchboard ({TESTER_ACCOUNTS.length + 1})
            </button>
            <button
              onClick={() => setActiveTab('workflows')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'workflows'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-canvas-soft text-body hover:text-ink hover:bg-canvas'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              3. Interactive Scenarios & Workflows ({SCENARIOS.length})
            </button>
            <button
              onClick={() => setActiveTab('verification')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'verification'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-canvas-soft text-body hover:text-ink hover:bg-canvas'
              }`}
            >
              <Terminal className="w-4 h-4" />
              4. CLI Verification & Bug Reporting
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* TAB 1: OVERVIEW & ARCHITECTURE */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h3 className="body-md-strong text-amber-900">Synthetic Testing Data Notice</h3>
                <p className="body-sm text-amber-800 leading-relaxed">
                  This environment is loaded with test accounts and simulated cases for academic evaluation and user testing.
                  Never submit real personal identification numbers, genuine survivor names, or real confidential evidence.
                  If you or someone you know in Ghana is facing real gender-based violence, immediately reach the
                  <strong> Ghana Domestic Violence Helpline at 0800 111 222 (Toll Free)</strong> or Ghana Police emergency lines at <strong>191 / 18555</strong>.
                </p>
              </div>
            </div>

            {/* Architecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-canvas border border-border rounded-2xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <EyeOff className="w-5 h-5 text-primary" />
                </div>
                <h2 className="body-lg-strong text-ink">Zero-Friction Anonymous Intake</h2>
                <p className="body-sm text-body leading-relaxed">
                  Survivors can submit complete incident reports without creating an account or revealing their email, name, or phone number.
                  Eliminating authentication barriers prevents intimidation and encourages early-stage reporting.
                </p>
                <div className="pt-2 border-t border-border/60">
                  <Link href="/report" className="caption font-semibold text-primary hover:underline inline-flex items-center gap-1">
                    Try Anonymous Wizard <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="bg-canvas border border-border rounded-2xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h2 className="body-lg-strong text-ink">Cryptographic Case Verification</h2>
                <p className="body-sm text-body leading-relaxed">
                  Every incident generates a deterministic tracking hash (<code className="font-mono text-primary font-semibold">SV-XXXX-XXXX</code>).
                  Case data and evidence attachments are encrypted via AES-256-GCM and verified using HMAC integrity checks.
                </p>
                <div className="pt-2 border-t border-border/60">
                  <span className="caption text-body">HMAC-SHA256 · AES-256-GCM · Tamper-evident</span>
                </div>
              </div>

              <div className="bg-canvas border border-border rounded-2xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="body-lg-strong text-ink">AI First-Contact Triage</h2>
                <p className="body-sm text-body leading-relaxed">
                  Trauma-informed conversational AI acts as the first line of empathetic response, assessing immediate physical risk,
                  providing safety instructions, and pre-categorizing incidents for DOVVSU caseworkers.
                </p>
                <div className="pt-2 border-t border-border/60">
                  <Link href="/" className="caption font-semibold text-primary hover:underline inline-flex items-center gap-1">
                    Try Landing Assistant <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="bg-canvas border border-border rounded-2xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <h2 className="body-lg-strong text-ink">Strict RBAC & Route Isolation</h2>
                <p className="body-sm text-body leading-relaxed">
                  PostgreSQL Row-Level Security (RLS) ensures survivors only see their own cases.
                  Staff routes (<code className="font-mono text-xs">/admin</code>) are doubly gated by Next.js middleware and server-side layout guards.
                </p>
                <div className="pt-2 border-t border-border/60">
                  <Link href="/auth/admin-login" className="caption font-semibold text-primary hover:underline inline-flex items-center gap-1">
                    Staff Portal Login <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              <div className="bg-canvas border border-border rounded-2xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h2 className="body-lg-strong text-ink">Geospatial Intelligence</h2>
                <p className="body-sm text-body leading-relaxed">
                  Aggregated hotspot mapping visualizes incident frequency across Ghanaian regions (Greater Accra, Ashanti, Northern Region)
                  without exposing individual survivor GPS coordinates or private dwellings.
                </p>
                <div className="pt-2 border-t border-border/60">
                  <span className="caption text-body">Mapbox GL · Anonymized coordinate fuzzing</span>
                </div>
              </div>

              <div className="bg-canvas border border-border rounded-2xl p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <h2 className="body-lg-strong text-ink">End-to-End Two-Way Chat</h2>
                <p className="body-sm text-body leading-relaxed">
                  Provides a live communication bridge between assigned DOVVSU caseworkers and survivors.
                  Both parties can exchange follow-up questions, evidence clarification, and court updates in real time.
                </p>
                <div className="pt-2 border-t border-border/60">
                  <span className="caption text-body">Realtime Supabase Channels</span>
                </div>
              </div>
            </div>

            {/* Legal Framework & Hotlines */}
            <div className="bg-canvas border border-border rounded-2xl p-8 space-y-6">
              <h2 className="display-sm text-ink text-xl">Ghanaian Legal Context & Emergency Protocols</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 body-sm text-body">
                <div className="space-y-2">
                  <h3 className="body-md-strong text-ink">Applicable Statutes</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Domestic Violence Act, 2007 (Act 732):</strong> Defines domestic violence broadly across physical, sexual, emotional, and economic abuse.</li>
                    <li><strong>Criminal Offences Act, 1960 (Act 29):</strong> Codifies assault, threats of harm, indecent assault, and criminal harassment.</li>
                    <li><strong>Data Protection Act, 2012 (Act 843):</strong> Mandates confidentiality and high security for sensitive citizen disclosures.</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="body-md-strong text-ink">Official Hotline Integration</h3>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Ghana GBV Toll-Free Helpline:</strong> <code className="font-mono text-ink font-bold">0800 111 222</code></li>
                    <li><strong>Ghana Police Service / DOVVSU Emergency:</strong> <code className="font-mono text-ink font-bold">191</code> or <code className="font-mono text-ink font-bold">18555</code></li>
                    <li><strong>Ambulance Service:</strong> <code className="font-mono text-ink font-bold">193</code></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEST ACCOUNTS SWITCHBOARD */}
        {activeTab === 'accounts' && (
          <div className="space-y-8">
            {/* Password Callout Banner */}
            <div className="bg-canvas border-2 border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="body-md-strong text-ink">Unified Test Password</h3>
                  <p className="body-sm text-body">
                    Every test account below shares the identical password for convenient evaluation:
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-canvas-soft px-4 py-2.5 rounded-xl border border-border">
                <code className="font-mono text-base font-bold text-ink">{TESTER_PASSWORD}</code>
                <button
                  onClick={() => copyToClipboard(TESTER_PASSWORD, 'global-pass')}
                  className="p-1.5 text-body hover:text-primary transition-colors cursor-pointer"
                  title="Copy password"
                >
                  {copiedKey === 'global-pass' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="caption-strong text-body mr-1">Filter Roles:</span>
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roleFilter === 'all' ? 'bg-primary text-on-primary' : 'bg-canvas border border-border text-body hover:text-ink'
                  }`}
                >
                  All Accounts ({TESTER_ACCOUNTS.length + 1})
                </button>
                <button
                  onClick={() => setRoleFilter('staff')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roleFilter === 'staff' ? 'bg-primary text-on-primary' : 'bg-canvas border border-border text-body hover:text-ink'
                  }`}
                >
                  Staff & DOVVSU (6)
                </button>
                <button
                  onClick={() => setRoleFilter('victim')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roleFilter === 'victim' ? 'bg-primary text-on-primary' : 'bg-canvas border border-border text-body hover:text-ink'
                  }`}
                >
                  Survivors (4)
                </button>
                <button
                  onClick={() => setRoleFilter('anonymous')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roleFilter === 'anonymous' ? 'bg-primary text-on-primary' : 'bg-canvas border border-border text-body hover:text-ink'
                  }`}
                >
                  Anonymous (1)
                </button>
              </div>

              <p className="caption text-body">
                💡 Tip: Use separate incognito or browser profiles to simulate simultaneous survivor and officer chats.
              </p>
            </div>

            {/* Anonymous Citizen Card (Always prominent when all or anonymous) */}
            {(roleFilter === 'all' || roleFilter === 'anonymous') && (
              <div className="bg-canvas border-2 border-primary/30 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      Zero Identity Trail
                    </span>
                    <h3 className="body-lg-strong text-ink">Anonymous Citizen (Reporter)</h3>
                  </div>
                  <p className="body-sm text-body">
                    Does not require any credentials or sign-up. Files end-to-end encrypted reports, receives a cryptographic receipt
                    code (<code className="font-mono text-primary font-semibold">SV-XXXX-XXXX</code>), and interacts with the AI de-escalation bot.
                  </p>
                  <p className="caption text-body">
                    <strong>Permitted:</strong> File reports, upload evidence under 8MB, trigger Quick Escape, receive AI triage.
                    <br />
                    <strong>Restricted:</strong> Cannot access staff portal (<code className="font-mono">/admin</code>).
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href="/report"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity shadow-xs"
                  >
                    <Shield className="w-4 h-4" />
                    Launch Report Wizard
                  </Link>
                </div>
              </div>
            )}

            {/* Account Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAccounts.map((account) => {
                const isStaff = ['admin', 'caseworker', 'analyst'].includes(account.role)
                const targetPortal = isStaff ? `/auth/admin-login?email=${encodeURIComponent(account.email)}` : `/auth/login?email=${encodeURIComponent(account.email)}`
                const roleBadgeColor =
                  account.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : account.role === 'caseworker'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : account.role === 'analyst'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'

                const roleTitle =
                  account.role === 'admin'
                    ? 'Administrator / DOVVSU Supervisor'
                    : account.role === 'caseworker'
                    ? 'DOVVSU Caseworker / Officer'
                    : account.role === 'analyst'
                    ? 'Intelligence Data Analyst'
                    : 'Registered Survivor'

                const capabilities =
                  account.role === 'admin'
                    ? 'Full staff portal access: triages all cases, assigns caseworkers, invites staff, views high-level intelligence and regional heatmaps.'
                    : account.role === 'caseworker'
                    ? 'Staff portal access: triages open cases, replies securely to survivors, manages assigned case workflows.'
                    : account.role === 'analyst'
                    ? 'Read-only staff portal access: views aggregated case metrics, regional incident heatmaps, and trend charts.'
                    : 'Citizen portal access: files reports, tracks own cases in /dashboard, chats securely with assigned caseworkers.'

                return (
                  <div key={account.email} className="bg-canvas border border-border rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeColor}`}>
                          {roleTitle}
                        </span>
                        <span className="caption text-body">{isStaff ? 'Staff Portal' : 'Survivor Portal'}</span>
                      </div>

                      <div>
                        <h4 className="body-md-strong text-ink">{account.fullName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="body-sm font-mono text-ink bg-canvas-soft px-2 py-0.5 rounded border border-border">
                            {account.email}
                          </code>
                          <button
                            onClick={() => copyToClipboard(account.email, account.email)}
                            className="p-1 text-body hover:text-primary transition-colors cursor-pointer"
                            title="Copy Email"
                          >
                            {copiedKey === account.email ? (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="body-sm text-body leading-relaxed">{capabilities}</p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                      <button
                        onClick={() => copyToClipboard(TESTER_PASSWORD, `pass-${account.email}`)}
                        className="text-xs text-body hover:text-ink inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `pass-${account.email}` ? (
                          <span className="text-primary font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Password Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Copy className="w-3.5 h-3.5" /> Copy Password
                          </span>
                        )}
                      </button>

                      <Link
                        href={targetPortal}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-opacity shadow-xs ${
                          isStaff ? 'bg-ink text-white hover:opacity-90' : 'bg-primary text-on-primary hover:opacity-90'
                        }`}
                      >
                        <span>Launch {isStaff ? 'Staff' : 'Survivor'} Login</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE WORKFLOWS & SCENARIOS */}
        {activeTab === 'workflows' && (
          <div className="space-y-6">
            <div className="bg-canvas border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="body-md-strong text-ink">Guided Test Execution Plan</h3>
                <p className="body-sm text-body">
                  Execute these 9 scenarios in order to rigorously evaluate all user stories, security boundaries, and trauma-informed workflows.
                  Your progress is saved locally in this browser.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-body font-medium">{completedCount} of {SCENARIOS.length} completed</span>
                {completedCount > 0 && (
                  <button
                    onClick={resetChecklist}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-canvas-soft border border-border text-body hover:text-ink cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Scenarios List */}
            <div className="space-y-4">
              {SCENARIOS.map((scenario) => {
                const isCompleted = !!completedScenarios[scenario.id]
                const isExpanded = !!expandedScenarios[scenario.id]

                return (
                  <div
                    key={scenario.id}
                    className={`bg-canvas border rounded-2xl transition-all ${
                      isCompleted ? 'border-primary/40 bg-primary/2' : 'border-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer" onClick={() => toggleAccordion(scenario.id)}>
                      <div className="flex items-start sm:items-center gap-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleScenarioStep(scenario.id)
                          }}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors mt-0.5 sm:mt-0 ${
                            isCompleted ? 'bg-primary border-primary text-white' : 'border-mute/50 bg-canvas hover:border-primary'
                          }`}
                        >
                          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                              {scenario.id}
                            </span>
                            <span className="caption text-body">Persona: <strong>{scenario.persona}</strong></span>
                          </div>
                          <h4 className={`body-md-strong ${isCompleted ? 'text-primary' : 'text-ink'}`}>
                            {scenario.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href={scenario.portalUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-canvas-soft border border-border text-ink hover:border-primary transition-colors"
                        >
                          <span>{scenario.portalLabel}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-body" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-body" />
                        )}
                      </div>
                    </div>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-border/50 space-y-5">
                        <div className="bg-canvas-soft p-4 rounded-xl border border-border">
                          <p className="caption-strong text-ink mb-0.5">Evaluation Objective:</p>
                          <p className="body-sm text-body">{scenario.goal}</p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-2">
                          <p className="body-sm-strong text-ink">Step-by-Step Instructions:</p>
                          <ol className="space-y-2 list-decimal list-outside pl-5 body-sm text-body">
                            {scenario.steps.map((step, idx) => (
                              <li key={idx} className="leading-relaxed">{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Expected Outcome */}
                        <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4 space-y-2">
                          <p className="caption-strong text-emerald-900 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Expected Verification Outcome:
                          </p>
                          <ul className="space-y-1.5 list-disc list-outside pl-5 body-sm text-emerald-900">
                            {scenario.expected.map((exp, idx) => (
                              <li key={idx} className="leading-relaxed">{exp}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => toggleScenarioStep(scenario.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              isCompleted
                                ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                : 'bg-primary text-on-primary hover:opacity-90'
                            }`}
                          >
                            {isCompleted ? 'Mark as Incomplete' : '✓ Mark Scenario Complete'}
                          </button>

                          <Link
                            href={scenario.portalUrl}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-canvas-soft border border-border text-ink hover:border-primary transition-colors"
                          >
                            <span>Launch {scenario.portalLabel}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CLI VERIFICATION & BUG REPORTING */}
        {activeTab === 'verification' && (
          <div className="space-y-8">
            {/* Terminal Commands Card */}
            <div className="bg-canvas border border-border rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="body-lg-strong text-ink flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" /> Automated CLI Verification Suite
                </h3>
                <p className="body-sm text-body mt-1">
                  Run these automated test scripts from your terminal in the project root to mathematically verify security policies,
                  stealth mechanisms, and end-to-end user flows.
                </p>
              </div>

              <div className="space-y-4">
                {/* Command 1 */}
                <div className="bg-ink text-white rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>1. Seed or Reset Test Accounts</span>
                    <button
                      onClick={() => copyToClipboard('node scripts/create-testers.mjs', 'cmd1')}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'cmd1' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-sm overflow-x-auto text-emerald-400">node scripts/create-testers.mjs</pre>
                  <p className="caption text-white/60">
                    Provisions all 10 tester accounts in Supabase Auth and populates the public users role table.
                  </p>
                </div>

                {/* Command 2 */}
                <div className="bg-ink text-white rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>2. Verify Row-Level Security (RLS) Isolation</span>
                    <button
                      onClick={() => copyToClipboard('node scripts/verify-rls.mjs', 'cmd2')}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'cmd2' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-sm overflow-x-auto text-emerald-400">node scripts/verify-rls.mjs</pre>
                  <p className="caption text-white/60">
                    Executes cross-account query attacks to mathematically prove survivor2 cannot read survivor1 cases.
                  </p>
                </div>

                {/* Command 3 */}
                <div className="bg-ink text-white rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>3. Verify Stealth Mode & Camouflage Protection</span>
                    <button
                      onClick={() => copyToClipboard('node scripts/verify-stealth.mjs', 'cmd3')}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'cmd3' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-sm overflow-x-auto text-emerald-400">node scripts/verify-stealth.mjs</pre>
                  <p className="caption text-white/60">
                    Validates offline PWA camouflage manifest, math calculator disguise assets, and Quick Escape routes.
                  </p>
                </div>

                {/* Command 4 */}
                <div className="bg-ink text-white rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>4. Run Playwright End-to-End Regression Tests</span>
                    <button
                      onClick={() => copyToClipboard('npx playwright test', 'cmd4')}
                      className="text-white/70 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copiedKey === 'cmd4' ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="font-mono text-sm overflow-x-auto text-emerald-400">npx playwright test</pre>
                  <p className="caption text-white/60">
                    Simulates browser flows covering auth redirects, anonymous report submissions, and AI chat widget.
                  </p>
                </div>
              </div>
            </div>

            {/* Bug Report Template */}
            <div className="bg-canvas border border-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="body-lg-strong text-ink flex items-center gap-2">
                    <Bug className="w-5 h-5 text-primary" /> Standardized Evaluation Feedback & Bug Template
                  </h3>
                  <p className="body-sm text-body mt-1">
                    If you detect an error, broken redirect, or UX anomaly, copy this template and provide it to the development team:
                  </p>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Scenario:       [e.g., T5 Staff Triaging]\nAccount:        [e.g., admin1@safevoice.test]\nDevice/Browser: [e.g., macOS Sonoma, Chrome 128]\nSteps Taken:    1. ... 2. ...\nObserved:       [What actually happened]\nExpected:       [What should have happened]\nSeverity:       [Blocker | Major | Minor | Cosmetic]`,
                      'bug-template'
                    )
                  }
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-on-primary hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedKey === 'bug-template' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'bug-template' ? 'Copied' : 'Copy Template'}</span>
                </button>
              </div>

              <pre className="bg-ink text-white rounded-xl p-5 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
{`Scenario:       [e.g., T5 Staff Triaging]
Account:        [e.g., admin1@safevoice.test]
Device/Browser: [e.g., macOS Sonoma, Chrome 128 / iOS Safari 18]
Steps Taken:    1. Signed into /auth/admin-login as admin1
                2. Opened case SV-4821-9921
                3. Sent message in secure thread
Observed:       [What actually happened]
Expected:       [What should have happened]
Severity:       [Blocker | Major | Minor | Cosmetic]`}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-canvas py-8 px-4 text-center">
        <p className="caption text-body">
          SafeVoice Academic & Testing Documentation · Built with Next.js, Supabase RLS, and Tailwind CSS · University of Ghana Final Year Project
        </p>
        <div className="flex items-center justify-center gap-4 mt-2 caption font-medium">
          <Link href="/" className="text-primary hover:underline">Home</Link>
          <span>·</span>
          <Link href="/report" className="text-primary hover:underline">Report Incident</Link>
          <span>·</span>
          <Link href="/auth/login" className="text-primary hover:underline">Citizen Sign In</Link>
          <span>·</span>
          <Link href="/auth/admin-login" className="text-primary hover:underline">Staff Portal</Link>
        </div>
      </footer>
    </div>
  )
}
