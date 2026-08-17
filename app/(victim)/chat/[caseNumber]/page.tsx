'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Bot, Send, Shield } from 'lucide-react'
import { getCaseDetailsAction, getCaseMessagesAction, sendChatMessageAction, type ChatMessage } from '@/server/actions/chat'
import { createClient } from '@/lib/supabase/client'
import { incidentTypeLabel } from '@/constants/incident-types'

type Message = {
  id: string
  text: string
  role: 'victim' | 'caseworker' | 'ai'
  timestamp: Date
}

function toUiMessage(m: ChatMessage): Message {
  return { id: m.id, text: m.text, role: m.role, timestamp: new Date(m.created_at) }
}

export default function VictimChatPage() {
  const params = useParams()
  const caseNumber = params.caseNumber as string

  const [caseId, setCaseId] = useState<string | null>(null)
  const [caseType, setCaseType] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('open')
  const [messages, setMessages] = useState<Message[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    let cancelled = false
    getCaseDetailsAction(caseNumber).then((res) => {
      if (cancelled) return
      if ('success' in res) {
        setCaseId(res.caseData.id)
        setCaseType(res.caseData.case_type)
        setStatus(res.caseData.status)
        setMessages(res.messages.map(toUiMessage))
      } else {
        setLoadError(res.error)
      }
    })
    return () => {
      cancelled = true
    }
  }, [caseNumber])

  // Realtime: refetch the decrypted thread whenever a new message lands.
  useEffect(() => {
    if (!caseId) return
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
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId, supabase])

  const handleSend = async () => {
    if (!input.trim() || isSending || !caseId) return
    const text = input.trim()
    setInput('')
    setIsSending(true)
    try {
      const result = await sendChatMessageAction(caseId, text)
      if ('error' in result) {
        setInput(text)
      } else {
        setMessages((prev) => (prev.some((m) => m.id === result.message.id) ? prev : [...prev, toUiMessage(result.message)]))
      }
    } finally {
      setIsSending(false)
    }
  }

  if (loadError) {
    return (
      <main className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center gap-4 p-8">
        <p className="body-md text-body">{loadError}</p>
        <Link href="/dashboard" className="text-primary body-sm font-semibold underline">
          Back to My Reports
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-canvas-soft flex flex-col max-w-3xl mx-auto">
      <header className="h-16 bg-canvas border-b border-border px-4 md:px-6 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-mute/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-ink" />
        </Link>
        <div className="min-w-0">
          <p className="body-sm-strong text-ink font-mono truncate">{caseNumber}</p>
          <p className="caption text-body capitalize flex items-center gap-1">
            <Shield className="w-3 h-3 text-primary" /> {incidentTypeLabel(caseType)} • {status.replace('_', ' ')}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {!caseId ? (
          <p className="text-center body-sm text-body py-12">Loading your secure chat...</p>
        ) : messages.length === 0 ? (
          <p className="text-center body-sm text-body py-12">No messages yet. Say hello — a caseworker or our assistant will reply here.</p>
        ) : (
          messages.map((msg) => {
            const isMine = msg.role === 'victim'
            return (
              <div key={msg.id} className={`flex flex-col gap-1 max-w-[85%] ${isMine ? 'items-end ml-auto' : 'items-start'}`}>
                <span className="caption text-body flex items-center gap-1 px-1">
                  {isMine ? 'You' : msg.role === 'ai' ? (
                    <>
                      <Bot className="w-3 h-3" /> SafeVoice Assistant
                    </>
                  ) : (
                    'Caseworker'
                  )}
                </span>
                <div
                  className={`px-4 py-3 rounded-2xl body-sm shadow-sm ${
                    isMine
                      ? 'bg-ink text-on-dark rounded-tr-sm'
                      : msg.role === 'ai'
                        ? 'bg-primary/10 border border-primary/20 text-ink rounded-tl-sm'
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

      <div className="p-4 bg-canvas border-t border-border sticky bottom-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a secure message..."
            disabled={!caseId}
            className="flex-1 bg-canvas-soft border border-border rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 body-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending || !caseId}
            className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  )
}
