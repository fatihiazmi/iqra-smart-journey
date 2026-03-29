export interface TracePoint {
  x: number
  y: number
}

export type TracePath = TracePoint[]

export interface PointResult {
  point: TracePoint
  distance: number
  withinTolerance: boolean
}

export interface TraceResult {
  accuracy: number // 0-1
  isRtl: boolean
  pointResults: PointResult[]
}

function distanceBetween(a: TracePoint, b: TracePoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function findNearestDistance(point: TracePoint, template: TracePath): number {
  let min = Infinity
  for (const tp of template) {
    const d = distanceBetween(point, tp)
    if (d < min) min = d
  }
  return min
}

/**
 * Analyze a user's trace against a template path.
 *
 * For each user point, finds the nearest template point and measures distance.
 * accuracy = count within tolerance / total points
 * isRtl = first point x > last point x
 *
 * Designed as a swappable interface — can be replaced with ML later.
 */
export function analyzeTrace(
  userTrace: TracePoint[],
  templatePath: TracePath,
  tolerance: number
): TraceResult {
  if (userTrace.length === 0 || templatePath.length === 0) {
    return {
      accuracy: 0,
      isRtl: false,
      pointResults: [],
    }
  }

  const pointResults: PointResult[] = userTrace.map((point) => {
    const distance = findNearestDistance(point, templatePath)
    return {
      point,
      distance,
      withinTolerance: distance <= tolerance,
    }
  })

  const withinCount = pointResults.filter((pr) => pr.withinTolerance).length
  const accuracy = withinCount / pointResults.length

  const isRtl = userTrace[0].x > userTrace[userTrace.length - 1].x

  return { accuracy, isRtl, pointResults }
}
