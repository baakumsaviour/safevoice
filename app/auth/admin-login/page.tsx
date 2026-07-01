'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, ShieldCheck } from 'lucide-react'

import { loginAction } from '../actions'

export default function AdminLoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const res = await loginAction(formData)
      if (res?.error) {
        setError(res.error)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to log in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-ink py-12 px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-canvas rounded-[12px] p-8 border-2 border-mute/20 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="display-sm text-ink mb-2">Staff Portal</h1>
            <p className="body-md text-body">Secure access for admins & caseworkers</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-[6px] flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="caption text-ink">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block body-sm-strong text-ink mb-2">Staff Email</label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block body-sm-strong text-ink mb-2">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[32px] hover:opacity-90 transition-opacity disabled:opacity-50 mt-6 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 pt-6 border-t border-mute">
            <Link href="/" className="block text-center body-sm text-body hover:text-primary transition-colors">
              Return to Public Portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
