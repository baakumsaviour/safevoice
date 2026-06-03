'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, TrendingUp, MapPin, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'

interface CaseTrend {
  date: string
  count: number
}

interface CaseTypeBreakdown {
  type: string
  count: number
}

interface PriorityDistribution {
  priority: string
  count: number
}

const CASE_TYPE_COLORS: Record<string, string> = {
  sexual_assault: '#ef4444',
  domestic_violence: '#f97316',
  human_trafficking: '#eab308',
  other: '#6366f1',
}

export default function AnalyticsPage() {
  const [trends, setTrends] = useState<CaseTrend[]>([])
  const [caseTypes, setCaseTypes] = useState<CaseTypeBreakdown[]>([])
  const [priorities, setPriorities] = useState<PriorityDistribution[]>([])
  const [stats, setStats] = useState({
    totalCases: 0,
    openCases: 0,
    closedCases: 0,
    urgentCases: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Get all cases
        const { data: casesData, error: casesError } = await supabase
          .from('cases')
          .select('*')

        if (casesError) {
          console.error('[v0] Error fetching cases:', casesError)
          setLoading(false)
          return
        }

        if (!casesData) {
          setLoading(false)
          return
        }

        // Calculate stats
        const totalCases = casesData.length
        const openCases = casesData.filter(c => c.status === 'open' || c.status === 'in_progress').length
        const closedCases = casesData.filter(c => c.status === 'closed').length
        const urgentCases = casesData.filter(c => c.priority === 'urgent').length

        setStats({
          totalCases,
          openCases,
          closedCases,
          urgentCases,
        })

        // Calculate trends (cases per day over last 30 days)
        const last30Days = new Array(30).fill(0).map((_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - (29 - i))
          return date.toISOString().split('T')[0]
        })

        const trendData = last30Days.map(date => {
          const count = casesData.filter(c => c.created_at.startsWith(date)).length
          return { date, count }
        })

        setTrends(trendData)

        // Calculate case type breakdown
        const typeBreakdown: Record<string, number> = {}
        casesData.forEach(c => {
          const type = c.case_type || 'other'
          typeBreakdown[type] = (typeBreakdown[type] || 0) + 1
        })

        setCaseTypes(
          Object.entries(typeBreakdown).map(([type, count]) => ({
            type: type.replace('_', ' '),
            count,
          }))
        )

        // Calculate priority distribution
        const priorityDist: Record<string, number> = {}
        casesData.forEach(c => {
          priorityDist[c.priority] = (priorityDist[c.priority] || 0) + 1
        })

        setPriorities(
          Object.entries(priorityDist).map(([priority, count]) => ({
            priority: priority.charAt(0).toUpperCase() + priority.slice(1),
            count,
          }))
        )
      } catch (err) {
        console.error('[v0] Error fetching analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
            <Link href="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-slate-600 dark:text-slate-400">Loading analytics...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Hub</h1>
                <p className="text-slate-600 dark:text-slate-400">Case insights and trends</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Cases</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalCases}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Open Cases</h3>
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.openCases}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Closed Cases</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.closedCases}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Urgent Cases</h3>
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.urgentCases}</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Case Trends */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Cases Over Time (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  dot={false}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Priority Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Priority Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorities}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {priorities.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#ef4444', '#f97316', '#eab308', '#22c55e'][index % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Case Type Breakdown */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Cases by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={caseTypes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="type" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Geographic Heatmap Note */}
        <Card className="p-6 mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Geographic Heatmap</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Enable location tracking in your Supabase configuration to visualize incident heatmaps. This helps identify high-risk areas and resource allocation.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Integration with Mapbox GL for interactive geographic visualization coming soon.
          </p>
        </Card>
      </div>
    </main>
  )
}
