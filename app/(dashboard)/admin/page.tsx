import Link from 'next/link'
import { AlertCircle, Clock, UserCheck, CheckCircle2 } from 'lucide-react'
import { getAdminDataAction } from '@/server/actions/admin'
import { incidentTypeLabel } from '@/constants/incident-types'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Active Cases | Admin',
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 caption-strong">
        <AlertCircle className="w-3.5 h-3.5" /> Needs Triage
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 caption-strong">
        <Clock className="w-3.5 h-3.5" /> In Progress
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-800 caption-strong">
      <CheckCircle2 className="w-3.5 h-3.5" /> {status === 'closed' ? 'Closed' : 'Archived'}
    </span>
  )
}

export default async function AdminPage() {
  const result = await getAdminDataAction()
  if ('error' in result) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl body-sm">{result.error}</div>
      </div>
    )
  }
  const activeCases = result.cases
  const caseworkers = result.caseworkers
  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="display-sm text-ink">Active Cases</h1>
          <p className="body-md text-body">Manage and respond to incident reports securely.</p>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
         <div className="bg-canvas border border-border rounded-xl p-4 shadow-sm">
            <p className="caption-uppercase text-body mb-1">Total Cases</p>
            <p className="display-sm text-ink">{result.analytics?.totalCases || 0}</p>
         </div>
         <div className="bg-canvas border border-border rounded-xl p-4 shadow-sm">
            <p className="caption-uppercase text-body mb-1">Open Cases</p>
            <p className="display-sm text-primary">{result.analytics?.openCases || 0}</p>
         </div>
         <div className="bg-canvas border border-border rounded-xl p-4 shadow-sm">
            <p className="caption-uppercase text-body mb-1">Caseworkers</p>
            <p className="display-sm text-ink">{caseworkers.length}</p>
         </div>
      </div>

      <div className="bg-canvas rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-canvas-soft caption-uppercase text-body">
          <div className="col-span-3">Case ID</div>
          <div className="col-span-3">Type & Location</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3">Action</div>
        </div>

        <div className="divide-y divide-border">
          {activeCases.map((c: any) => (
            <div key={c.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-canvas-soft/50 transition-colors">
              <div className="col-span-3">
                <span className="body-sm-strong font-mono">{c.case_number}</span>
                <p className="caption text-body flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="col-span-3">
                <p className="body-sm text-ink capitalize">{incidentTypeLabel(c.case_type)}</p>
                <p className="caption text-body">{c.incident_location || 'No location'}</p>
              </div>
              <div className="col-span-3">
                <StatusBadge status={c.status} />
                {c.assigned_user?.full_name && (
                   <p className="caption text-body mt-1 flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> {c.assigned_user.full_name}
                   </p>
                )}
              </div>
              <div className="col-span-3">
                <Link href={`/admin/cases/${c.case_number}`}>
                  <button className="bg-ink text-on-dark px-4 py-2 rounded-full body-sm hover:opacity-90 transition-opacity">
                    View & Respond
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
