'use client'

import { useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DengarMode from './dengar-mode'
import CariMode from './cari-mode'
import SebutMode from './sebut-mode'

// Mock content — will be replaced with real Supabase data
const MOCK_CONTENT = [
  {
    id: '1',
    label: 'ا',
    imageUrl: null,
    audioUrl: '/audio/alif.mp3',
  },
  {
    id: '2',
    label: 'ب',
    imageUrl: null,
    audioUrl: '/audio/ba.mp3',
  },
  {
    id: '3',
    label: 'ت',
    imageUrl: null,
    audioUrl: '/audio/ta.mp3',
  },
  {
    id: '4',
    label: 'ث',
    imageUrl: null,
    audioUrl: '/audio/tha.mp3',
  },
  {
    id: '5',
    label: 'ج',
    imageUrl: null,
    audioUrl: '/audio/jim.mp3',
  },
  {
    id: '6',
    label: 'ح',
    imageUrl: null,
    audioUrl: '/audio/ha.mp3',
  },
]

type Mode = 'dengar' | 'cari' | 'sebut' | 'complete'

const MODE_STEPS: Mode[] = ['dengar', 'cari', 'sebut']

export default function LearningPage() {
  const params = useParams()
  const router = useRouter()
  const level = Number(params.level)
  const page = Number(params.page)

  const [currentMode, setCurrentMode] = useState<Mode>('dengar')
  const [totalStars, setTotalStars] = useState(0)
  const [showHome, setShowHome] = useState(false)

  const advanceMode = useCallback(() => {
    const currentIdx = MODE_STEPS.indexOf(currentMode as 'dengar' | 'cari' | 'sebut')
    if (currentIdx < MODE_STEPS.length - 1) {
      setCurrentMode(MODE_STEPS[currentIdx + 1])
    } else {
      setCurrentMode('complete')
    }
  }, [currentMode])

  const handleDengarComplete = useCallback(() => {
    setTotalStars((s) => s + 1)
    advanceMode()
  }, [advanceMode])

  const handleCariComplete = useCallback(
    (correctCount: number, totalCount: number) => {
      // Award stars based on accuracy
      const ratio = correctCount / totalCount
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1
      setTotalStars((s) => s + stars)
      advanceMode()
    },
    [advanceMode]
  )

  const handleSebutComplete = useCallback(
    (correctCount: number, totalCount: number) => {
      const ratio = correctCount / totalCount
      const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1
      setTotalStars((s) => s + stars)
      setCurrentMode('complete')

      // Show home button after delay
      setTimeout(() => setShowHome(true), 2000)
    },
    []
  )

  // Mode indicator dots
  const modeIndex = currentMode === 'complete' ? 3 : MODE_STEPS.indexOf(currentMode as 'dengar' | 'cari' | 'sebut')

  return (
    <div className="flex flex-col items-center gap-4 pt-4">
      {/* Level / Page label */}
      <p className="text-white/60 text-sm font-medium">
        Iqra&apos; {level} — Muka surat {page}
      </p>

      {/* Mode indicator dots */}
      {currentMode !== 'complete' && (
        <div className="flex gap-3">
          {MODE_STEPS.map((step, i) => (
            <div
              key={step}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i === modeIndex
                  ? 'bg-yellow-400 scale-125'
                  : i < modeIndex
                    ? 'bg-green-400'
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Active mode */}
      {currentMode === 'dengar' && (
        <DengarMode items={MOCK_CONTENT} onComplete={handleDengarComplete} />
      )}

      {currentMode === 'cari' && (
        <CariMode items={MOCK_CONTENT} onComplete={handleCariComplete} />
      )}

      {currentMode === 'sebut' && (
        <SebutMode items={MOCK_CONTENT} onComplete={handleSebutComplete} />
      )}

      {/* Completion screen */}
      {currentMode === 'complete' && (
        <div className="flex flex-col items-center gap-6 pt-8 animate-fade-in">
          {/* Stars */}
          <div className="flex gap-2">
            {Array.from({ length: totalStars }, (_, i) => (
              <span key={i} className="text-5xl animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}>
                ⭐
              </span>
            ))}
          </div>

          {/* Bagus message */}
          <h2 className="text-4xl font-bold text-yellow-300">Bagus!</h2>

          {/* Mascot break prompt */}
          <div className="bg-white/20 backdrop-blur rounded-3xl px-8 py-6 max-w-xs text-center">
            <span className="text-6xl block mb-3">🐰</span>
            <p className="text-white text-xl font-medium">
              Rehat dulu ya!
            </p>
            <p className="text-white/70 mt-1">
              Kamu dah buat {totalStars} bintang!
            </p>
          </div>

          {/* Delayed home button */}
          {showHome && (
            <button
              onClick={() => router.push('/learn')}
              className="
                mt-4 px-8 py-4
                bg-white rounded-2xl shadow-xl
                text-xl font-bold text-indigo-600
                min-h-[64px] min-w-[64px]
                active:scale-95 transition-transform
                animate-fade-in
              "
            >
              Kembali 🏠
            </button>
          )}
        </div>
      )}
    </div>
  )
}
