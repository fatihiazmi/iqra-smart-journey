'use client'

import { useMemo, useEffect, useRef } from 'react'
import { buildJourneyNodes, type JourneyNode, type NodeStatus } from '@/lib/journey'

interface JourneyMapProps {
  totalLevels: number
  currentLevel: number
  currentPage: number
  pagesPerLevel: number
  onNodeTap: (node: JourneyNode) => void
}

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 justify-center mt-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`text-xs ${i < count ? 'text-yellow-400' : 'text-white/20'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function statusClasses(status: NodeStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
    case 'active':
      return 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-300/60 scale-110 shadow-xl shadow-yellow-400/40'
    case 'locked':
      return 'bg-gray-300 text-gray-500 opacity-50'
  }
}

function NodeCircle({
  node,
  onTap,
}: {
  node: JourneyNode
  onTap: (node: JourneyNode) => void
}) {
  const isDisabled = node.status === 'locked'
  const isActive = node.status === 'active'

  return (
    <button
      data-testid={`journey-node-${node.id}`}
      disabled={isDisabled}
      onClick={() => onTap(node)}
      className={`
        relative flex items-center justify-center
        w-16 h-16 rounded-full
        font-bold text-lg
        transition-all duration-300 ease-out
        ${statusClasses(node.status)}
        ${isActive ? 'animate-pulse' : ''}
        ${!isDisabled ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed'}
      `}
    >
      {node.type === 'review' ? (
        <span className="text-2xl">🔄</span>
      ) : (
        <span>{node.level + 1}</span>
      )}
    </button>
  )
}

function zigzagOffset(index: number): string {
  const offsets = ['translate-x-0', '-translate-x-8', 'translate-x-8', '-translate-x-4', 'translate-x-4']
  return offsets[index % offsets.length]
}

export function JourneyMap({
  totalLevels,
  currentLevel,
  currentPage,
  pagesPerLevel,
  onNodeTap,
}: JourneyMapProps) {
  const activeRef = useRef<HTMLDivElement>(null)

  const nodes = useMemo(
    () =>
      buildJourneyNodes(totalLevels, {
        currentLevel,
        currentPage,
        pagesPerLevel,
      }),
    [totalLevels, currentLevel, currentPage, pagesPerLevel]
  )

  // Auto-scroll to active node on mount
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 py-4 px-4 w-full">
      {nodes.map((node, index) => (
        <div
          key={node.id}
          ref={node.status === 'active' ? activeRef : undefined}
          className={`flex flex-col items-center transition-transform duration-300 ${zigzagOffset(index)}`}
        >
          {/* Connector line */}
          {index > 0 && (
            <div className="w-[2px] h-6 -mt-1 mb-1 bg-white/30 rounded-full" />
          )}

          <NodeCircle node={node} onTap={onNodeTap} />

          {/* Stars for level nodes */}
          {node.type === 'level' && node.stars !== undefined && (
            <Stars count={node.stars} />
          )}

          {/* Label */}
          <span className="text-xs text-white/70 mt-0.5 font-medium">
            {node.type === 'review'
              ? 'Ulang Kaji'
              : `Tahap ${node.level + 1}`}
          </span>
        </div>
      ))}
    </div>
  )
}
