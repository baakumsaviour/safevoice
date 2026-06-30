import Link from 'next/link'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

// Mock Data
const activeCases = [
  { id: 'CAS-A1B2C3', type: 'General Abuse', status: 'new', time: '10 mins ago', location: 'Accra' },
  { id: 'CAS-X9Y8Z7', type: 'Domestic Violence', status: 'in_progress', time: '2 hours ago', location: 'Kumasi' },
]

export const metadata = {
  title: 'Active Cases | Caseworker',
}

export default function CaseworkerPage() {
  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="display-sm text-ink">Active Cases</h1>
          <p className="body-md text-body">Manage and respond to incident reports securely.</p>
        </div>
      </header>

      <div className="bg-canvas rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-canvas-soft caption-uppercase text-body">
          <div className="col-span-3">Case ID</div>
          <div className="col-span-3">Type & Location</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-3">Action</div>
        </div>

        <div className="divide-y divide-border">
          {activeCases.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-canvas-soft/50 transition-colors">
              <div className="col-span-3">
                <span className="body-sm-strong font-mono">{c.id}</span>
                <p className="caption text-body flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> {c.time}
                </p>
              </div>
              <div className="col-span-3">
                <p className="body-sm text-ink">{c.type}</p>
                <p className="caption text-body">{c.location}</p>
              </div>
              <div className="col-span-3">
                {c.status === 'new' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 caption-strong">
                    <AlertCircle className="w-3.5 h-3.5" /> Needs Triage
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800 caption-strong">
                    <Clock className="w-3.5 h-3.5" /> In Progress
                  </span>
                )}
              </div>
              <div className="col-span-3">
                <Link href={`/caseworker/cases/${c.id}`}>
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
