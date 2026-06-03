'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardSidebar } from '@/components/dashboard-sidebar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
      case 'urgent': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
      default: return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar />
      
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
          <div className="px-8 py-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Triage Queue</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage and prioritize incoming cases</p>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Filters */}
          <div className="flex gap-2 mb-8">
            <Button
              onClick={() => setFilter('all')}
              variant={filter === 'all' ? 'default' : 'outline'}
              className={filter === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              All Cases
            </Button>
            <Button
              onClick={() => setFilter('open')}
              variant={filter === 'open' ? 'default' : 'outline'}
              className={filter === 'open' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Open & In Progress
            </Button>
            <Button
              onClick={() => setFilter('urgent')}
              variant={filter === 'urgent' ? 'default' : 'outline'}
              className={filter === 'urgent' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Urgent Only
            </Button>
          </div>

          {/* Cases List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">Loading cases...</p>
            </div>
          ) : cases.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-slate-900 dark:text-white">No cases to review</p>
              <p className="text-slate-600 dark:text-slate-400">All cases are handled or archived</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {cases.map((case_) => (
                <Link key={case_.id} href={`/dashboard/case/${case_.id}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{case_.case_number}</h3>
                          <Badge className={getPriorityColor(case_.priority)}>
                            {case_.priority.charAt(0).toUpperCase() + case_.priority.slice(1)}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getStatusIcon(case_.status)}
                            {case_.status.replace('_', ' ')}
                          </Badge>
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
                      <Button variant="outline" className="ml-4">
                        Review
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
