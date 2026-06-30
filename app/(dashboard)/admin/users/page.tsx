'use client'

import { useState } from 'react'
import { inviteCaseworkerAction } from '@/server/actions/admin'
import { Users, Mail, UserPlus } from 'lucide-react'

export default function UsersPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const formData = new FormData()
    formData.append('email', email)
    formData.append('name', name)
    
    const res = await inviteCaseworkerAction(formData)
    if (res.error) setMsg(res.error)
    else {
      setMsg('Invitation sent successfully!')
      setEmail('')
      setName('')
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="display-sm text-ink flex items-center gap-2">
            <Users className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="body-md text-body">Manage caseworkers and system access.</p>
        </div>
      </header>

      <div className="bg-canvas rounded-2xl border border-border p-8 max-w-2xl">
        <h2 className="body-lg-strong mb-6 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-ink" /> Invite Caseworker
        </h2>
        
        {msg && (
          <div className={`mb-6 p-4 rounded-lg body-sm ${msg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block body-sm-strong mb-2">Full Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full bg-canvas-soft border border-border px-4 py-3 rounded-lg body-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
            />
          </div>
          <div>
            <label className="block body-sm-strong mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-canvas-soft border border-border px-4 py-3 rounded-lg body-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-on-primary px-6 py-3 rounded-full body-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {loading ? 'Sending...' : 'Send Invitation'}
          </button>
        </form>
      </div>
    </div>
  )
}
