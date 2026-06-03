'use client'

import { useState } from 'react'
import Link from 'next/link'
import { QuickEscapeButton } from '@/components/quick-escape-button'
import { VoiceRecorder } from '@/components/voice-recorder'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { createCase } from '@/lib/actions/cases'
import { encryptData } from '@/lib/encryption'

type Step = 'start' | 'incident' | 'narrative' | 'evidence' | 'consent' | 'success'

export default function ReportPage() {
  const [currentStep, setCurrentStep] = useState<Step>('start')
  const [formData, setFormData] = useState({
    incident_date: '',
    incident_location: '',
    case_type: '',
    narrative: '',
    evidence_files: [] as File[],
    consent_given: false,
    follow_up_consent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [caseNumber, setCaseNumber] = useState('')
  const [error, setError] = useState('')

  const handleNext = () => {
    const steps: Step[] = ['start', 'incident', 'narrative', 'evidence', 'consent', 'success']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
      setError('')
    }
  }

  const handleBack = () => {
    const steps: Step[] = ['start', 'incident', 'narrative', 'evidence', 'consent', 'success']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
      setError('')
    }
  }

  const handleVoiceRecord = (blob: Blob) => {
    const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })
    setFormData(prev => ({
      ...prev,
      evidence_files: [...prev.evidence_files, file]
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        evidence_files: [...prev.evidence_files, ...Array.from(e.target.files!)]
      }))
    }
  }

  const handleSubmit = async () => {
    if (!formData.consent_given) {
      setError('You must consent to report this case.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createCase({
        incident_date: formData.incident_date,
        incident_location: formData.incident_location,
        narrative: formData.narrative,
        case_type: formData.case_type,
        consent_given: formData.consent_given,
        follow_up_consent: formData.follow_up_consent,
      })

      if (result.success && result.caseNumber) {
        setCaseNumber(result.caseNumber)
        setCurrentStep('success')
      } else {
        setError(result.error || 'Failed to submit report. Please try again.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('[v0] Report submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <QuickEscapeButton />
      <main className="min-h-screen bg-canvas">
        {/* Header - Ink Band */}
        <header className="bg-ink text-on-dark sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-on-dark hover:text-primary transition-colors body-sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <h1 className="body-sm-strong">REPORT FORM</h1>
            <div className="w-12" />
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-8 py-12">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {['start', 'incident', 'narrative', 'evidence', 'consent'].map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center caption-strong ${
                    step === currentStep ? 'bg-primary text-on-primary' :
                    ['start', 'incident', 'narrative', 'evidence', 'consent'].indexOf(step) < ['start', 'incident', 'narrative', 'evidence', 'consent'].indexOf(currentStep) ? 'bg-primary text-on-primary' :
                    'bg-canvas-soft text-mute'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < 4 && <div className={`w-12 h-1 mx-2 ${['start', 'incident', 'narrative', 'evidence', 'consent'].indexOf(step) < ['start', 'incident', 'narrative', 'evidence', 'consent'].indexOf(currentStep) ? 'bg-primary' : 'bg-canvas-soft'}`} />}
                </div>
              ))}
            </div>
          </div>

          {/* Step: Welcome */}
          {currentStep === 'start' && (
            <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10">
              <h2 className="display-sm text-ink mb-4">Welcome to SafeVoice</h2>
              <p className="body-md text-body mb-8">
                We&apos;re here to help you document your experience safely and securely. This process is designed to be trauma-informed and respectful of your needs.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="body-sm-strong text-ink">Your data is encrypted</p>
                    <p className="caption text-body">All information is protected with military-grade AES-256 encryption</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="body-sm-strong text-ink">You&apos;re in control</p>
                    <p className="caption text-body">You can provide as much or as little detail as you&apos;re comfortable with</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="body-sm-strong text-ink">No judgment</p>
                    <p className="caption text-body">Our trained caseworkers are here to support you</p>
                  </div>
                </div>
              </div>
              <button onClick={handleNext} className="w-full bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[60px] hover:opacity-90 transition-opacity">
                Start Report
              </button>
            </div>
          )}

          {/* Step: Incident Details */}
          {currentStep === 'incident' && (
            <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10">
              <h2 className="display-sm text-ink mb-6">When and Where Did This Happen?</h2>
              <div className="space-y-6">
                <div>
                  <label className="block body-sm-strong text-ink mb-3">Date of Incident</label>
                  <input
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, incident_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-mute rounded-[6px] bg-canvas text-ink body-sm"
                  />
                </div>
                <div>
                  <label className="block body-sm-strong text-ink mb-3">Location</label>
                  <input
                    type="text"
                    placeholder="City, address, or general location (optional)"
                    value={formData.incident_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, incident_location: e.target.value }))}
                    className="w-full px-4 py-3 border border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
                  />
                </div>
                <div>
                  <label className="block body-sm-strong text-ink mb-3">Type of Incident</label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, case_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-mute rounded-[6px] bg-canvas text-ink body-sm"
                  >
                    <option value="">Select...</option>
                    <option value="sexual_assault">Sexual Assault</option>
                    <option value="domestic_violence">Domestic Violence</option>
                    <option value="human_trafficking">Human Trafficking</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              {error && (
                <div className="mt-6 p-4 bg-primary/10 border border-primary rounded-[6px] flex gap-3">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="caption text-ink">{error}</p>
                </div>
              )}
              <div className="flex gap-4 mt-8">
                <button onClick={handleBack} className="flex-1 border-2 border-ink text-ink body-md font-normal py-3 px-8 rounded-[60px] hover:bg-ink/5 transition-colors">Back</button>
                <button onClick={handleNext} className="flex-1 bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[60px] hover:opacity-90 transition-opacity">Continue</button>
              </div>
            </div>
          )}

          {/* Step: Narrative */}
          {currentStep === 'narrative' && (
            <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10">
              <h2 className="display-sm text-ink mb-4">Tell Us What Happened</h2>
              <p className="body-md text-body mb-8">You can share as much or as little detail as you&apos;re comfortable with. You can also record your account using the voice recorder below.</p>
              <div className="space-y-8">
                <div>
                  <label className="block body-sm-strong text-ink mb-3">Your Account</label>
                  <textarea
                    placeholder="Describe what happened in your own words..."
                    value={formData.narrative}
                    onChange={(e) => setFormData(prev => ({ ...prev, narrative: e.target.value }))}
                    className="w-full min-h-40 px-4 py-3 border border-mute rounded-[6px] bg-canvas text-ink body-sm placeholder-body"
                  />
                </div>
                <div className="border-t border-mute pt-8">
                  <p className="body-sm-strong text-ink mb-4">Or Record Your Account</p>
                  <VoiceRecorder onRecordingComplete={handleVoiceRecord} />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={handleBack} className="flex-1 border-2 border-ink text-ink body-md font-normal py-3 px-8 rounded-[60px] hover:bg-ink/5 transition-colors">Back</button>
                <button onClick={handleNext} className="flex-1 bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[60px] hover:opacity-90 transition-opacity">Continue</button>
              </div>
            </div>
          )}

          {/* Step: Evidence */}
          {currentStep === 'evidence' && (
            <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10">
              <h2 className="display-sm text-ink mb-3">Upload Evidence (Optional)</h2>
              <p className="body-md text-body mb-8">You can upload photos, videos, documents, or other evidence. All files are encrypted before upload.</p>
              <div className="space-y-6">
                {formData.evidence_files.length > 0 && (
                  <div className="bg-canvas-soft rounded-[6px] p-4 border border-mute">
                    <p className="body-sm-strong text-ink mb-3">Uploaded Files:</p>
                    <ul className="space-y-2">
                      {formData.evidence_files.map((file, idx) => (
                        <li key={idx} className="caption text-body">
                          📎 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-2 border-dashed border-mute rounded-[6px] p-8 text-center cursor-pointer hover:bg-canvas-soft transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <p className="body-sm-strong text-ink">Click or drag files to upload</p>
                    <p className="caption text-body mt-2">Supports images, videos, documents</p>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button onClick={handleBack} className="flex-1 border-2 border-ink text-ink body-md font-normal py-3 px-8 rounded-[60px] hover:bg-ink/5 transition-colors">Back</button>
                <button onClick={handleNext} className="flex-1 bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[60px] hover:opacity-90 transition-opacity">Continue</button>
              </div>
            </div>
          )}

          {/* Step: Consent */}
          {currentStep === 'consent' && (
            <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10">
              <h2 className="display-sm text-ink mb-8">Final Confirmation</h2>
              <div className="space-y-4 mb-8">
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent_given}
                    onChange={(e) => setFormData(prev => ({ ...prev, consent_given: e.target.checked }))}
                    className="mt-1.5 w-5 h-5 accent-primary"
                  />
                  <span className="body-sm text-ink">
                    I consent to submit this report to SafeVoice and understand that it will be reviewed by trained caseworkers.
                  </span>
                </label>
                <label className="flex items-start gap-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, follow_up_consent: e.target.checked }))}
                    className="mt-1.5 w-5 h-5 accent-primary"
                  />
                  <span className="body-sm text-ink">
                    I consent to be contacted for follow-up support and case management (optional).
                  </span>
                </label>
              </div>
              {error && (
                <div className="p-4 bg-primary/10 border border-primary rounded-[6px] flex gap-3 mb-8">
                  <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="caption text-ink">{error}</p>
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={handleBack} className="flex-1 border-2 border-ink text-ink body-md font-normal py-3 px-8 rounded-[60px] hover:bg-ink/5 transition-colors">Back</button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.consent_given}
                  className={`flex-1 body-md font-normal py-3 px-8 rounded-[60px] transition-opacity ${
                    formData.consent_given 
                      ? 'bg-primary text-on-primary hover:opacity-90' 
                      : 'bg-mute text-on-dark/50 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {currentStep === 'success' && (
            <div className="bg-canvas rounded-[6px] p-8 border-2 border-ink/10 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="display-sm text-ink mb-3">Report Submitted</h2>
              <p className="body-md text-body mb-8">Thank you for your courage in coming forward. Your voice matters.</p>
              <div className="bg-canvas-soft border border-mute rounded-[6px] p-6 mb-8">
                <p className="caption-uppercase text-body mb-2">Your Case Number</p>
                <p className="display-xs text-primary font-mono">{caseNumber}</p>
              </div>
              <p className="body-sm text-body mb-10">
                A caseworker will review your report and may contact you within 24 hours if you provided consent.
              </p>
              <div className="space-y-4">
                <button onClick={() => window.location.href = '/'} className="w-full bg-primary text-on-primary body-md font-normal py-3 px-8 rounded-[60px] hover:opacity-90 transition-opacity">
                  Return Home
                </button>
                <p className="caption text-body">
                  For immediate support, call <span className="body-sm-strong text-primary">1-800-656-HOPE</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
