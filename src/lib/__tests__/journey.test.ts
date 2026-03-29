import { describe, it, expect } from 'vitest'
import { buildJourneyNodes, type JourneyNode, type NodeType } from '../journey'

describe('buildJourneyNodes', () => {
  it('creates level nodes for each level from 0 to totalLevels-1', () => {
    const nodes = buildJourneyNodes(4, {
      currentLevel: 0,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const levelNodes = nodes.filter((n: JourneyNode) => n.type === 'level')
    expect(levelNodes).toHaveLength(4)
    expect(levelNodes.map((n: JourneyNode) => n.level)).toEqual([0, 1, 2, 3])
  })

  it('inserts review nodes after every 2 levels (after level 1, 3, 5...)', () => {
    const nodes = buildJourneyNodes(6, {
      currentLevel: 0,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const reviewNodes = nodes.filter((n: JourneyNode) => n.type === 'review')
    // After level 1 (reviews 0,1), after level 3 (reviews 0-3), after level 5 (reviews 0-5)
    expect(reviewNodes).toHaveLength(3)

    expect(reviewNodes[0].reviewLevels).toEqual([0, 1])
    expect(reviewNodes[1].reviewLevels).toEqual([0, 1, 2, 3])
    expect(reviewNodes[2].reviewLevels).toEqual([0, 1, 2, 3, 4, 5])
  })

  it('marks current level as active', () => {
    const nodes = buildJourneyNodes(4, {
      currentLevel: 2,
      currentPage: 3,
      pagesPerLevel: 5,
    })

    const activeNodes = nodes.filter((n: JourneyNode) => n.status === 'active')
    expect(activeNodes).toHaveLength(1)
    expect(activeNodes[0].type).toBe('level')
    expect(activeNodes[0].level).toBe(2)
  })

  it('marks levels below current as completed', () => {
    const nodes = buildJourneyNodes(5, {
      currentLevel: 3,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const completedLevels = nodes.filter(
      (n) => n.type === 'level' && n.status === 'completed'
    )
    expect(completedLevels).toHaveLength(3)
    expect(completedLevels.map((n) => n.level)).toEqual([0, 1, 2])
  })

  it('marks levels above current as locked', () => {
    const nodes = buildJourneyNodes(5, {
      currentLevel: 1,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const lockedLevels = nodes.filter(
      (n) => n.type === 'level' && n.status === 'locked'
    )
    expect(lockedLevels).toHaveLength(3)
    expect(lockedLevels.map((n) => n.level)).toEqual([2, 3, 4])
  })

  it('sets review node status based on the level it follows', () => {
    const nodes = buildJourneyNodes(6, {
      currentLevel: 4,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const reviewNodes = nodes.filter((n: JourneyNode) => n.type === 'review')
    // Review after level 1 -> completed (level 1 < 4)
    expect(reviewNodes[0].status).toBe('completed')
    // Review after level 3 -> completed (level 3 < 4)
    expect(reviewNodes[1].status).toBe('completed')
    // Review after level 5 -> locked (level 5 > 4)
    expect(reviewNodes[2].status).toBe('locked')
  })

  it('assigns stars to completed levels', () => {
    const nodes = buildJourneyNodes(3, {
      currentLevel: 2,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const completedLevels = nodes.filter(
      (n) => n.type === 'level' && n.status === 'completed'
    )
    completedLevels.forEach((n) => {
      expect(n.stars).toBe(3)
    })
  })

  it('assigns partial stars to active level based on page progress', () => {
    const nodes = buildJourneyNodes(3, {
      currentLevel: 1,
      currentPage: 3,
      pagesPerLevel: 6,
    })

    const activeNode = nodes.find((n) => n.status === 'active')!
    // 3/6 = 50% -> 1 star (0-33% = 0, 34-66% = 1, 67-99% = 2)
    expect(activeNode.stars).toBe(1)
  })

  it('gives 0 stars to locked levels', () => {
    const nodes = buildJourneyNodes(3, {
      currentLevel: 0,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const lockedLevelNodes = nodes.filter(
      (n) => n.type === 'level' && n.status === 'locked'
    )
    lockedLevelNodes.forEach((n) => {
      expect(n.stars).toBe(0)
    })
  })

  it('produces nodes in correct order: level 0, level 1, review, level 2, ...', () => {
    const nodes = buildJourneyNodes(4, {
      currentLevel: 0,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    // level 0, level 1, review(0,1), level 2, level 3, review(0-3)
    expect(nodes.map((n) => n.type)).toEqual([
      'level',
      'level',
      'review',
      'level',
      'level',
      'review',
    ])
  })

  it('assigns unique ids to all nodes', () => {
    const nodes = buildJourneyNodes(6, {
      currentLevel: 0,
      currentPage: 0,
      pagesPerLevel: 5,
    })

    const ids = nodes.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
