import Link from 'next/link'
import { FileText, Clock, AlertCircle } from 'lucide-react'
import { getVictimCasesAction } from '@/server/actions/victim'
import { logoutAction } from '@/app/auth/actions'

export const metadata = {
  title: 'My Reports | SafeVoice',
}

export default async function VictimDashboardPage() {
  const result = await getVictimCasesAction()
  const cases = result.success ? result.cases : []

  return (
    <main className="min-h-screen bg-canvas-soft py-12 px-6 md:px-12 max-w-5xl mx-auto">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="display-sm text-ink mb-2">My Reports</h1>
          <p className="body-md text-body">View the status of your reports and access secure chats.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/report">
            <button className="bg-primary text-on-primary body-sm py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
              New Report
            </button>
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="bg-mute/20 text-ink body-sm py-2 px-6 rounded-full hover:bg-mute/30 transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {result.error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl body-sm">
          {result.error}
        </div>
      )}

      {cases?.length === 0 ? (
        <div className="bg-canvas border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="body-lg-strong text-ink mb-2">No Reports Yet</h2>
          <p className="body-sm text-body mb-8 max-w-md mx-auto">
            You haven't submitted any reports under this account. If you submitted an anonymous report, it is kept completely separate for your safety.
          </p>
          <Link href="/report">
            <button className="bg-primary text-on-primary body-sm py-3 px-8 rounded-full hover:opacity-90 transition-opacity">
              Submit a Report
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {cases?.map((c: any) => (
            <div key={c.id} className="bg-canvas border border-border rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-sm transition-shadow">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="body-md-strong font-mono text-ink">{c.case_number}</span>
                  {c.status === 'open' || c.status === 'in_progress' ? (
                     <span className="caption-strong bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                       Active
                     </span>
                  ) : (
                     <span className="caption-strong bg-green-100 text-green-800 px-2 py-1 rounded-full">
                       Closed
                     </span>
                  )}
                </div>
                <p className="body-sm text-body capitalize mb-1">{c.case_type.replace('_', ' ')}</p>
                <p className="caption text-body flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 
                  Submitted {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <Link href={`/dashboard/chat/${c.case_number}`}>
                  <button className="w-full md:w-auto bg-ink text-on-dark body-sm py-2 px-6 rounded-full hover:opacity-90 transition-opacity">
                    Open Secure Chat
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
