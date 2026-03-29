'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'
import { useAudioRecorder } from '@/hooks/use-audio-recorder'

interface ContentItem {
  id: string
  label: string
  imageUrl: string | null
  audioUrl: string
}

interface SebutModeProps {
  items: ContentItem[]
  onComplete: (correctCount: number, totalCount: number) => void
}

export default function SebutMode({ items, onComplete }: SebutModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [starVisible, setStarVisible] = useState(false)

  const { isListening, result, startListening, stopListening } =
    useSpeechRecognition('ms-MY')
  const { isRecording, startRecording, stopRecording } = useAudioRecorder()

  const currentItem = items[currentIndex] ?? null

  const handleMicPress = useCallback(() => {
    if (isListening || isRecording) {
      stopListening()
      stopRecording()
    } else {
      setFeedback(null)
      startListening()
      startRecording()
    }
  }, [
    isListening,
    isRecording,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
  ])

  // Process speech result
  useEffect(() => {
    if (!result || !currentItem) return

    const transcript = result.transcript.trim().toLowerCase()
    const target = currentItem.label.trim().toLowerCase()

    // Check if confidence > 0.7 and transcript matches (or contains) target
    if (result.confidence > 0.7 && transcript.includes(target)) {
      // Correct!
      setStarVisible(true)
      setFeedback(null)
      const newCorrectCount = correctCount + 1

      setTimeout(() => {
        setStarVisible(false)
        const nextIndex = currentIndex + 1
        if (nextIndex >= items.length) {
          onComplete(newCorrectCount, items.length)
        } else {
          setCurrentIndex(nextIndex)
          setCorrectCount(newCorrectCount)
        }
      }, 800)
    } else {
      // Wrong — encourage retry
      setFeedback('Cuba sekali lagi! Arnab percaya kamu boleh! 🐰')
    }
  }, [result]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!currentItem) return null

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Sebut 🗣️</h2>
        <p className="mt-1 text-lg text-white/80">
          Sebut huruf yang kamu nampak!
        </p>
      </div>

      {/* Big huruf display */}
      <div className="w-40 h-40 bg-white rounded-3xl shadow-xl flex items-center justify-center">
        {currentItem.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentItem.imageUrl}
            alt={currentItem.label}
            className="w-28 h-28 object-contain"
          />
        ) : (
          <span className="text-7xl font-bold text-indigo-700">
            {currentItem.label}
          </span>
        )}
      </div>

      {/* Star animation */}
      {starVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <span className="text-8xl animate-bounce">⭐</span>
        </div>
      )}

      {/* Mic button */}
      <button
        onClick={handleMicPress}
        className={`
          w-24 h-24 min-w-[64px] min-h-[64px]
          rounded-full shadow-xl
          flex items-center justify-center
          text-5xl
          transition-all duration-200 active:scale-95
          ${
            isListening
              ? 'bg-red-500 animate-pulse'
              : 'bg-green-500 hover:bg-green-400'
          }
        `}
        aria-label={isListening ? 'Berhenti merakam' : 'Mula bercakap'}
      >
        🎤
      </button>

      {isListening && (
        <p className="text-yellow-300 text-lg font-bold animate-pulse">
          Sedang mendengar...
        </p>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-3 max-w-xs">
          <p className="text-white text-center text-lg font-medium">
            {feedback}
          </p>
        </div>
      )}

      {/* Progress */}
      <p className="text-white/60 text-sm">
        {currentIndex + 1} / {items.length}
      </p>
    </div>
  )
}
