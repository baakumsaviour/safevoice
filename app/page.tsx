import Link from 'next/link'
import { Shield, Users, BarChart3, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">SafeVoice</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link href="/report" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Report</Link>
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Dashboard</Link>
            <Link href="/analytics" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Analytics</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Secure Case Management for Survivors
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            SafeVoice provides trauma-informed case management with military-grade encryption, secure messaging, and comprehensive support resources.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/report">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Report a Case
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                Caseworker Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
            <Shield className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Military-Grade Security</h3>
            <p className="text-slate-600 dark:text-slate-400">End-to-end encryption for all case narratives, messages, and evidence uploads</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Trauma-Informed Design</h3>
            <p className="text-slate-600 dark:text-slate-400">Quick escape button, minimal navigation, and supportive messaging throughout</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
            <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Advanced Analytics</h3>
            <p className="text-slate-600 dark:text-slate-400">Geographic heatmaps, trend analysis, and demographic insights for better decision-making</p>
          </div>
        </div>

        {/* Portal Cards */}
        <div className="mt-32">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">Access Portals</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Victim Portal */}
            <Link href="/report" className="group">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Victim Portal</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Report abuse securely and anonymously. Upload evidence with confidence.</p>
                <div className="flex items-center text-blue-600 group-hover:gap-2 transition-all">
                  <span>Start Reporting</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>

            {/* Caseworker Dashboard */}
            <Link href="/dashboard" className="group">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Caseworker Dashboard</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Manage cases, communicate securely, and coordinate with your team.</p>
                <div className="flex items-center text-blue-600 group-hover:gap-2 transition-all">
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>

            {/* Analytics Hub */}
            <Link href="/analytics" className="group">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analytics Hub</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">View trends, geographic data, and key performance indicators.</p>
                <div className="flex items-center text-blue-600 group-hover:gap-2 transition-all">
                  <span>View Analytics</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Resources Footer */}
        <div className="mt-32 bg-white dark:bg-slate-900 rounded-lg p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Immediate Support Resources</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">National Sexual Assault Hotline</p>
              <p className="text-slate-600 dark:text-slate-400">1-800-656-4673 (HOPE)</p>
            </div>
            <div>
              <p className="font-medium text-slate-900 dark:text-white">National Domestic Violence Hotline</p>
              <p className="text-slate-600 dark:text-slate-400">1-800-799-7233 (SAFE)</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
