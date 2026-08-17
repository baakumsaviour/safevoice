'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, FileText, Image as ImageIcon, FileAudio, Trash2, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface EvidenceUploaderProps {
  selectedFile: File | null
  onFileSelect: (file: File | null) => void
  recordedAudioBlob?: Blob | null
  onRemoveRecordedAudio?: () => void
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function EvidenceUploader({
  selectedFile,
  onFileSelect,
  recordedAudioBlob,
  onRemoveRecordedAudio,
}: EvidenceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (recordedAudioBlob) {
      const url = URL.createObjectURL(recordedAudioBlob)
      setAudioUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setAudioUrl(null)
    }
  }, [recordedAudioBlob])

  const validateAndSetFile = (file: File) => {
    setError(null)
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds the 50MB maximum limit. Please choose a smaller file.')
      return
    }
    onFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      validateAndSetFile(files[0])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-6 h-6 text-primary" />
    if (type.startsWith('audio/')) return <FileAudio className="w-6 h-6 text-primary" />
    return <FileText className="w-6 h-6 text-primary" />
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="body-lg-strong text-ink mb-1">Attach Supporting Evidence (Optional)</h3>
        <p className="body-sm text-body">
          You can attach photos, documents, audio recordings, or videos. All files are encrypted before storage to protect your identity and safety.
        </p>
      </div>

      {/* Security Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          <Lock className="w-4 h-4" />
        </div>
        <div className="body-sm">
          <span className="font-semibold text-ink">End-to-End Encryption: </span>
          <span className="text-body">Your files are securely transmitted over HTTPS and stored encrypted at rest. Only authorized caseworkers can view them.</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recorded Audio Blob Display */}
      {recordedAudioBlob && (
        <div className="bg-canvas border-2 border-primary/40 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <FileAudio className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="body-md-strong text-ink">Recorded Audio Note</span>
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                  Attached
                </span>
              </div>
              <p className="caption text-body">
                {formatFileSize(recordedAudioBlob.size)} • Audio recording from Step 2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {audioUrl && (
              <audio controls src={audioUrl} className="h-9 max-w-[200px] md:max-w-[240px]" />
            )}
            {onRemoveRecordedAudio && (
              <button
                type="button"
                onClick={onRemoveRecordedAudio}
                className="p-2 text-body hover:text-primary hover:bg-canvas-soft rounded-lg transition-colors cursor-pointer"
                title="Remove recorded audio"
                aria-label="Remove recorded audio"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile ? (
        <div className="bg-canvas border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-canvas-soft flex items-center justify-center shrink-0 border border-border">
              {getFileIcon(selectedFile.type)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="body-md-strong text-ink truncate">{selectedFile.name}</p>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
              <p className="caption text-body">
                {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onFileSelect(null)
              if (fileInputRef.current) fileInputRef.current.value = ''
            }}
            className="p-2 text-body hover:text-primary hover:bg-canvas-soft rounded-lg transition-colors cursor-pointer shrink-0"
            title="Remove file"
            aria-label="Remove file"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border hover:border-ink/40 bg-canvas hover:bg-canvas-soft/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7" />
          </div>

          <p className="body-md-strong text-ink mb-1">
            Click to upload or drag and drop
          </p>
          <p className="body-sm text-body mb-3 max-w-sm mx-auto">
            Supported files: Images (JPG, PNG), Documents (PDF, DOCX), Audio, and Videos up to 50MB.
          </p>
          <span className="inline-block bg-canvas border border-border text-ink body-sm py-2 px-6 rounded-full hover:bg-canvas-soft transition-colors font-medium">
            Browse Files
          </span>
        </div>
      )}
    </div>
  )
}
