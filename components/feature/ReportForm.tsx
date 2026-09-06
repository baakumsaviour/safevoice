'use client'

import { useState } from 'react'
import { submitReportAction } from '@/server/actions/report'
import { ReportStepper, StepItem } from './ReportStepper'
import { IncidentTypeSelector, INCIDENT_TYPES } from './IncidentTypeSelector'
import { EvidenceUploader } from './EvidenceUploader'
import { VoiceRecorder } from '@/components/voice-recorder'
import { ArrowLeft, ArrowRight, ShieldCheck, Copy, Check, Lock, AlertCircle, MapPin, Calendar, FileText } from 'lucide-react'

const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Western North',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
]

const STEPS: StepItem[] = [
  { id: 1, label: 'Category', description: 'Type of incident' },
  { id: 2, label: 'Details', description: 'What happened' },
  { id: 3, label: 'Evidence', description: 'Files & audio' },
  { id: 4, label: 'Review', description: 'Submit report' },
]

export function ReportForm() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successData, setSuccessData] = useState<{ caseNumber: string; warnings: string[] } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form State
  const [caseType, setCaseType] = useState('general_abuse')
  const [narrative, setNarrative] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentRegion, setIncidentRegion] = useState('')
  const [incidentDistrict, setIncidentDistrict] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [consentGiven, setConsentGiven] = useState(true)

  // Files State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const maxDate = new Date().toISOString().split('T')[0]

  const handleCopyCaseNumber = async () => {
    if (!successData?.caseNumber) return
    try {
      await navigator.clipboard.writeText(successData.caseNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Clipboard unavailable (permissions / insecure context) — leave the
      // button as "Copy" so the user knows to copy the code manually.
      setCopied(false)
    }
  }

  const handleNext = () => {
    setError(null)
    if (step === 2 && !audioBlob && narrative.trim().length < 10) {
      setError('Please provide at least 10 characters describing the incident, or record an audio note instead.')
      return
    }
    if (step < 4) {
      setStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setError(null)
    if (step > 1) {
      setStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!audioBlob && narrative.trim().length < 10) {
      setError('Please provide more details about what happened, or record an audio note.')
      setIsSubmitting(false)
      setStep(2)
      return
    }

    const formData = new FormData()
    formData.append('case_type', caseType)
    formData.append('narrative', narrative)
    if (incidentDate) formData.append('incident_date', incidentDate)
    if (incidentRegion) formData.append('incident_region', incidentRegion)
    if (incidentDistrict) formData.append('incident_district', incidentDistrict)
    if (incidentLocation) formData.append('incident_location', incidentLocation)
    if (contactInfo) formData.append('contact_info', contactInfo)
    formData.append('consent_given', consentGiven ? 'true' : 'false')
    formData.append('has_audio', audioBlob ? 'true' : 'false')

    if (selectedFile) {
      formData.append('evidence_file', selectedFile)
    }

    if (audioBlob) {
      const audioFile = new File([audioBlob], `audio-note-${Date.now()}.webm`, {
        type: audioBlob.type || 'audio/webm',
      })
      formData.append('audio_file', audioFile)
    }

    try {
      const result = await submitReportAction(formData)

      if ('error' in result) {
        setError(result.error)
      } else {
        setSuccessData({ caseNumber: result.caseNumber, warnings: result.warnings })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch {
      // Server Action transport failure (network drop, file too large, 500).
      setError(
        'We could not submit your report — the connection failed or an attached file was too large. ' +
          'Your answers are still here: please check your files (8 MB max each) and try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (successData) {
    return (
      <div className="bg-canvas-soft rounded-3xl p-6 md:p-10 border border-border text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="display-xs text-ink mb-2">Report Submitted Safely</h2>
        <p className="body-md text-body mb-8 max-w-md mx-auto">
          Your voice has been heard. Our trauma-informed professionals have securely received your report and will begin triaging it immediately.
        </p>

        {successData.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl mb-6 text-left text-sm max-w-md mx-auto">
            <p className="font-semibold mb-1">Your report was saved, but some attachments were not:</p>
            <ul className="list-disc pl-5 space-y-0.5">
              {successData.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
            <p className="mt-2">Please keep your copies — a caseworker can help you attach them later.</p>
          </div>
        )}

        <div className="bg-canvas p-6 md:p-8 rounded-2xl border-2 border-primary/20 mb-8 max-w-md mx-auto text-left shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="caption-strong text-primary uppercase tracking-wider">Reference Code</span>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> Confidential
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-3 bg-canvas-soft p-4 rounded-xl border border-border">
            <code className="display-sm text-ink font-mono tracking-wider">{successData.caseNumber}</code>
            <button
              onClick={handleCopyCaseNumber}
              className="bg-primary/10 hover:bg-primary/20 text-primary p-3 rounded-lg transition-colors flex items-center gap-1.5 caption-strong shrink-0 cursor-pointer"
              title="Copy Case Number"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="caption text-body mt-3 leading-relaxed">
            ⚠️ <strong>Important Safety Note:</strong> Save this exact reference code in a secure place. This is the only way to follow up on your case status anonymously without logging into an account.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto bg-primary text-on-primary py-3.5 px-10 rounded-full hover:opacity-90 transition-opacity font-medium body-sm-strong shadow-md cursor-pointer"
          >
            Return to Homepage
          </button>
          <p className="caption text-body">
            Need immediate emergency assistance? Call <a href="tel:18007997233" className="text-primary font-semibold underline">1-800-799-SAFE</a>.
          </p>
        </div>
      </div>
    )
  }

  const currentTypeObj = INCIDENT_TYPES.find(t => t.value === caseType)

  return (
    <div className="bg-canvas-soft rounded-3xl p-6 md:p-10 border border-border shadow-sm">
      <ReportStepper currentStep={step} steps={STEPS} onStepClick={(s) => s < step && setStep(s)} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Please check your information</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Incident Type */}
        {step === 1 && (
          <div className="space-y-6">
            <IncidentTypeSelector selectedType={caseType} onSelect={setCaseType} />
            <div className="pt-6 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary text-on-primary py-3.5 px-8 rounded-full hover:opacity-90 transition-opacity flex items-center gap-2 font-medium cursor-pointer"
              >
                <span>Next: Incident Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="body-lg-strong text-ink mb-1">What happened?</h3>
              <p className="body-sm text-body">
                Please describe the incident in your own words. Take your time. Only share what you feel comfortable sharing.
              </p>
            </div>

            {/* Voice Recorder Box */}
            <div className="bg-canvas border border-border rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="body-sm-strong text-ink">Prefer speaking instead of typing?</h4>
                  <p className="caption text-body">Record a secure audio note. It is sent over an encrypted connection and stored securely alongside your narrative.</p>
                </div>
              </div>
              <VoiceRecorder
                onRecordingComplete={(blob) => {
                  setAudioBlob(blob)
                }}
              />
              {audioBlob && (
                <div className="flex items-center gap-2 text-emerald-700 caption-strong bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Audio note recorded ({Math.round(audioBlob.size / 1024)} KB). You can review it in Step 3.</span>
                </div>
              )}
            </div>

            <div>
              <label className="block body-sm-strong text-ink mb-2">
                Narrative Description {!audioBlob && <span className="text-primary">*</span>}
                {audioBlob && <span className="text-body font-normal text-sm"> (optional — audio note recorded)</span>}
              </label>
              <textarea
                value={narrative}
                onChange={(e) => setNarrative(e.target.value)}
                required={!audioBlob}
                rows={6}
                className="w-full bg-canvas border border-border rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-ink body-sm leading-relaxed"
                placeholder={audioBlob ? "You've recorded an audio note. You may optionally add written details here." : "I want to report an incident involving... (minimum 10 characters)"}
              />
              <div className="flex justify-between items-center mt-1.5 caption text-body">
                <span>Sent over an encrypted connection and stored encrypted on our servers.</span>
                {!audioBlob && (
                  <span className={narrative.length < 10 ? 'text-primary font-semibold' : 'text-body'}>
                    {narrative.length}/10 min characters
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <h4 className="body-md-strong text-ink mb-1">When & Where did this occur? (Optional)</h4>
              <p className="body-sm text-body mb-4">Providing location helps our caseworkers assign regional specialized support.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="caption-strong text-ink mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-primary" /> Date of Incident
                  </label>
                  <input
                    type="date"
                    max={maxDate}
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink body-sm"
                  />
                </div>

                <div>
                  <label className="caption-strong text-ink mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> Region
                  </label>
                  <select
                    value={incidentRegion}
                    onChange={(e) => setIncidentRegion(e.target.value)}
                    className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink body-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select Region (Ghana)</option>
                    {GHANA_REGIONS.map((reg) => (
                      <option key={reg} value={reg}>{reg} Region</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block caption-strong text-ink mb-1.5">District / Town</label>
                  <input
                    type="text"
                    value={incidentDistrict}
                    onChange={(e) => setIncidentDistrict(e.target.value)}
                    placeholder="e.g. Accra Metropolitan, Tema, Kumasi"
                    className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink body-sm"
                  />
                </div>
                <div>
                  <label className="block caption-strong text-ink mb-1.5">Specific Location / Landmark</label>
                  <input
                    type="text"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    placeholder="e.g. Near Market, School, Residence"
                    className="w-full bg-canvas border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink body-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 pb-16 sm:pb-6 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="border border-border bg-canvas text-ink py-3 px-6 rounded-full hover:bg-canvas-soft transition-colors flex items-center justify-center gap-2 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary text-on-primary py-3.5 px-8 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium cursor-pointer"
              >
                <span>Next: Attach Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Evidence */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <EvidenceUploader
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              recordedAudioBlob={audioBlob}
              onRemoveRecordedAudio={() => setAudioBlob(null)}
            />

            <div className="pt-6 pb-16 sm:pb-6 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="border border-border bg-canvas text-ink py-3 px-6 rounded-full hover:bg-canvas-soft transition-colors flex items-center justify-center gap-2 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-primary text-on-primary py-3.5 px-8 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2 font-medium cursor-pointer"
              >
                <span>Next: Review & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="body-lg-strong text-ink mb-1">Review Your Report</h3>
              <p className="body-sm text-body">
                Please review the summary below. Once submitted, your data is securely encrypted.
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-canvas border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                  <span className="caption-strong text-body uppercase tracking-wider block">Incident Category</span>
                  <span className="body-md-strong text-primary">{currentTypeObj?.label || 'General Abuse'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="caption-strong text-ink hover:text-primary underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="pb-4 border-b border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="caption-strong text-body uppercase tracking-wider">Narrative Summary</span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="caption-strong text-ink hover:text-primary underline cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
                <p className="body-sm text-ink bg-canvas-soft p-3 rounded-xl line-clamp-4 leading-relaxed font-mono text-xs">
                  {narrative}
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-body pt-1">
                  {incidentDate && <span>📅 Date: {incidentDate}</span>}
                  {incidentRegion && <span>📍 Region: {incidentRegion}</span>}
                  {incidentDistrict && <span>🏙️ District: {incidentDistrict}</span>}
                  {incidentLocation && <span>📌 Location: {incidentLocation}</span>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="caption-strong text-body uppercase tracking-wider block">Attached Evidence</span>
                  <span className="body-sm text-ink">
                    {[selectedFile ? `File (${selectedFile.name})` : null, audioBlob ? 'Recorded Audio Note' : null]
                      .filter(Boolean)
                      .join(' + ') || 'No files attached'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="caption-strong text-ink hover:text-primary underline cursor-pointer"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Optional Safe Contact */}
            <div className="bg-canvas border border-border rounded-2xl p-6 space-y-3 shadow-sm">
              <h4 className="body-md-strong text-ink">Safe Follow-up Contact (Optional)</h4>
              <p className="body-sm text-body">
                If you would like a caseworker to reach out to you safely, provide a secure email address or phone number. Leave blank if you wish to remain 100% anonymous.
              </p>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone number, WhatsApp, or secure email"
                className="w-full bg-canvas-soft border border-border rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-ink body-sm"
              />
            </div>

            {/* Consent */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  required
                  className="w-5 h-5 text-primary rounded border-border focus:ring-primary/50 mt-0.5"
                />
                <div className="body-sm">
                  <span className="font-semibold text-ink">Informed Consent: </span>
                  <span className="text-body">
                    I consent to sharing this report securely with SafeVoice support services and authorized caseworkers for triage and assistance. I understand my safety is the top priority.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-6 pb-16 sm:pb-6 border-t border-border flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="border border-border bg-canvas text-ink py-3 px-6 rounded-full hover:bg-canvas-soft transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !consentGiven}
                className="bg-primary text-on-primary py-4 px-10 rounded-full hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-50 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Encrypting & Submitting...' : 'Submit Secure Report'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
