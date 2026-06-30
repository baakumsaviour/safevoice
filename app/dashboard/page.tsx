'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { AlertCircle, Clock, CheckCircle, Archive } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Case {
  id: string
  case_number: string
  status: 'open' | 'in_progress' | 'closed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  incident_date: string | null
  case_type: string | null
  created_at: string
  assigned_to: string | null
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'urgent'>('open')

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          window.location.href = '/auth/login'
          return
        }

        let query = supabase
          .from('cases')
          .select('*')
          .order('created_at', { ascending: false })

        if (filter === 'open') {
          query = query.in('status', ['open', 'in_progress'])
        } else if (filter === 'urgent') {
          query = query.eq('priority', 'urgent')
        }

        const { data, error } = await query

        if (error) {
          console.error('[v0] Fetch cases error:', error)
        } else {
          setCases(data || [])
        }
      } catch (err) {
        console.error('[v0] Error fetching cases:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCases()
  }, [filter])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-primary/20 text-primary'
      case 'high': return 'bg-primary/15 text-primary'
      case 'medium': return 'bg-mute/30 text-body'
      default: return 'bg-canvas-soft text-body'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'closed': return <CheckCircle className="w-4 h-4" />
      case 'archived': return <Archive className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="flex h-screen bg-canvas">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-mute bg-canvas sticky top-0 z-40">
          <div className="px-8 py-6">
            <h1 className="display-md text-ink mb-2">Triage Queue</h1>
            <p className="body-md text-body">Manage and prioritize incoming cases</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Filters */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`body-sm-strong py-2 px-6 rounded-[32px] transition-all ${
                filter === 'all' 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-canvas-soft text-ink border-2 border-ink/20 hover:border-primary'
              }`}
            >
              All Cases
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`body-sm-strong py-2 px-6 rounded-[32px] transition-all ${
                filter === 'open' 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-canvas-soft text-ink border-2 border-ink/20 hover:border-primary'
              }`}
            >
              Open & In Progress
            </button>
            <button
              onClick={() => setFilter('urgent')}
              className={`body-sm-strong py-2 px-6 rounded-[32px] transition-all ${
                filter === 'urgent' 
                  ? 'bg-primary text-on-primary' 
                  : 'bg-canvas-soft text-ink border-2 border-ink/20 hover:border-primary'
              }`}
            >
              Urgent Only
            </button>
          </div>

          {/* Cases List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="body-md text-body">Loading cases...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-canvas-soft rounded-[6px] p-12 text-center border-2 border-mute/20">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="body-md-strong text-ink">No cases to review</p>
              <p className="body-md text-body">All cases are handled or archived</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((case_) => (
                <Link key={case_.id} href={`/dashboard/case/${case_.id}`}>
                  <div className="bg-canvas rounded-[6px] p-6 hover:border-primary border-2 border-ink/10 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="body-md-strong text-ink">{case_.case_number}</h3>
                          <span className={`caption-strong py-1 px-3 rounded-[32px] ${getPriorityColor(case_.priority)}`}>
                            {case_.priority.charAt(0).toUpperCase() + case_.priority.slice(1)}
                          </span>
                          <span className="caption-strong py-1 px-3 rounded-[32px] bg-canvas-soft text-body flex items-center gap-1">
                            {getStatusIcon(case_.status)}
                            {case_.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-6 text-sm">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Case Type</p>
                            <p className="font-medium text-slate-900 dark:text-white">{case_.case_type || 'Not specified'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Incident Date</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {case_.incident_date ? new Date(case_.incident_date).toLocaleDateString() : 'Not provided'}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Assigned To</p>
                            <p className="font-medium text-slate-900 dark:text-white">{case_.assigned_to ? 'Yes' : 'Unassigned'}</p>
                          </div>
                        </div>
                      </div>
                      <button className="ml-4 border-2 border-ink text-ink body-sm font-normal py-2 px-4 rounded-[32px] hover:bg-ink/5 transition-colors">
                        Review
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
