'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Howl } from 'howler'

interface ContentItem {
  id: string
  label: string
  imageUrl: string | null
  audioUrl: string
}

interface CariModeProps {
  items: ContentItem[]
  onComplete: (correctCount: number, totalCount: number) => void
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function CariMode({ items, onComplete }: CariModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [jigglingId, setJigglingId] = useState<string | null>(null)
  const [starVisible, setStarVisible] = useState(false)

  const shuffledItems = useMemo(() => shuffleArray(items), [items])
  const targetItem = items[currentIndex] ?? null

  // Play target audio on mount and when target changes
  const playTargetAudio = useCallback(() => {
    if (targetItem) {
      const sound = new Howl({ src: [targetItem.audioUrl] })
      sound.play()
    }
  }, [targetItem])

  useEffect(() => {
    if (targetItem) {
      playTargetAudio()
    }
  }, [currentIndex, targetItem, playTargetAudio])

  const handleTap = useCallback(
    (item: ContentItem) => {
      if (!targetItem) return

      if (item.id === targetItem.id) {
        // Correct!
        setCorrectCount((prev) => prev + 1)
        setStarVisible(true)

        const nextIndex = currentIndex + 1
        setTimeout(() => {
          setStarVisible(false)
          if (nextIndex >= items.length) {
            onComplete(correctCount + 1, items.length)
          } else {
            setCurrentIndex(nextIndex)
          }
        }, 800)
      } else {
        // Wrong — jiggle the card and play its sound so kid learns
        setJigglingId(item.id)
        const sound = new Howl({ src: [item.audioUrl] })
        sound.play()
        setTimeout(() => setJigglingId(null), 500)
      }
    },
    [targetItem, currentIndex, items.length, correctCount, onComplete]
  )

  if (!targetItem) return null

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Cari 🔍</h2>
        <p className="mt-1 text-lg text-white/80">
          Dengar dan cari huruf yang betul!
        </p>
      </div>

      {/* Replay button */}
      <button
        onClick={playTargetAudio}
        className="w-16 h-16 min-w-[64px] min-h-[64px] rounded-full bg-yellow-400 flex items-center justify-center text-3xl shadow-lg active:scale-95 transition-transform"
        aria-label="Main semula audio"
      >
        🔊
      </button>

      {/* Star animation */}
      {starVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <span className="text-8xl animate-bounce">⭐</span>
        </div>
      )}

      {/* Shuffled grid */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {shuffledItems.map((item) => {
          const isJiggling = jigglingId === item.id
          return (
            <button
              key={item.id}
              onClick={() => handleTap(item)}
              className={`
                flex flex-col items-center justify-center
                w-24 h-24 mx-auto
                bg-white rounded-2xl shadow-lg
                transition-all duration-200 active:scale-95
                min-w-[64px] min-h-[64px]
                ${isJiggling ? 'animate-[jiggle_0.3s_ease-in-out]' : ''}
              `}
              style={
                isJiggling
                  ? {
                      animation: 'jiggle 0.3s ease-in-out',
                    }
                  : undefined
              }
            >
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.label}
                  className="w-14 h-14 object-contain"
                />
              ) : (
                <span className="text-4xl font-bold text-indigo-700">
                  {item.label}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Progress */}
      <p className="text-white/60 text-sm">
        {currentIndex + 1} / {items.length}
      </p>

      {/* Jiggle keyframes injected via style tag */}
      <style jsx>{`
        @keyframes jiggle {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-8px);
          }
          50% {
            transform: translateX(8px);
          }
          75% {
            transform: translateX(-4px);
          }
        }
      `}</style>
    </div>
  )
}
