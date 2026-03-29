'use client'

import { useState, useCallback, useEffect } from 'react'
import { Howl } from 'howler'

interface ContentItem {
  id: string
  label: string
  imageUrl: string | null
  audioUrl: string
}

interface DengarModeProps {
  items: ContentItem[]
  onComplete: () => void
}

export default function DengarMode({ items, onComplete }: DengarModeProps) {
  const [tapped, setTapped] = useState<Set<string>>(new Set())

  const handleTap = useCallback(
    (item: ContentItem) => {
      // Play audio
      const sound = new Howl({ src: [item.audioUrl] })
      sound.play()

      setTapped((prev) => {
        const next = new Set(prev)
        next.add(item.id)
        return next
      })
    },
    []
  )

  // Check if all items tapped
  useEffect(() => {
    if (tapped.size === items.length && items.length > 0) {
      const timer = setTimeout(() => {
        onComplete()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [tapped, items.length, onComplete])

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Dengar 👂</h2>
        <p className="mt-1 text-lg text-white/80">
          Tekan setiap huruf untuk dengar!
        </p>
      </div>

      {/* Grid of huruf cards */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {items.map((item) => {
          const isTapped = tapped.has(item.id)
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
                ${isTapped ? 'ring-4 ring-green-400' : ''}
              `}
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

      {/* Progress hint */}
      <p className="text-white/60 text-sm">
        {tapped.size} / {items.length} didengar
      </p>
    </div>
  )
}
