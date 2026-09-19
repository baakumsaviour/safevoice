'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { AlertCircle, ShieldCheck, ArrowRight, Shield } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { loginAction } from '../actions'

function AdminLoginForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (urlError === 'unauthorized') {
      setError('Restricted area. You must be signed in with an authorized caseworker or administrator account to access cases.')
    } else if (urlError === 'account-setup') {
      setError('Staff account setup incomplete. Please contact your system administrator.')
    }
  }, [urlError])

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
    <div className="bg-canvas rounded-[16px] p-8 border border-border shadow-2xl">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h1 className="display-sm text-ink mb-1">Staff Portal</h1>
        <p className="body-sm text-body">Restricted access for DOVVSU officers & caseworkers</p>
      </div>

      {/* Citizen Notice */}
      <div className="mb-6 p-4 bg-canvas-soft border border-border rounded-xl text-left">
        <p className="caption-strong text-ink flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" />
          Not a caseworker or police officer?
        </p>
        <p className="caption text-body mt-1">
          Citizens and survivors do not need to log in. You can report incidents and reach help completely anonymously.
        </p>
        <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1">
          <Link href="/report" className="caption text-primary hover:underline font-medium inline-flex items-center gap-1">
            Submit an anonymous report <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="caption text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <input type="hidden" name="portal" value="staff" />
        <div>
          <label className="block body-sm-strong text-ink mb-2">Official Staff Email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="officer@dovvsu.gov.gh"
            className="w-full px-4 py-3 border border-border rounded-xl bg-canvas text-ink body-sm placeholder-body focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block body-sm-strong text-ink mb-2">Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 border border-border rounded-xl bg-canvas text-ink body-sm placeholder-body focus:border-primary focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary body-md font-semibold py-3 px-8 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loading ? 'Verifying Credentials...' : 'Sign In as Staff'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-body">
        <Link href="/" className="hover:text-primary transition-colors">
          ← Return to SafeVoice Home
        </Link>
        <Link href="/auth/login" className="hover:text-primary transition-colors">
          Citizen Sign In
        </Link>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-ink py-12 px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="bg-canvas rounded-[16px] p-8 text-center text-body">Loading portal...</div>}>
          <AdminLoginForm />
        </Suspense>
      </div>
    </main>
  )
}
