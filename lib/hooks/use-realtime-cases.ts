'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeCases() {
  const [cases, setCases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscription: any

    const fetchAndSubscribe = async () => {
      try {
        // Initial fetch
        const { data, error } = await supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[v0] Fetch cases error:', error)
        } else {
          setCases(data || [])
        }

        // Subscribe to real-time updates
        subscription = supabase
          .channel('public:cases')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'cases',
            },
            (payload: any) => {
              console.log('[v0] Real-time update:', payload)

              if (payload.eventType === 'INSERT') {
                setCases(prev => [payload.new, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setCases(prev =>
                  prev.map(c => (c.id === payload.new.id ? payload.new : c))
                )
              } else if (payload.eventType === 'DELETE') {
                setCases(prev => prev.filter(c => c.id !== payload.old.id))
              }
            }
          )
          .subscribe()
      } catch (error) {
        console.error('[v0] Setup realtime error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAndSubscribe()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [])

  return { cases, loading }
}

export function useRealtimeMessages(caseId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscription: any

    const fetchAndSubscribe = async () => {
      try {
        // Initial fetch
        const { data, error } = await supabase
          .from('case_messages')
          .select('*')
          .eq('case_id', caseId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('[v0] Fetch messages error:', error)
        } else {
          setMessages(data || [])
        }

        // Subscribe to real-time updates
        subscription = supabase
          .channel(`messages:${caseId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'case_messages',
              filter: `case_id=eq.${caseId}`,
            },
            (payload: any) => {
              console.log('[v0] New message:', payload)
              setMessages(prev => [...prev, payload.new])
            }
          )
          .subscribe()
      } catch (error) {
        console.error('[v0] Setup message realtime error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAndSubscribe()

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
      }
    }
  }, [caseId])

  return { messages, loading }
}
