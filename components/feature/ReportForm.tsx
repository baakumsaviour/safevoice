'use client'

import { useState } from 'react'
import { submitReportAction } from '@/server/actions/report'

export function ReportForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<{caseNumber: string} | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const result = await submitReportAction(formData)
    
    if (result.error) {
      setError(typeof result.error === 'string' ? result.error : 'Please fill in the required fields correctly.')
    } else if (result.success && result.caseNumber) {
      setSuccessData({ caseNumber: result.caseNumber })
    }
    
    setIsSubmitting(false)
  }

  if (successData) {
    return (
      <div className="bg-canvas-soft rounded-2xl p-8 border border-border text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="display-xs text-ink mb-2">Report Submitted Safely</h2>
        <p className="body-md text-body mb-6">
          Your voice has been heard. Professionals are now reviewing your case.
        </p>
        <div className="bg-canvas p-6 rounded-xl border border-border mb-8 inline-block text-left">
          <p className="caption text-body uppercase mb-1">Your Case Number</p>
          <p className="display-sm text-ink font-mono">{successData.caseNumber}</p>
          <p className="caption text-body mt-2">Please save this number if you wish to follow up later.</p>
        </div>
        <div>
          <button onClick={() => window.location.href = '/'} className="bg-canvas border border-border text-ink hover:bg-canvas-soft py-3 px-8 rounded-full transition-colors">
            Return to Safety
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-canvas-soft rounded-2xl p-6 md:p-8 border border-border">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        <div className="space-y-4">
          <h3 className="body-lg-strong text-ink">1. What happened?</h3>
          <p className="body-sm text-body">Please describe the incident. Take your time. Only share what you feel comfortable sharing.</p>
          <textarea 
            name="narrative"
            required
            rows={6}
            className="w-full bg-canvas border border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            placeholder="I want to report..."
          />
        </div>

        <div className="space-y-4">
          <h3 className="body-lg-strong text-ink">2. What type of incident is this?</h3>
          <select 
            name="case_type"
            className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink appearance-none"
          >
            <option value="general_abuse">General Abuse</option>
            <option value="domestic_violence">Domestic Violence</option>
            <option value="child_abuse">Child Abuse</option>
            <option value="gbv">Gender Based Violence</option>
            <option value="harassment">Harassment</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="body-lg-strong text-ink">3. When & Where (Optional)</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block caption-strong text-ink mb-2">Date of incident</label>
              <input 
                type="date" 
                name="incident_date"
                className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block caption-strong text-ink mb-2">Location</label>
              <input 
                type="text" 
                name="incident_location"
                placeholder="City, landmark, or address"
                className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="body-lg-strong text-ink">4. Upload Evidence (Optional)</h3>
          <p className="body-sm text-body">You can securely attach a photo or audio file. It will be encrypted.</p>
          <input 
            type="file" 
            name="evidence_file"
            accept="image/*,audio/*,.pdf"
            className="w-full bg-canvas-soft border border-dashed border-border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          />
        </div>

        <div className="space-y-4">
          <h3 className="body-lg-strong text-ink">5. Contact (Optional)</h3>
          <p className="body-sm text-body">If you want us to reach out to you safely, provide a safe phone number or email.</p>
          <input 
            type="text" 
            name="contact_info"
            placeholder="Phone number or email"
            className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="consent_given" required defaultChecked className="w-5 h-5 text-primary rounded border-border focus:ring-primary/50" />
            <span className="body-sm text-body">I consent to sharing this securely with support services.</span>
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary text-on-primary py-3 px-10 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
          >
            {isSubmitting ? 'Submitting securely...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  )
}
