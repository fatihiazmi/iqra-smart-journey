'use client'

import { useState, useCallback, useRef } from 'react'

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
}

interface UseSpeechRecognitionReturn {
  isListening: boolean
  result: SpeechRecognitionResult | null
  error: string | null
  startListening: () => void
  stopListening: () => void
}

export function useSpeechRecognition(
  lang: string = 'ar-SA'
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<SpeechRecognitionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = useCallback(() => {
    setError(null)
    setResult(null)

    const SpeechRecognitionAPI =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined

    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = lang
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const first = event.results[0]?.[0]
      if (first) {
        setResult({
          transcript: first.transcript,
          confidence: first.confidence,
        })
      }
      setIsListening(false)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [lang])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  return { isListening, result, error, startListening, stopListening }
}
