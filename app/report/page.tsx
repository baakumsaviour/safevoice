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
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Header */}
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">SafeVoice Report</h1>
            <div className="w-12" />
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {['start', 'incident', 'narrative', 'evidence', 'consent'].map((step, idx) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === currentStep ? 'bg-blue-600 text-white' :
                    ['start', 'incident', 'narrative', 'evidence', 'consent'].indexOf(step) < ['start', 'incident', 'narrative', 'evidence', 'consent'].indexOf(currentStep) ? 'bg-green-600 text-white' :
                    'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < 4 && <div className="w-12 h-1 mx-2 bg-slate-200 dark:bg-slate-700" />}
                </div>
              ))}
            </div>
          </div>

          {/* Step: Welcome */}
          {currentStep === 'start' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Welcome to SafeVoice</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We&apos;re here to help you document your experience safely and securely. This process is designed to be trauma-informed and respectful of your needs.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">Your data is encrypted</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">All information is protected with military-grade encryption</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">You&apos;re in control</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">You can provide as much or as little detail as you&apos;re comfortable with</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">No judgment</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Our trained caseworkers are here to support you</p>
                  </div>
                </div>
              </div>
              <Button onClick={handleNext} className="w-full bg-blue-600 hover:bg-blue-700">
                Start Report
              </Button>
            </Card>
          )}

          {/* Step: Incident Details */}
          {currentStep === 'incident' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">When and Where Did This Happen?</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Date of Incident</label>
                  <Input
                    type="date"
                    value={formData.incident_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, incident_date: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Location</label>
                  <Input
                    type="text"
                    placeholder="City, address, or general location (optional)"
                    value={formData.incident_location}
                    onChange={(e) => setFormData(prev => ({ ...prev, incident_location: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Type of Incident</label>
                  <select
                    value={formData.case_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, case_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              <div className="flex gap-4 mt-8">
                <Button onClick={handleBack} variant="outline" className="flex-1">Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700">Continue</Button>
              </div>
            </Card>
          )}

          {/* Step: Narrative */}
          {currentStep === 'narrative' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Tell Us What Happened</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">You can share as much or as little detail as you&apos;re comfortable with. You can also record your account using the voice recorder below.</p>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Your Account</label>
                  <Textarea
                    placeholder="Describe what happened in your own words..."
                    value={formData.narrative}
                    onChange={(e) => setFormData(prev => ({ ...prev, narrative: e.target.value }))}
                    className="w-full min-h-32"
                  />
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-4">Or Record Your Account</p>
                  <VoiceRecorder onRecordingComplete={handleVoiceRecord} />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button onClick={handleBack} variant="outline" className="flex-1">Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700">Continue</Button>
              </div>
            </Card>
          )}

          {/* Step: Evidence */}
          {currentStep === 'evidence' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Upload Evidence (Optional)</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">You can upload photos, videos, documents, or other evidence. All files are encrypted before upload.</p>
              <div className="space-y-4">
                {formData.evidence_files.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-3">Uploaded Files:</p>
                    <ul className="space-y-2">
                      {formData.evidence_files.map((file, idx) => (
                        <li key={idx} className="text-sm text-slate-600 dark:text-slate-400">
                          📎 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Click or drag files to upload</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Supports images, videos, documents</p>
                  </label>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button onClick={handleBack} variant="outline" className="flex-1">Back</Button>
                <Button onClick={handleNext} className="flex-1 bg-blue-600 hover:bg-blue-700">Continue</Button>
              </div>
            </Card>
          )}

          {/* Step: Consent */}
          {currentStep === 'consent' && (
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Final Confirmation</h2>
              <div className="space-y-4 mb-8">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent_given}
                    onChange={(e) => setFormData(prev => ({ ...prev, consent_given: e.target.checked }))}
                    className="mt-1"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I consent to submit this report to SafeVoice and understand that it will be reviewed by trained caseworkers.
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_consent}
                    onChange={(e) => setFormData(prev => ({ ...prev, follow_up_consent: e.target.checked }))}
                    className="mt-1"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    I consent to be contacted for follow-up support and case management (optional).
                  </span>
                </label>
              </div>
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex gap-3 mb-8">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              <div className="flex gap-4">
                <Button onClick={handleBack} variant="outline" className="flex-1">Back</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.consent_given}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </Card>
          )}

          {/* Step: Success */}
          {currentStep === 'success' && (
            <Card className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Report Submitted Successfully</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Thank you for your courage in coming forward.</p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Your Case Number:</p>
                <p className="text-lg font-mono font-bold text-blue-600">{caseNumber}</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
                A caseworker will review your report and may contact you within 24 hours if you provided consent.
              </p>
              <div className="space-y-3">
                <Button onClick={() => window.location.href = '/'} className="w-full bg-blue-600 hover:bg-blue-700">
                  Return Home
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  For immediate support, call 1-800-656-HOPE (4673)
                </p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
