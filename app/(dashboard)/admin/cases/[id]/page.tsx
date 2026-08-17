'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, Send, Shield, FileText, Bot } from 'lucide-react'
import { getCaseDetailsAction, getCaseMessagesAction, sendChatMessageAction, type ChatMessage } from '@/server/actions/chat'
import { getAdminDataAction } from '@/server/actions/admin'
import { createClient } from '@/lib/supabase/client'
import { AssignCaseworker } from '@/components/feature/AssignCaseworker'
import { incidentTypeLabel } from '@/constants/incident-types'

type Message = {
  id: string
  text: string
  role: 'victim' | 'caseworker' | 'ai'
  timestamp: Date
}

type CaseView = {
  id: string
  case_number: string
  case_type: string | null
  status: string
  ai_active: boolean
  assigned_to: string | null
  incident_location: string | null
  narrative: string
}

function toUiMessage(m: ChatMessage): Message {
  return { id: m.id, text: m.text, role: m.role, timestamp: new Date(m.created_at) }
}

export default function CaseDetailsPage() {
  const params = useParams()
  const caseNumber = params.id as string

  const [caseData, setCaseData] = useState<CaseView | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [caseworkers, setCaseworkers] = useState<{ id: string; full_name: string | null }[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial load
  useEffect(() => {
    let cancelled = false
    Promise.all([getCaseDetailsAction(caseNumber), getAdminDataAction()]).then(([res, adminRes]) => {
      if (cancelled) return
      if ('success' in adminRes && adminRes.caseworkers) {
        setCaseworkers(adminRes.caseworkers)
      }
      if ('success' in res) {
        setCaseData(res.caseData as CaseView)
        setMessages(res.messages.map(toUiMessage))
      } else {
        setLoadError(res.error)
      }
    })
    return () => {
      cancelled = true
    }
  }, [caseNumber])

  // Realtime: payloads are encrypted at rest, so events are used as a signal
  // to refetch the decrypted thread from the server.
  useEffect(() => {
    if (!caseData?.id) return
    const caseId = caseData.id

    const refresh = async () => {
      const result = await getCaseMessagesAction(caseId)
      if ('success' in result) setMessages(result.messages.map(toUiMessage))
    }

    const channel = supabase
      .channel(`case_${caseId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'case_messages', filter: `case_id=eq.${caseId}` },
        refresh
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'cases', filter: `id=eq.${caseId}` },
        (payload) => {
          setCaseData((prev) => (prev ? { ...prev, ai_active: (payload.new as { ai_active: boolean }).ai_active } : prev))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseData?.id, supabase])

  const handleSend = async () => {
    if (!input.trim() || isSending || !caseData) return

    const text = input.trim()
    setInput('')
    setIsSending(true)

    try {
      const result = await sendChatMessageAction(caseData.id, text)
      if ('error' in result) {
        setInput(text)
      } else {
        setCaseData((prev) => (prev ? { ...prev, ai_active: false } : prev))
        setMessages((prev) => (prev.some((m) => m.id === result.message.id) ? prev : [...prev, toUiMessage(result.message)]))
      }
    } finally {
      setIsSending(false)
    }
  }

  if (loadError) {
    return <div className="p-8 h-screen flex items-center justify-center body-md text-mute">{loadError}</div>
  }
  if (!caseData) {
    return <div className="p-8 h-screen flex items-center justify-center body-md text-mute">Loading secure case details...</div>
  }

  return (
    <div className="p-8 h-screen flex flex-col">
      <header className="mb-6 flex items-center gap-4">
        <Link href="/admin" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-mute/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-ink" />
        </Link>
        <div>
          <h1 className="display-xs text-ink font-mono">{caseNumber}</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="body-sm text-body capitalize">
              {incidentTypeLabel(caseData.case_type)} • Status: {caseData.status}
            </p>
            <AssignCaseworker caseId={caseData.id} caseworkers={caseworkers} currentAssignee={caseData.assigned_to} />
          </div>
        </div>
      </header>

      <div className="flex-1 grid md:grid-cols-3 gap-6 min-h-0">
        {/* Left Column: Details & Evidence */}
        <div className="col-span-1 bg-canvas rounded-2xl border border-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border bg-canvas-soft">
            <h2 className="body-md-strong text-ink flex items-center gap-2">
              <FileText className="w-4 h-4" /> Case Details
            </h2>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div>
              <p className="caption-uppercase text-body mb-2">Narrative</p>
              <div className="bg-canvas-soft p-4 rounded-xl border border-border">
                <p className="body-sm text-ink font-serif italic">&quot;{caseData.narrative}&quot;</p>
              </div>
            </div>

            {caseData.incident_location && (
              <div>
                <p className="caption-uppercase text-body mb-2">Location</p>
                <p className="body-sm text-ink">{caseData.incident_location}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Secure Chat */}
        <div className="col-span-2 bg-canvas rounded-2xl border border-border overflow-hidden flex flex-col relative">
          <div className="p-4 border-b border-border bg-canvas-soft flex items-center justify-between">
            <h2 className="body-md-strong text-ink flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" /> Secure Chat
            </h2>
            <div className="flex items-center gap-3">
              {caseData.ai_active ? (
                <span className="caption text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 flex items-center gap-1">
                  <Bot className="w-3 h-3" /> AI Active
                </span>
              ) : (
                <span className="caption text-body bg-canvas px-3 py-1 rounded-full border border-border">
                  Human Assigned
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/50">
            {messages.length === 0 ? (
              <div className="flex justify-center mb-8">
                <span className="caption text-body bg-canvas border border-border px-3 py-1 rounded-full">Waiting for messages...</span>
              </div>
            ) : (
              messages.map((msg) => {
                const isStaffSide = msg.role !== 'victim'
                return (
                  <div key={msg.id} className={`flex flex-col gap-1 max-w-[80%] ${isStaffSide ? 'items-end ml-auto' : 'items-start'}`}>
                    <span className={`caption text-body flex items-center gap-1 ${isStaffSide ? 'mr-2' : 'ml-2'}`}>
                      {msg.role === 'ai' ? (
                        <>
                          <Bot className="w-3 h-3" /> AI Assistant
                        </>
                      ) : msg.role === 'caseworker' ? (
                        'Caseworker'
                      ) : (
                        'Victim'
                      )}
                    </span>
                    <div
                      className={`px-4 py-3 rounded-2xl body-sm shadow-sm ${
                        msg.role === 'ai'
                          ? 'bg-primary/10 border border-primary/20 text-ink rounded-tr-sm'
                          : msg.role === 'caseworker'
                            ? 'bg-ink text-on-dark rounded-tr-sm'
                            : 'bg-canvas border border-border text-ink rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-canvas border-t border-border">
            {caseData.ai_active && (
              <div className="mb-2 text-center">
                <span className="caption text-body">Sending a message will permanently turn off the AI for this case.</span>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a secure message..."
                className="flex-1 bg-canvas-soft border border-border rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 body-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
