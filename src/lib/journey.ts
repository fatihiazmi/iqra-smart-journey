export type NodeType = 'level' | 'review'
export type NodeStatus = 'completed' | 'active' | 'locked'

export interface JourneyNode {
  id: string
  type: NodeType
  level: number
  reviewLevels?: number[]
  status: NodeStatus
  stars?: number
}

function computeStars(
  status: NodeStatus,
  _level: number,
  _currentLevel: number,
  currentPage: number,
  pagesPerLevel: number
): number {
  if (status === 'locked') return 0
  if (status === 'completed') return 3

  // Active level: stars based on page progress
  const progress = pagesPerLevel > 0 ? currentPage / pagesPerLevel : 0
  if (progress <= 0.33) return 0
  if (progress <= 0.66) return 1
  return 2
}

function levelStatus(
  level: number,
  currentLevel: number
): NodeStatus {
  if (level < currentLevel) return 'completed'
  if (level === currentLevel) return 'active'
  return 'locked'
}

export function buildJourneyNodes(
  totalLevels: number,
  config: {
    currentLevel: number
    currentPage: number
    pagesPerLevel: number
  }
): JourneyNode[] {
  const { currentLevel, currentPage, pagesPerLevel } = config
  const nodes: JourneyNode[] = []

  for (let level = 0; level < totalLevels; level++) {
    const status = levelStatus(level, currentLevel)

    nodes.push({
      id: `level-${level}`,
      type: 'level',
      level,
      status,
      stars: computeStars(status, level, currentLevel, currentPage, pagesPerLevel),
    })

    // Insert review node after every 2nd level (after odd-indexed levels: 1, 3, 5...)
    if (level % 2 === 1) {
      const reviewLevels = Array.from({ length: level + 1 }, (_, i) => i)
      // Review node status follows the level it's placed after
      const reviewStatus = levelStatus(level, currentLevel)

      nodes.push({
        id: `review-after-${level}`,
        type: 'review',
        level,
        reviewLevels,
        status: reviewStatus,
      })
    }
  }

  return nodes
}
