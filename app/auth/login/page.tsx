'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, Shield, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { loginAction } from '../actions'

function LoginForm() {
  const searchParams = useSearchParams()
  const defaultEmail = searchParams.get('email') || ''

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
    <div className="bg-canvas rounded-[12px] p-8 border-2 border-mute/20">
      {/* Header */}
      <div className="mb-6 text-center">
        <Link href="/">
          <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto mb-4 cursor-pointer">
            <Image src="/safevoice logo.png" alt="SafeVoice Logo" width={32} height={32} className="object-contain" />
          </div>
        </Link>
        <h1 className="display-sm text-ink mb-2">Sign in</h1>
        <p className="body-md text-body">Access your citizen account</p>
      </div>

      {/* Survivor Anonymity Reminder */}
      <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-left">
        <p className="caption-strong text-ink flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" />
          Reporting does not require an account
        </p>
        <p className="caption text-body mt-1">
          SafeVoice protects your privacy. You can file a report immediately without creating an account or logging in.
        </p>
        <Link href="/report" className="caption text-primary hover:underline font-medium mt-2 inline-flex items-center gap-1">
          Submit an anonymous report instead <ArrowRight className="w-3 h-3" />
        </Link>
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
          <label className="block body-sm-strong text-ink mb-2">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={defaultEmail}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
          />
        </div>

        <div>
          <label className="block body-sm-strong text-ink mb-2">Password</label>
          <input
            type="password"
            name="password"
            required
            placeholder="Your password"
            className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[32px] hover:opacity-90 transition-opacity disabled:opacity-50 mt-6 cursor-pointer"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Links */}
      <div className="mt-8 pt-6 border-t border-mute space-y-3">
        <p className="body-sm text-center text-body">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-semibold">
            Create one
          </Link>
        </p>
        <div className="pt-2 border-t border-border/50 text-center">
          <p className="caption text-body">
            Are you a DOVVSU officer or caseworker?{' '}
            <Link href="/auth/admin-login" className="text-ink font-semibold hover:text-primary underline">
              Staff Portal
            </Link>
          </p>
        </div>
        <Link href="/" className="block text-center caption text-body hover:text-primary pt-1">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-canvas-soft py-12 px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="bg-canvas rounded-[12px] p-8 text-center text-body">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
