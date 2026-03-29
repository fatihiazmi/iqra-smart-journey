'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'

interface ReadingTestResult {
  correct: boolean
  confidence: number
  audioBlob: Blob | null
}

interface ReadingTestProps {
  huruf: string
  onResult: (result: ReadingTestResult) => void
}

export function ReadingTest({ huruf, onResult }: ReadingTestProps) {
  const { isListening, result, startListening, stopListening } =
    useSpeechRecognition('ar-SA')
  const { isRecording, audioBlob, startRecording, stopRecording } =
    useAudioRecorder()
  const [feedback, setFeedback] = useState<'correct' | 'miss' | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      stopRecording()
      stopListening()
    } else {
      setFeedback(null)
      setHasSubmitted(false)
      await startRecording()
      startListening()
    }
  }, [isRecording, startRecording, stopRecording, startListening, stopListening])

  // When speech result arrives, evaluate and report
  useEffect(() => {
    if (!result || hasSubmitted) return
    setHasSubmitted(true)

    const transcript = result.transcript.trim()
    const correct = transcript.includes(huruf)
    setFeedback(correct ? 'correct' : 'miss')

    // Small delay so the child sees feedback before advancing
    const timer = setTimeout(() => {
      onResult({
        correct,
        confidence: result.confidence,
        audioBlob,
      })
    }, 1500)

    return () => clearTimeout(timer)
  }, [result, huruf, audioBlob, onResult, hasSubmitted])

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Huruf display */}
      <div className="flex h-48 w-48 items-center justify-center rounded-3xl bg-white shadow-lg">
        <span className="text-8xl leading-none text-indigo-700">{huruf}</span>
      </div>

      {/* Feedback area */}
      <div className="min-h-[48px] text-center">
        {feedback === 'correct' && (
          <div className="animate-bounce text-3xl">
            <span role="img" aria-label="star">
              ⭐
            </span>{' '}
            <span className="font-bold text-yellow-300">Betul!</span>{' '}
            <span role="img" aria-label="star">
              ⭐
            </span>
          </div>
        )}
        {feedback === 'miss' && (
          <p className="text-lg font-semibold text-white">
            Cuba lagi, Arnab percaya kamu boleh! 🐰
          </p>
        )}
      </div>

      {/* Mic button */}
      <button
        onClick={handleToggleRecording}
        className={`flex h-24 w-24 items-center justify-center rounded-full text-5xl shadow-xl transition-all active:scale-95 ${
          isRecording || isListening
            ? 'animate-pulse bg-red-500 text-white'
            : 'bg-green-500 text-white hover:bg-green-400'
        }`}
        aria-label={isRecording ? 'Berhenti rakam' : 'Mula rakam'}
      >
        🎤
      </button>

      <p className="text-sm text-white/80">
        {isRecording ? 'Sedang merakam... tekan untuk berhenti' : 'Tekan mikrofon dan sebut huruf'}
      </p>
    </div>
  )
}
