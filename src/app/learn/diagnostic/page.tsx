'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ReadingTest } from './reading-test'
import { WritingTest } from './writing-test'
import { saveDiagnosticAttempt, uploadAudioRecording } from '@/lib/actions/diagnostic'
import type { TracePath } from '@/lib/tracing-analyzer'

// ─── Sample huruf data per level ────────────────────────────────────────────
// Each level has a set of test huruf with template tracing paths
// Levels 1-6 map to Iqra' books; we start adaptive probing at level 3
interface HurufSample {
  huruf: string
  templatePath: TracePath
}

const LEVEL_SAMPLES: Record<number, HurufSample[]> = {
  1: [
    {
      huruf: 'ا',
      templatePath: [
        { x: 160, y: 60 },
        { x: 160, y: 280 },
      ],
    },
    {
      huruf: 'ب',
      templatePath: [
        { x: 260, y: 160 },
        { x: 200, y: 160 },
        { x: 140, y: 170 },
        { x: 100, y: 190 },
        { x: 80, y: 210 },
      ],
    },
  ],
  2: [
    {
      huruf: 'ج',
      templatePath: [
        { x: 240, y: 100 },
        { x: 200, y: 80 },
        { x: 160, y: 100 },
        { x: 140, y: 160 },
        { x: 180, y: 200 },
      ],
    },
    {
      huruf: 'د',
      templatePath: [
        { x: 220, y: 140 },
        { x: 160, y: 120 },
        { x: 120, y: 150 },
        { x: 120, y: 200 },
      ],
    },
  ],
  3: [
    {
      huruf: 'ر',
      templatePath: [
        { x: 180, y: 120 },
        { x: 160, y: 160 },
        { x: 140, y: 220 },
        { x: 130, y: 260 },
      ],
    },
    {
      huruf: 'س',
      templatePath: [
        { x: 260, y: 180 },
        { x: 230, y: 160 },
        { x: 200, y: 180 },
        { x: 170, y: 160 },
        { x: 140, y: 180 },
        { x: 110, y: 160 },
        { x: 80, y: 180 },
      ],
    },
  ],
  4: [
    {
      huruf: 'ص',
      templatePath: [
        { x: 260, y: 160 },
        { x: 220, y: 140 },
        { x: 180, y: 160 },
        { x: 160, y: 200 },
        { x: 180, y: 240 },
        { x: 120, y: 240 },
        { x: 80, y: 200 },
      ],
    },
    {
      huruf: 'ط',
      templatePath: [
        { x: 240, y: 180 },
        { x: 200, y: 140 },
        { x: 160, y: 120 },
        { x: 120, y: 140 },
        { x: 100, y: 180 },
        { x: 120, y: 220 },
        { x: 180, y: 240 },
      ],
    },
  ],
  5: [
    {
      huruf: 'ع',
      templatePath: [
        { x: 200, y: 100 },
        { x: 160, y: 140 },
        { x: 140, y: 200 },
        { x: 160, y: 260 },
        { x: 200, y: 280 },
      ],
    },
    {
      huruf: 'ف',
      templatePath: [
        { x: 220, y: 120 },
        { x: 180, y: 100 },
        { x: 140, y: 120 },
        { x: 120, y: 160 },
        { x: 140, y: 200 },
        { x: 100, y: 220 },
      ],
    },
  ],
  6: [
    {
      huruf: 'ق',
      templatePath: [
        { x: 220, y: 120 },
        { x: 180, y: 100 },
        { x: 140, y: 120 },
        { x: 120, y: 160 },
        { x: 140, y: 200 },
        { x: 100, y: 240 },
      ],
    },
    {
      huruf: 'ك',
      templatePath: [
        { x: 240, y: 160 },
        { x: 200, y: 120 },
        { x: 160, y: 100 },
        { x: 120, y: 120 },
        { x: 100, y: 160 },
        { x: 120, y: 200 },
      ],
    },
  ],
}

type Phase = 'intro' | 'reading' | 'writing' | 'result'

function clampLevel(level: number): number {
  return Math.max(1, Math.min(6, level))
}

