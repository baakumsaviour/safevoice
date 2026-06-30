'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    try {
      // TODO: Call signup API
      console.log('Signup attempt:', formData)
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/auth/login'
      }, 2000)
    } catch (err) {
      setError('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-canvas-soft py-12 px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-canvas rounded-[12px] p-8 border-2 border-mute/20">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-primary rounded-sm flex items-center justify-center mx-auto mb-4">
              <span className="text-on-primary font-black text-xl">"</span>
            </div>
            <h1 className="display-sm text-ink mb-2">Create account</h1>
            <p className="body-md text-body">Report safely and securely</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-[6px] flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="caption text-ink">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary rounded-[6px] flex gap-3">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="caption text-ink">Account created! Redirecting...</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block body-sm-strong text-ink mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your name"
                className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
              />
            </div>

            <div>
              <label className="block body-sm-strong text-ink mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
              />
            </div>

            <div>
              <label className="block body-sm-strong text-ink mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
              />
            </div>

            <div>
              <label className="block body-sm-strong text-ink mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm password"
                className="w-full px-4 py-3 border-2 border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[32px] hover:opacity-90 transition-opacity disabled:opacity-50 mt-6"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Link to login */}
          <p className="body-sm text-center text-body mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
