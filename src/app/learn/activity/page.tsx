'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ColoringCanvas } from '@/components/coloring-canvas'

// Mock data for current huruf activity
const MOCK_HURUF = {
  label: 'ا',
  outlineImageUrl: '/outlines/alif.png',
  audioUrl: '/audio/alif.mp3',
}

export default function ActivityPage() {
  const [completedImage, setCompletedImage] = useState<string | null>(null)

  if (completedImage) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 px-4 pt-12 text-center">
        {/* Celebration screen */}
        <span className="text-7xl" role="img" aria-label="celebration">
          🎉
        </span>
        <h1 className="text-4xl font-bold text-white drop-shadow">
          Cantiknya!
        </h1>
        <p className="text-xl text-white/90">
          Huruf kamu dah masuk galeri!
        </p>

        {/* Preview of completed artwork */}
        <div className="overflow-hidden rounded-2xl border-4 border-white/30 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={completedImage}
            alt={`Colored huruf ${MOCK_HURUF.label}`}
            className="h-48 w-48 object-cover"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/learn/gallery"
            className="min-h-[64px] rounded-2xl bg-yellow-400 px-8 py-4 text-xl font-bold text-yellow-900 shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Lihat Galeri 🏆
          </Link>
          <button
            onClick={() => setCompletedImage(null)}
            className="min-h-[48px] rounded-xl bg-white/20 px-6 py-3 text-lg font-medium text-white transition-transform hover:scale-105 active:scale-95"
          >
            Warna lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 px-4 pt-6">
      <h1 className="text-2xl font-bold text-white">Warna Huruf</h1>
      <ColoringCanvas
        outlineImageUrl={MOCK_HURUF.outlineImageUrl}
        hurufLabel={MOCK_HURUF.label}
        hurufAudioUrl={MOCK_HURUF.audioUrl}
        unlockedColors={[]}
        onComplete={(imageData) => setCompletedImage(imageData)}
      />
    </div>
  )
}
