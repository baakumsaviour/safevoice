'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Minimize2, Send, Bot, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { initializeChatAction, sendChatMessageAction, getCaseMessagesAction } from '@/server/actions/chat'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  text: string
  role: 'victim' | 'caseworker' | 'ai' | 'system'
  timestamp: Date
}

interface FloatingChatWidgetProps {
  isOpen: boolean
  onToggle: () => void
}

export function FloatingChatWidget({ isOpen, onToggle }: FloatingChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Hello. I am the SafeVoice Automated Assistant. You are in a safe, completely secure space. How can we support you today?",
      role: 'ai',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [chatSession, setChatSession] = useState<{ caseId: string; caseNumber: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isAiTyping, isOpen])

  // Restore chat session from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('safevoice_active_chat')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.caseId && parsed.caseNumber) {
          setChatSession(parsed)
          refreshThread(parsed.caseId)
        }
      }
    } catch {
      // ignore
    }
  }, [])

  const lastSeenRef = useRef<string | null>(null)
  const refreshThread = async (caseId: string) => {
    const result = await getCaseMessagesAction(caseId, lastSeenRef.current ?? undefined)
    if ('success' in result && result.messages.length > 0) {
      lastSeenRef.current = result.messages[result.messages.length - 1].created_at
      const fresh: Message[] = result.messages.map((m) => ({
        id: m.id,
        text: m.text,
        role: m.role,
        timestamp: new Date(m.created_at),
      }))

      if (fresh.some((m) => m.role === 'ai' || m.role === 'caseworker')) {
        setIsAiTyping(false)
      }

      setMessages((prev) => {
        const knownIds = new Set(prev.map((m) => m.id))
        const freshTexts = new Set(fresh.map((m) => `${m.role}:${m.text}`))
        const kept = prev.filter(
          (m) => !(m.role === 'victim' && !m.id.includes('-') && freshTexts.has(`victim:${m.text}`))
        )
        return [...kept, ...fresh.filter((m) => !knownIds.has(m.id))]
      })
    }
  }

  // Realtime subscription
  useEffect(() => {
    if (!chatSession?.caseId) return
    const caseId = chatSession.caseId

    refreshThread(caseId)

    const channel = supabase
      .channel(`floating_case_${caseId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'case_messages', filter: `case_id=eq.${caseId}` },
        () => refreshThread(caseId)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatSession?.caseId, supabase])

  // Resilient polling while waiting for AI reply
  useEffect(() => {
    if (!isAiTyping || !chatSession?.caseId) return
    const caseId = chatSession.caseId
    const startTime = Date.now()
    const interval = setInterval(async () => {
      await refreshThread(caseId)
      if (Date.now() - startTime > 15000) {
        setIsAiTyping(false)
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [isAiTyping, chatSession?.caseId])

  const handleSend = async () => {
    if (!input.trim() || isSending) return

    const text = input.trim()
    setInput('')
    setIsSending(true)
    setIsAiTyping(true)

    const tempId = Date.now().toString()
    setMessages((prev) => [...prev, { id: tempId, text, role: 'victim', timestamp: new Date() }])

    try {
      if (!chatSession) {
        const result = await initializeChatAction(text)
        if ('error' in result || !result.caseId) {
          setIsAiTyping(false)
          setMessages((prev) => [
            ...prev,
            {
              id: 'err',
              text: 'Connection error. Please try again or use the full report form.',
              role: 'system',
              timestamp: new Date(),
            },
          ])
        } else {
          setChatSession({ caseId: result.caseId, caseNumber: result.caseNumber })
          try {
            sessionStorage.setItem(
              'safevoice_active_chat',
              JSON.stringify({ caseId: result.caseId, caseNumber: result.caseNumber })
            )
          } catch {
            // ignore
          }
          setMessages((prev) => [
            ...prev,
            {
              id: 'sys1',
              text: `Secure chat connected. Anonymous Case Number: ${result.caseNumber}.`,
              role: 'system',
              timestamp: new Date(),
            },
          ])
          await refreshThread(result.caseId)
        }
      } else {
        const result = await sendChatMessageAction(chatSession.caseId, text)
        if ('error' in result) {
          setIsAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: 'err2', text: 'Failed to send message securely.', role: 'system', timestamp: new Date() },
          ])
        }
      }
    } catch (e) {
      console.error(e)
      setIsAiTyping(false)
    } finally {
      setIsSending(false)
    }
  }

  const handleEmergencyEscape = () => {
    try {
      document.title = 'Google'
      window.history.replaceState(null, '', '/')
      sessionStorage.clear()
    } catch {
      // Best effort
    }
    window.location.replace('https://www.google.com')
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Expanded Chat Window */}
      {isOpen ? (
        <div className="w-[92vw] sm:w-[420px] h-[560px] max-h-[82vh] bg-canvas border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="h-16 bg-canvas-soft border-b border-border px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-canvas rounded-full" />
              </div>
              <div>
                <p className="body-sm-strong text-ink leading-tight flex items-center gap-1.5">
                  <span>SafeVoice Assistant</span>
                </p>
                <p className="caption text-body text-[11px] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> End-to-End Encrypted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleEmergencyEscape}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Quick Escape (wipe session and leave)"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
              <button
                onClick={onToggle}
                className="p-2 text-body hover:text-ink hover:bg-canvas rounded-lg transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-canvas-soft/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.role === 'victim' ? 'ml-auto items-end' : msg.role === 'system' ? 'mx-auto items-center' : 'items-start'
                }`}
              >
                {msg.role !== 'system' && (
                  <div
                    className={`caption text-body mb-1 px-1 flex items-center gap-1 text-[11px] ${
                      msg.role === 'victim' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.role === 'victim' ? (
                      'You'
                    ) : msg.role === 'ai' ? (
                      <span className="flex items-center gap-1">
                        <Bot className="w-3 h-3 text-primary" /> Assistant
                      </span>
                    ) : (
                      'Caseworker'
                    )}
                  </div>
                )}

                <div
                  className={`px-4 py-3 body-sm shadow-xs ${
                    msg.role === 'victim'
                      ? 'bg-ink text-on-dark rounded-2xl rounded-tr-xs'
                      : msg.role === 'system'
                      ? 'bg-primary/10 text-primary border border-primary/20 rounded-xl text-center text-xs'
                      : 'bg-canvas border border-border text-ink rounded-2xl rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex flex-col max-w-[85%] items-start animate-fadeIn">
                <div className="caption text-body mb-1 px-1 flex items-center gap-1.5 text-[11px]">
                  <Bot className="w-3 h-3 text-primary" /> Assistant is typing...
                </div>
                <div className="px-4 py-3 bg-canvas border border-border text-ink rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-canvas border-t border-border shrink-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message safely..."
                disabled={isSending}
                className="flex-1 bg-canvas-soft border border-border rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-[10px] text-body text-center mt-1.5">
              100% Confidential • Anonymous • Press Esc twice to leave
            </p>
          </div>
        </div>
      ) : (
        /* Minimized Floating Action Button */
        <button
          onClick={onToggle}
          className="group bg-primary text-on-primary rounded-full shadow-2xl pl-4 pr-5 py-3.5 flex items-center gap-3 hover:scale-105 transition-all cursor-pointer border-2 border-canvas"
          title="Open SafeVoice AI Chat"
        >
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-primary rounded-full" />
          </div>
          <div className="text-left">
            <span className="body-sm-strong block text-white text-xs sm:text-sm">Need to talk?</span>
            <span className="caption text-white/80 text-[11px] hidden sm:block">SafeVoice AI is here 24/7</span>
          </div>
        </button>
      )}
    </div>
  )
}