export default function DiagnosticPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentLevel, setCurrentLevel] = useState(3) // start at mid-level
  const [sampleIndex, setSampleIndex] = useState(0)
  const [suggestedLevel, setSuggestedLevel] = useState(3)
  const [isSaving, setIsSaving] = useState(false)

  // Track scores across rounds for final suggestion
  const scoresRef = useRef<{ level: number; correct: boolean }[]>([])

  const currentSample =
    LEVEL_SAMPLES[clampLevel(currentLevel)]?.[sampleIndex] ??
    LEVEL_SAMPLES[3][0]

  // ─── Adaptive level logic ───────────────────────────────────────────
  const adjustLevel = useCallback(
    (correct: boolean) => {
      scoresRef.current.push({ level: currentLevel, correct })

      if (correct) {
        // Move up if possible
        if (currentLevel < 6) {
          setCurrentLevel((l) => l + 1)
        }
      } else {
        // Move down if possible
        if (currentLevel > 1) {
          setCurrentLevel((l) => l - 1)
        }
      }
    },
    [currentLevel]
  )

  const computeSuggestedLevel = useCallback(() => {
    const scores = scoresRef.current
    if (scores.length === 0) return 3

    // The suggested level is the highest level where the child answered correctly
    let highest = 1
    for (const s of scores) {
      if (s.correct && s.level > highest) {
        highest = s.level
      }
    }
    return highest
  }, [])

  // ─── Reading result handler ─────────────────────────────────────────
  const handleReadingResult = useCallback(
    async (result: { correct: boolean; confidence: number; audioBlob: Blob | null }) => {
      adjustLevel(result.correct)

      // Upload audio in the background (non-blocking)
      if (result.audioBlob) {
        const formData = new FormData()
        formData.append('audio', result.audioBlob, 'recording.webm')
        uploadAudioRecording(formData).catch(() => {
          // Audio upload is best-effort; don't block flow
        })
      }

      // Save reading attempt
      const score = result.correct ? result.confidence * 100 : 0
      saveDiagnosticAttempt({
        diagnosticType: 'reading',
        webSpeechResult: {
          correct: result.correct,
          confidence: result.confidence,
        },
        score,
        suggestedLevel: currentLevel,
      }).catch(() => {
        // Best-effort save
      })

      // Move to writing phase
      setSampleIndex(0)
      setPhase('writing')
    },
    [adjustLevel, currentLevel]
  )

  // ─── Writing result handler ─────────────────────────────────────────
  const handleWritingResult = useCallback(
    async (result: { accuracy: number; isRtl: boolean; strokeData: { x: number; y: number }[] }) => {
      const correct = result.accuracy >= 0.6
      adjustLevel(correct)

      const score = result.accuracy * 100
      saveDiagnosticAttempt({
        diagnosticType: 'writing',
        canvasData: {
          accuracy: result.accuracy,
          isRtl: result.isRtl,
          strokeCount: result.strokeData.length,
        },
        score,
        suggestedLevel: currentLevel,
      }).catch(() => {
        // Best-effort save
      })

      // Compute and show result
      const level = computeSuggestedLevel()
      setSuggestedLevel(level)
      setPhase('result')
    },
    [adjustLevel, computeSuggestedLevel, currentLevel]
  )

  // ─── Start learning ─────────────────────────────────────────────────
  const handleStartLearning = useCallback(async () => {
    setIsSaving(true)
    // Final upsert of student progress with suggested level
    await saveDiagnosticAttempt({
      diagnosticType: 'reading',
      score: 0,
      suggestedLevel,
    }).catch(() => {})
    setIsSaving(false)
    router.push('/learn')
  }, [suggestedLevel, router])

  // ─── Render phases ──────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 text-center">
        <div className="animate-bounce text-8xl">🐰</div>
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
          Pintu Kembara!
        </h1>
        <p className="text-xl text-white/90">
          Bantu Arnab cari huruf!
        </p>
        <button
          onClick={() => setPhase('reading')}
          className="min-h-[64px] min-w-[200px] rounded-2xl bg-yellow-400 px-8 py-4 text-2xl font-extrabold text-yellow-900 shadow-lg transition-all hover:scale-105 hover:bg-yellow-300 active:scale-95"
        >
          Mula! 🚀
        </button>
      </div>
    )
  }

  if (phase === 'reading') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-3xl">🐰</span>
          <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-bold text-white">
            Tahap {currentLevel}
          </span>
        </div>
        <ReadingTest
          key={`reading-${currentLevel}-${sampleIndex}`}
          huruf={currentSample.huruf}
          onResult={handleReadingResult}
        />
      </div>
    )
  }

  if (phase === 'writing') {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-3xl">🐰</span>
          <span className="rounded-full bg-white/20 px-4 py-1 text-sm font-bold text-white">
            Tahap {currentLevel}
          </span>
        </div>
        <WritingTest
          key={`writing-${currentLevel}-${sampleIndex}`}
          huruf={currentSample.huruf}
          templatePath={currentSample.templatePath}
          onResult={handleWritingResult}
        />
      </div>
    )
  }

  // Result phase
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="text-6xl">
        ⭐ ⭐ ⭐
      </div>
      <h1 className="text-4xl font-extrabold text-white drop-shadow-md">
        Tahniah! 🎉
      </h1>
      <p className="text-xl text-white/90">
        Arnab cadangkan kamu bermula di{' '}
        <span className="font-extrabold text-yellow-300">
          Tahap {suggestedLevel}
        </span>
      </p>
      <div className="text-6xl">🐰</div>
      <button
        onClick={handleStartLearning}
        disabled={isSaving}
        className="min-h-[64px] min-w-[200px] rounded-2xl bg-yellow-400 px-8 py-4 text-2xl font-extrabold text-yellow-900 shadow-lg transition-all hover:scale-105 hover:bg-yellow-300 active:scale-95 disabled:opacity-50"
      >
        {isSaving ? 'Menyimpan...' : 'Mula Belajar! 📖'}
      </button>
    </div>
  )
}
