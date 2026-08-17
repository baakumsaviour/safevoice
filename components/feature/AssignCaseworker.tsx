'use client'

import { useState } from 'react'
import { assignCaseAction } from '@/server/actions/admin'
import { UserPlus } from 'lucide-react'

export function AssignCaseworker({ caseId, caseworkers, currentAssignee }: { caseId: string, caseworkers: { id: string; full_name: string | null }[], currentAssignee?: string | null }) {
  const [loading, setLoading] = useState(false)

  const handleAssign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cwId = e.target.value
    if (!cwId) return
    
    setLoading(true)
    const res = await assignCaseAction(caseId, cwId)
    if (!('error' in res)) {
       window.location.reload()
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <UserPlus className="w-4 h-4 text-mute" />
      <select 
        disabled={loading}
        value={currentAssignee || ''}
        onChange={handleAssign}
        className="bg-canvas border border-border text-ink body-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
      >
        <option value="">Assign Caseworker...</option>
        {caseworkers.map(cw => (
          <option key={cw.id} value={cw.id}>{cw.full_name}</option>
        ))}
      </select>
    </div>
  )
}
