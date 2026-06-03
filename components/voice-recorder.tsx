'use client'

import { useState, useRef } from 'react'
import { Mic, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceRecorderProps {
  onRecordingComplete?: (blob: Blob) => void
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedTime, setRecordedTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
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
        onRecordingComplete?.(blob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordedTime(0)

      // Timer
      timerRef.current = setInterval(() => {
        setRecordedTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('[v0] Microphone access denied:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-4">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording: {formatTime(recordedTime)}</span>
          </div>
          <Button
            onClick={stopRecording}
            variant="destructive"
            size="sm"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </>
      ) : (
        <Button
          onClick={startRecording}
          variant="outline"
          size="sm"
        >
          <Mic className="w-4 h-4 mr-2" />
          Record Audio
        </Button>
      )}
    </div>
  )
}
