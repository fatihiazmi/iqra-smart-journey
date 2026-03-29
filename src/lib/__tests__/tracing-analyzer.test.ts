import { describe, it, expect } from 'vitest'
import {
  analyzeTrace,
  type TracePoint,
  type TracePath,
} from '../tracing-analyzer'

describe('analyzeTrace', () => {
  const templatePath: TracePath = [
    { x: 300, y: 100 },
    { x: 250, y: 100 },
    { x: 200, y: 100 },
    { x: 150, y: 100 },
    { x: 100, y: 100 },
  ]

  it('returns high accuracy for trace within tolerance (right-to-left)', () => {
    const userTrace: TracePoint[] = [
      { x: 298, y: 102 },
      { x: 248, y: 98 },
      { x: 202, y: 101 },
      { x: 149, y: 99 },
      { x: 101, y: 100 },
    ]

    const result = analyzeTrace(userTrace, templatePath, 20)

    expect(result.accuracy).toBeGreaterThanOrEqual(0.9)
    expect(result.isRtl).toBe(true)
    result.pointResults.forEach((pr) => {
      expect(pr.withinTolerance).toBe(true)
    })
  })

  it('returns low accuracy for trace far from template', () => {
    const userTrace: TracePoint[] = [
      { x: 300, y: 300 },
      { x: 250, y: 300 },
      { x: 200, y: 300 },
      { x: 150, y: 300 },
      { x: 100, y: 300 },
    ]

    const result = analyzeTrace(userTrace, templatePath, 20)

    expect(result.accuracy).toBeLessThanOrEqual(0.1)
    result.pointResults.forEach((pr) => {
      expect(pr.withinTolerance).toBe(false)
      expect(pr.distance).toBeGreaterThan(20)
    })
  })

  it('detects left-to-right as incorrect direction', () => {
    const userTrace: TracePoint[] = [
      { x: 100, y: 100 },
      { x: 150, y: 100 },
      { x: 200, y: 100 },
      { x: 250, y: 100 },
      { x: 300, y: 100 },
    ]

    const result = analyzeTrace(userTrace, templatePath, 20)

    expect(result.isRtl).toBe(false)
  })

  it('handles empty user trace', () => {
    const result = analyzeTrace([], templatePath, 20)

    expect(result.accuracy).toBe(0)
    expect(result.isRtl).toBe(false)
    expect(result.pointResults).toEqual([])
  })

  it('handles empty template path', () => {
    const userTrace: TracePoint[] = [{ x: 100, y: 100 }]
    const result = analyzeTrace(userTrace, [], 20)

    expect(result.accuracy).toBe(0)
    expect(result.isRtl).toBe(false)
  })

  it('handles both empty arrays', () => {
    const result = analyzeTrace([], [], 20)

    expect(result.accuracy).toBe(0)
    expect(result.isRtl).toBe(false)
    expect(result.pointResults).toEqual([])
  })
})
