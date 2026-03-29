'use client'

import { useRef, useCallback, useState, useEffect } from 'react'
import { Howl } from 'howler'

interface ColoringCanvasProps {
  outlineImageUrl: string
  hurufLabel: string
  hurufAudioUrl: string
  unlockedColors: string[]
  onComplete: (imageData: string) => void
}

const DEFAULT_COLORS = ['#ef4444', '#3b82f6', '#22c55e']
const BRUSH_RADIUS = 12

export function ColoringCanvas({
  outlineImageUrl,
  hurufLabel,
  hurufAudioUrl,
  unlockedColors,
  onComplete,
}: ColoringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0])
  const soundRef = useRef<Howl | null>(null)
  const outlineImageRef = useRef<HTMLImageElement | null>(null)

  // All available colors = defaults + unlocked
  const allColors = [...DEFAULT_COLORS, ...unlockedColors]

  // Load audio
  useEffect(() => {
    soundRef.current = new Howl({ src: [hurufAudioUrl] })
    return () => {
      soundRef.current?.unload()
    }
  }, [hurufAudioUrl])

  // Load outline image and draw it
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      outlineImageRef.current = img
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = outlineImageUrl
  }, [outlineImageUrl])

  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height

      if ('touches' in e) {
        const touch = e.touches[0] || e.changedTouches[0]
        return {
          x: (touch.clientX - rect.left) * scaleX,
          y: (touch.clientY - rect.top) * scaleY,
        }
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    },
    []
  )

  const paint = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!

      ctx.beginPath()
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = selectedColor
      ctx.fill()
    },
    [selectedColor]
  )

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      isDrawing.current = true
      const pt = getPoint(e)
      paint(pt.x, pt.y)
    },
    [getPoint, paint]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing.current) return
      const pt = getPoint(e)
      paint(pt.x, pt.y)
    },
    [getPoint, paint]
  )

  const handleEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    isDrawing.current = false
  }, [])

  const handleColorSelect = useCallback(
    (color: string) => {
      setSelectedColor(color)
      soundRef.current?.play()
    },
    []
  )

  const handleComplete = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Redraw outline on top so it shows through the coloring
    if (outlineImageRef.current) {
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(outlineImageRef.current, 0, 0, canvas.width, canvas.height)
    }

    const imageData = canvas.toDataURL('image/png')
    onComplete(imageData)
  }, [onComplete])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Huruf label */}
      <h2 className="text-4xl font-bold text-white drop-shadow">{hurufLabel}</h2>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="touch-none rounded-2xl border-4 border-white/30 bg-white shadow-lg"
        style={{ width: 320, height: 320, maxWidth: '90vw', maxHeight: '90vw' }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />

      {/* Color palette */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {allColors.map((color) => (
          <button
            key={color}
            onClick={() => handleColorSelect(color)}
            className={`flex h-16 w-16 items-center justify-center rounded-full border-4 transition-transform ${
              selectedColor === color
                ? 'scale-110 border-white shadow-lg'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}

        {/* Locked color placeholders (show 2 locked slots) */}
        {[0, 1].map((i) => (
          <div
            key={`locked-${i}`}
            className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-transparent bg-gray-300"
            aria-label="Locked color"
          >
            <span className="text-2xl">🔒</span>
          </div>
        ))}
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        className="min-h-[64px] min-w-[200px] rounded-2xl bg-yellow-400 px-8 py-4 text-2xl font-bold text-yellow-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        Siap! ✅
      </button>
    </div>
  )
}
