'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Download, Lock, Send } from 'lucide-react'
import { getCaseDetails, addCaseMessage, updateCaseStatus } from '@/lib/actions/cases'
import { decryptData } from '@/lib/encryption'

interface CaseDetail {
  id: string
  case_number: string
  status: string
  priority: string
  incident_date: string | null
  incident_location: string | null
  narrative_encrypted: string | null
  case_type: string | null
  assigned_to: string | null
  created_at: string
  case_messages: any[]
  evidence: any[]
}

export default function CasePage() {
  const params = useParams()
  const caseId = params.id as string
  const [case_, setCase] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const result = await getCaseDetails(caseId)
        if (result.success) {
          setCase(result.data)
        }
      } catch (err) {
        console.error('[v0] Error fetching case:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCase()
  }, [caseId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      const result = await addCaseMessage(caseId, newMessage, 'caseworker')
      if (result.success) {
        setNewMessage('')
        // Refresh case details to show new message
        const refreshResult = await getCaseDetails(caseId)
        if (refreshResult.success) {
          setCase(refreshResult.data)
        }
      }
    } catch (err) {
      console.error('[v0] Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      const result = await updateCaseStatus(caseId, newStatus as any)
      if (result.success && case_) {
        setCase({ ...case_, status: newStatus })
      }
    } catch (err) {
      console.error('[v0] Error updating case status:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-400">Loading case...</p>
        </main>
      </div>
    )
  }

  if (!case_) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-600 dark:text-slate-400">Case not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
          <div className="px-8 py-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{case_.case_number}</h1>
              <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                {case_.status.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Reported on {new Date(case_.created_at).toLocaleDateString()}
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Case Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Case Information</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Case Type</p>
                  <p className="font-medium text-slate-900 dark:text-white">{case_.case_type || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Priority</p>
                  <p className="font-medium text-slate-900 dark:text-white capitalize">{case_.priority}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Incident Date</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {case_.incident_date ? new Date(case_.incident_date).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Location</p>
                  <p className="font-medium text-slate-900 dark:text-white">{case_.incident_location || 'Not provided'}</p>
                </div>
              </div>
            </Card>

            {/* Narrative */}
            {case_.narrative_encrypted && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-blue-600" />
                  Victim Narrative (Encrypted)
                </h2>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                  {case_.narrative_encrypted}
                </p>
              </Card>
            )}

            {/* Evidence */}
            {case_.evidence && case_.evidence.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Evidence</h2>
                <div className="space-y-3">
                  {case_.evidence.map((file: any) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{file.file_name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {(file.file_size / 1024 / 1024).toFixed(2)} MB · Uploaded {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Messages */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Secure Messaging</h2>
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {case_.case_messages && case_.case_messages.length > 0 ? (
                  case_.case_messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-lg ${
                        msg.sender_role === 'caseworker'
                          ? 'bg-blue-50 dark:bg-blue-900/20 ml-4'
                          : 'bg-slate-100 dark:bg-slate-800 mr-4'
                      }`}
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {msg.sender_role} · {new Date(msg.created_at).toLocaleString()}
                      </p>
                      <p className="text-slate-900 dark:text-white">[Encrypted Message]</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No messages yet</p>
                )}
              </div>
              <div className="flex gap-3">
                <Textarea
                  placeholder="Send a secure message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Case Status</h3>
              <div className="space-y-2">
                {['open', 'in_progress', 'closed', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      case_.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                  </button>
                ))}
              </div>
            </Card>

            {/* Audit Log */}
            <Card className="p-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-slate-500 dark:text-slate-400">Case created</p>
                  <p className="text-slate-900 dark:text-white">{new Date(case_.created_at).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
