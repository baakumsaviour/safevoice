'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { ArrowLeft, Send, Shield, FileText, Bot } from 'lucide-react'
import { getCaseDetailsAction, sendChatMessageAction } from '@/server/actions/chat'
import { getAdminDataAction } from '@/server/actions/admin'
import { createClient } from '@/lib/supabase/client'
import { AssignCaseworker } from '@/components/feature/AssignCaseworker'

type Message = {
  id: string
  text: string
  role: 'victim' | 'caseworker'
  isAI?: boolean
  timestamp: Date
}

export default function CaseDetailsPage() {
  const params = useParams()
  const caseId = params.id as string

  const [caseData, setCaseData] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [caseworkers, setCaseworkers] = useState<any[]>([])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Fetch initial case data and messages
    Promise.all([getCaseDetailsAction(caseId), getAdminDataAction()]).then(([res, adminRes]) => {
      if (adminRes.success) {
         setCaseworkers(adminRes.caseworkers || [])
      }
      
      if (res.success) {
        setCaseData(res.caseData)
        
        // Map messages
        const mappedMessages = res.messages.map((m: any) => {
          const decoded = Buffer.from(m.message_encrypted, 'base64').toString('utf8')
          const isAI = decoded.startsWith('[AI] ')
          return {
            id: m.id,
            text: isAI ? decoded.replace('[AI] ', '') : decoded,
            role: m.sender_role,
            isAI,
            timestamp: new Date(m.created_at)
          }
        })
        setMessages(mappedMessages)

        // Subscribe to real-time messages
        const channel = supabase.channel(`case_${res.caseData.id}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'case_messages',
            filter: `case_id=eq.${res.caseData.id}`
          }, (payload) => {
            // Only append victim messages or AI messages from server
            if (payload.new.sender_role === 'victim' || payload.new.sender_role === 'caseworker') {
              const decoded = Buffer.from(payload.new.message_encrypted, 'base64').toString('utf8')
              const isAI = decoded.startsWith('[AI] ')
              
              // Prevent duplicating optimistic UI messages (human caseworker)
              if (payload.new.sender_role === 'caseworker' && !isAI) return

              setMessages(prev => [...prev, {
                id: payload.new.id,
                text: isAI ? decoded.replace('[AI] ', '') : decoded,
                role: payload.new.sender_role,
                isAI,
                timestamp: new Date(payload.new.created_at)
              }])
            }
          })
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'cases',
            filter: `id=eq.${res.caseData.id}`
          }, (payload) => {
             setCaseData((prev: any) => ({ ...prev, ai_active: payload.new.ai_active }))
          })
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      }
    })
  }, [caseId])

  const handleSend = async () => {
    if (!input.trim() || isSending || !caseData) return

    const text = input.trim()
    setInput('')
    setIsSending(true)

    const tempId = Date.now().toString()
    setMessages(prev => [...prev, { id: tempId, text, role: 'caseworker', timestamp: new Date() }])
    
    // Optimistically update AI status
    setCaseData((prev: any) => ({ ...prev, ai_active: false }))

    // For MVP, we simulate caseworker ID since auth is bypassed
    const mockCaseworkerId = caseData.created_by_user_id 

    await sendChatMessageAction(caseData.id, mockCaseworkerId, text, 'caseworker')
    setIsSending(false)
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
          <h1 className="display-xs text-ink font-mono">{caseId}</h1>
          <div className="flex items-center gap-4 mt-1">
             <p className="body-sm text-body capitalize">{caseData.case_type.replace('_', ' ')} • Status: {caseData.status}</p>
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
                <p className="body-sm text-ink font-serif italic">
                  "{Buffer.from(caseData.narrative_encrypted, 'base64').toString('utf8')}"
                </p>
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
              messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col gap-1 items-${msg.role === 'caseworker' ? 'end ml-auto' : 'start'} max-w-[80%]`}>
                  <span className={`caption text-body flex items-center gap-1 ${msg.role === 'caseworker' ? 'mr-2' : 'ml-2'}`}>
                    {msg.role === 'caseworker' 
                      ? (msg.isAI ? <><Bot className="w-3 h-3"/> AI Assistant</> : 'You (Caseworker)') 
                      : 'Victim'}
                  </span>
                  <div className={`px-4 py-3 rounded-2xl body-sm shadow-sm ${
                    msg.role === 'caseworker' 
                      ? msg.isAI 
                        ? 'bg-primary/10 border border-primary/20 text-ink rounded-tr-sm' 
                        : 'bg-ink text-on-dark rounded-tr-sm' 
                      : 'bg-canvas border border-border text-ink rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
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
