'use client'

import { useRef, useCallback, useEffect, useState } from 'react'
import {
  analyzeTrace,
  type TracePoint,
  type TracePath,
  type TraceResult,
} from '@/lib/tracing-analyzer'

interface TracingCanvasProps {
  templatePath: TracePath
  tolerance?: number
  width?: number
  height?: number
  onComplete?: (result: TraceResult, strokeData: TracePoint[]) => void
}

export function TracingCanvas({
  templatePath,
  tolerance = 20,
  width = 400,
  height = 400,
  onComplete,
}: TracingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)
  const strokeData = useRef<TracePoint[]>([])
  const [hasDrawn, setHasDrawn] = useState(false)

  const getPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent): TracePoint => {
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

  const findNearestTemplateDistance = useCallback(
    (point: TracePoint): number => {
      let min = Infinity
      for (const tp of templatePath) {
        const d = Math.sqrt((point.x - tp.x) ** 2 + (point.y - tp.y) ** 2)
        if (d < min) min = d
      }
      return min
    },
    [templatePath]
  )

  const drawTemplatePath = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || templatePath.length === 0) return
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw dotted template path
    ctx.beginPath()
    ctx.setLineDash([8, 8])
    ctx.strokeStyle = '#94a3b8' // slate-400
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.moveTo(templatePath[0].x, templatePath[0].y)
    for (let i = 1; i < templatePath.length; i++) {
      ctx.lineTo(templatePath[i].x, templatePath[i].y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Draw start indicator
    ctx.beginPath()
    ctx.arc(templatePath[0].x, templatePath[0].y, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#22c55e' // green-500
    ctx.fill()
  }, [templatePath])

  useEffect(() => {
    drawTemplatePath()
  }, [drawTemplatePath])

  const drawSegment = useCallback(
    (from: TracePoint, to: TracePoint, withinTolerance: boolean) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')!

      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = withinTolerance ? '#22c55e' : '#ef4444' // green / red
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
    },
    []
  )

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      isDrawing.current = true
      strokeData.current = []
      setHasDrawn(false)

      // Redraw template to clear previous strokes
      drawTemplatePath()

      const point = getPoint(e)
      strokeData.current.push(point)
    },
    [getPoint, drawTemplatePath]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing.current) return

      const point = getPoint(e)
      const prev = strokeData.current[strokeData.current.length - 1]
      strokeData.current.push(point)

      const distance = findNearestTemplateDistance(point)
      drawSegment(prev, point, distance <= tolerance)
    },
    [getPoint, findNearestTemplateDistance, drawSegment, tolerance]
  )

  const handleEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing.current) return
      isDrawing.current = false

      if (strokeData.current.length < 2) return

      setHasDrawn(true)
      const result = analyzeTrace(strokeData.current, templatePath, tolerance)
      onComplete?.(result, [...strokeData.current])
    },
    [templatePath, tolerance, onComplete]
  )

  const handleReset = useCallback(() => {
    strokeData.current = []
    setHasDrawn(false)
    drawTemplatePath()
  }, [drawTemplatePath])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="touch-none rounded-xl border-2 border-slate-200 bg-white"
        style={{ width, height }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      {hasDrawn && (
        <button
          onClick={handleReset}
          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
        >
          Cuba lagi
        </button>
      )}
    </div>
  )
}
