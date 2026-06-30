'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Shield, Send, AlertCircle, FileText, CheckCircle, Bot } from 'lucide-react'
import { initializeChatAction, sendChatMessageAction } from '@/server/actions/chat'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  text: string
  role: 'victim' | 'caseworker' | 'system'
  isAI?: boolean
  timestamp: Date
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: "Hello. I am the SafeVoice Automated Assistant. You are in a safe, secure space. How can we help you today?", role: 'caseworker', isAI: true, timestamp: new Date() }
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  
  // Chat Session State
  const [chatSession, setChatSession] = useState<{caseId: string, caseNumber: string, userId: string} | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Listen to realtime messages once session starts
  useEffect(() => {
    if (!chatSession?.caseId) return

    const channel = supabase.channel(`case_${chatSession.caseId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'case_messages',
        filter: `case_id=eq.${chatSession.caseId}`
      }, (payload) => {
        // Only append if it's from the caseworker (to avoid duplicating our own optimistic updates)
        if (payload.new.sender_role === 'caseworker') {
          // Decode pseudo-encryption
          const decoded = Buffer.from(payload.new.message_encrypted, 'base64').toString('utf8')
          const isAI = decoded.startsWith('[AI] ')
          const cleanText = isAI ? decoded.replace('[AI] ', '') : decoded

          setMessages(prev => [...prev, {
            id: payload.new.id,
            text: cleanText,
            role: 'caseworker',
            isAI: isAI,
            timestamp: new Date(payload.new.created_at)
          }])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatSession?.caseId, supabase])

  const handleSend = async () => {
    if (!input.trim() || isSending) return

    const text = input.trim()
    setInput('')
    setIsSending(true)

    // Optimistic UI update
    const tempId = Date.now().toString()
    setMessages(prev => [...prev, { id: tempId, text, role: 'victim', timestamp: new Date() }])

    try {
      if (!chatSession) {
        // Initialize chat (Creates User & Case)
        const result = await initializeChatAction(text)
        if (result.error || !result.caseId) {
          setMessages(prev => [...prev, { id: 'err', text: "Connection error. Please use the Report Form button instead.", role: 'system', timestamp: new Date() }])
        } else {
          setChatSession({ caseId: result.caseId, caseNumber: result.caseNumber!, userId: result.userId! })
          setMessages(prev => [...prev, { id: 'sys1', text: `Secure chat established. Your anonymous Case Number is ${result.caseNumber}. Please save this.`, role: 'system', timestamp: new Date() }])
        }
      } else {
        // Send to existing chat
        const result = await sendChatMessageAction(chatSession.caseId, chatSession.userId, text, 'victim')
        if (result.error) {
          setMessages(prev => [...prev, { id: 'err2', text: "Failed to send message securely.", role: 'system', timestamp: new Date() }])
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-canvas flex flex-col md:flex-row overflow-hidden">
      
      {/* Left Sidebar: Instructions & Context */}
      <section className="w-full md:w-1/3 lg:w-[400px] bg-ink text-on-dark flex flex-col justify-between p-8 shrink-0 md:h-screen md:overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-on-primary font-black text-lg">"</span>
            </div>
            <span className="body-md-strong text-white">SafeVoice</span>
          </div>

          <h1 className="display-xs mb-6 text-balance text-white">
            You are not alone. Let's talk safely.
          </h1>

          <div className="space-y-6 mb-12">
            <div className="flex gap-4">
              <Shield className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h3 className="body-sm-strong mb-1">100% Confidential</h3>
                <p className="caption text-on-dark/70 text-balance">This chat is end-to-end encrypted. Your identity is strictly anonymous unless you choose to share it.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-primary shrink-0" />
              <div>
                <h3 className="body-sm-strong mb-1">Immediate Support</h3>
                <p className="caption text-on-dark/70 text-balance">Type your message on the right to instantly connect with a trauma-informed expert or our automated assistant.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-8">
            <h3 className="body-sm-strong mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Prefer to submit a formal report?
            </h3>
            <p className="caption text-on-dark/70 mb-4">
              If you have photos, evidence, or want to write a detailed offline report, use our secure form.
            </p>
            <Link href="/report">
              <button className="w-full bg-white/10 text-white body-sm py-2.5 rounded-full hover:bg-white/20 transition-colors">
                Open Report Form
              </button>
            </Link>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center">
          <p className="caption text-on-dark/50">
            Press ESC twice to quickly exit this page.
          </p>
        </div>
      </section>

      {/* Right Side: Real-time Chat */}
      <section className="flex-1 bg-canvas-soft flex flex-col h-[calc(100vh-64px)] md:h-screen relative">
        <div className="h-16 border-b border-border bg-canvas px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-canvas rounded-full" />
            </div>
            <div>
              <p className="body-sm-strong text-ink">Caseworker Support</p>
              <p className="caption text-body flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" /> Secure Connection
              </p>
            </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="text-center mb-8">
            <span className="caption-uppercase bg-canvas border border-border px-4 py-1.5 rounded-full text-body">
              Chat Started Safely
            </span>
          </div>

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] md:max-w-[70%] ${
                msg.role === 'victim' ? 'ml-auto items-end' : 
                msg.role === 'system' ? 'mx-auto items-center' : 'items-start'
              }`}
            >
              {msg.role !== 'system' && (
                <div className={`caption text-body mb-1 px-1 flex items-center gap-1 ${msg.role === 'victim' ? 'text-right' : 'text-left'}`}>
                  {msg.role === 'victim' ? 'You' : msg.isAI ? <><Bot className="w-3 h-3"/> SafeVoice Assistant</> : 'Expert'}
                </div>
              )}
              
              <div className={`px-5 py-3.5 body-sm shadow-sm ${
                msg.role === 'victim' 
                  ? 'bg-ink text-on-dark rounded-2xl rounded-tr-sm' 
                  : msg.role === 'system'
                  ? 'bg-primary/10 text-primary border border-primary/20 rounded-xl text-center text-xs'
                  : 'bg-canvas border border-border text-ink rounded-2xl rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-canvas border-t border-border">
          <div className="max-w-4xl mx-auto flex gap-3 relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here safely..." 
              className="flex-1 bg-canvas-soft border border-border rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 body-md shadow-sm"
              disabled={isSending}
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-mute"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </section>
      
    </main>
  )
}
