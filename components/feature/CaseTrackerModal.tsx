'use client'

import { useState } from 'react'
import { X, Search, ShieldCheck, Clock, MapPin, Tag, AlertCircle } from 'lucide-react'
import { lookupAnonymousCaseAction } from '@/server/actions/victim'

interface CaseTrackerModalProps {
  isOpen: boolean
  onClose: () => void
}

type CaseStatusResult = {
  caseNumber: string
  status: string
  priority: string
  caseType: string
  location: string | null
  date: string | null
  createdAt: string
}

export function CaseTrackerModal({ isOpen, onClose }: CaseTrackerModalProps) {
  const [caseCode, setCaseCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CaseStatusResult | null>(null)

  if (!isOpen) return null

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseCode.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await lookupAnonymousCaseAction(caseCode.trim())
      if ('error' in res) {
        setError(res.error ?? 'An unexpected error occurred.')
      } else if (res.success && res.caseData) {
        setResult(res.caseData)
      }
    } catch {
      setError('Connection failed. Please check your network and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'resolved':
      case 'closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-canvas w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between bg-canvas-soft shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="body-md-strong text-ink">Check Case Status</h3>
              <p className="caption text-body">100% Anonymous status tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-body hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="body-sm text-body">
            Enter the 12-character Reference Code given to you when you submitted your report (e.g.{' '}
            <code className="text-ink font-mono font-semibold bg-canvas-soft px-2 py-0.5 rounded">SV-XXXX-XXXX</code>).
          </p>

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={caseCode}
                onChange={(e) => setCaseCode(e.target.value.toUpperCase())}
                placeholder="e.g. SV-U5S6-PPBA"
                className="flex-1 bg-canvas-soft border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink font-mono body-sm uppercase"
                maxLength={20}
              />
              <button
                type="submit"
                disabled={loading || !caseCode.trim()}
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold body-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shrink-0"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <p>{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-canvas-soft border border-border rounded-2xl p-5 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="caption-strong text-body uppercase tracking-wider">Case Code</span>
                <code className="body-md-strong text-ink font-mono">{result.caseNumber}</code>
              </div>

              <div className="flex items-center justify-between">
                <span className="caption-strong text-body uppercase tracking-wider">Status</span>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${getStatusColor(
                    result.status
                  )}`}
                >
                  {result.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-body">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="capitalize">{result.caseType.replace(/_/g, ' ')}</span>
                </div>
                {result.location && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{result.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 col-span-2">
                  <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Submitted: {new Date(result.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center gap-2 text-xs text-body">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Encrypted & confidential. Only assigned caseworkers can view your full report.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
