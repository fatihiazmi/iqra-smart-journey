'use client'

import { useCallback } from 'react'
import { TracingCanvas } from '@/components/tracing-canvas'
import type { TraceResult, TracePoint, TracePath } from '@/lib/tracing-analyzer'

interface WritingTestResult {
  accuracy: number
  isRtl: boolean
  strokeData: TracePoint[]
}

interface WritingTestProps {
  huruf: string
  templatePath: TracePath
  onResult: (result: WritingTestResult) => void
}

export function WritingTest({ huruf, templatePath, onResult }: WritingTestProps) {
  const handleComplete = useCallback(
    (result: TraceResult, strokeData: TracePoint[]) => {
      onResult({
        accuracy: result.accuracy,
        isRtl: result.isRtl,
        strokeData,
      })
    },
    [onResult]
  )

  return (
    <div className="flex flex-col items-center gap-6 px-4">
      {/* Instruction */}
      <div className="text-center">
        <p className="text-xl font-bold text-white">
          Ikut titik-titik untuk menulis{' '}
          <span className="text-3xl text-yellow-300">{huruf}</span>!
        </p>
        <p className="mt-1 text-sm text-white/70">
          <span className="inline-block rounded bg-white/20 px-2 py-0.5">
            ← Tulis dari kanan ke kiri
          </span>
        </p>
      </div>

      {/* Canvas */}
      <div className="rounded-2xl bg-white/10 p-3 backdrop-blur">
        <TracingCanvas
          templatePath={templatePath}
          tolerance={25}
          width={320}
          height={320}
          onComplete={handleComplete}
        />
      </div>
    </div>
  )
}
