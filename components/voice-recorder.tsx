'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, Square, AlertCircle } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob) => void
}

// Keep recordings comfortably under the 8 MB upload cap.
const MAX_RECORDING_SECONDS = 5 * 60

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedTime, setRecordedTime] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const releaseResources = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  // Safety-critical: never leave the microphone live after unmount
  // (e.g. Quick Escape or step navigation while recording).
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      releaseResources()
    }
  }, [])

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const startRecording = async () => {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size > 0) onRecordingComplete?.(blob)
        releaseResources()
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordedTime(0)

      timerRef.current = setInterval(() => {
        setRecordedTime((prev) => {
          if (prev + 1 >= MAX_RECORDING_SECONDS) {
            stopRecording()
          }
          return prev + 1
        })
      }, 1000)
    } catch {
      setMicError(
        'We could not access your microphone. You can allow it in your browser settings, or simply type your description instead.'
      )
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        {isRecording ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <span className="body-sm-strong text-ink">
                Recording: {formatTime(recordedTime)} <span className="text-body font-normal">(max 5:00)</span>
              </span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="bg-primary text-on-primary body-sm font-normal py-2 px-4 rounded-[32px] hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            className="border-2 border-ink text-ink body-sm font-normal py-2 px-4 rounded-[32px] hover:bg-ink/5 transition-colors flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Record Audio
          </button>
        )}
      </div>
      {micError && (
        <p className="caption text-red-600 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{micError}</span>
        </p>
      )}
    </div>
  )
}
