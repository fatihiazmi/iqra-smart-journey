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

function StarsBadge({ count }: { count: number }) {
  return (
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-2.5 py-0.5 rounded-full shadow-md border-[2px] border-gray-100 flex gap-0.5 z-20">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`text-[10px] ${
            i < count 
              ? 'text-yellow-400 drop-shadow-sm' 
              : 'text-gray-200'
          }`}
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
      return 'bg-gradient-to-b from-[#58cc02] to-[#4bb102] text-white shadow-[0_8px_0_#46a302]'
    case 'active':
      return 'bg-gradient-to-b from-[#ffdf00] to-[#ffc800] text-white shadow-[0_8px_0_#d7a600,0_0_20px_5px_rgba(250,204,21,0.5)] ring-4 ring-white/60 animate-[pulse_3s_ease-in-out_infinite]'
    case 'locked':
      return 'bg-[#e5e5e5] text-[#afafaf] shadow-[0_8px_0_#cecece]'
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

  return (
    <>
      <button
        data-testid={`journey-node-${node.id}`}
        disabled={isDisabled}
        onClick={() => onTap(node)}
        className={`
          relative flex items-center justify-center
          w-[80px] h-[80px] rounded-full
          font-black text-3xl tracking-tight
          transition-all duration-150 ease-out z-10
          border-2 border-white/20
          ${statusClasses(node.status)}
          ${!isDisabled ? 'cursor-pointer active:translate-y-[8px] active:shadow-none hover:scale-105 hover:brightness-110' : 'cursor-not-allowed'}
        `}
      >
        {node.type === 'review' ? (
          <span className="text-3xl drop-shadow-md">🔄</span>
        ) : (
          <span className="drop-shadow-md">{node.level + 1}</span>
        )}

        {/* Stars Badge placed inside button so it clicks down visually */}
        {node.type === 'level' && node.stars !== undefined && (
          <StarsBadge count={node.stars} />
        )}
      </button>

      {/* Label outside button so it stays anchored during button press */}
      <span className="mt-5 text-sm font-extrabold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)] tracking-wide backdrop-blur-sm bg-black/10 px-3 py-1 rounded-full border border-white/10">
        {node.type === 'review' ? 'Ulang Kaji' : `Tahap ${node.level + 1}`}
      </span>
    </>
  )
}

const OFFSETS = [0, -45, 45, -20, 20]
const SLOT_HEIGHT = 150

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

  const reversedNodes = useMemo(() => [...nodes].reverse(), [nodes])

  // Center on active node initially
  useEffect(() => {
    if (activeRef.current) {
      setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [])

  // Calculate the smooth S-curve path linking all nodes
  const pathD = useMemo(() => {
    if (reversedNodes.length === 0) return ''
    let d = `M ${160 + OFFSETS[0]} ${SLOT_HEIGHT / 2}`
    for (let i = 1; i < reversedNodes.length; i++) {
      const prevX = 160 + OFFSETS[(i - 1) % OFFSETS.length]
      const prevY = (i - 1) * SLOT_HEIGHT + SLOT_HEIGHT / 2
      const currX = 160 + OFFSETS[i % OFFSETS.length]
      const currY = i * SLOT_HEIGHT + SLOT_HEIGHT / 2
      
      const cp1X = prevX
      const cp1Y = prevY + (SLOT_HEIGHT / 2)
      const cp2X = currX
      const cp2Y = currY - (SLOT_HEIGHT / 2)
      
      d += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${currX} ${currY}`
    }
    return d
  }, [reversedNodes.length])

  return (
    <div 
      className="relative w-[320px] mx-auto mt-4 mb-24" 
      style={{ height: reversedNodes.length * SLOT_HEIGHT }}
    >
      {/* Background SVG Path */}
      <svg 
        className="absolute inset-0 pointer-events-none" 
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      >
        <path
          d={pathD}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </svg>
      
      {/* Nodes Rendered in absolute slots */}
      {reversedNodes.map((node, i) => {
        const cx = 160 + OFFSETS[i % OFFSETS.length]
        const cy = i * SLOT_HEIGHT + SLOT_HEIGHT / 2

        return (
          <div 
            key={node.id} 
            ref={node.status === 'active' ? activeRef : undefined}
            className="absolute flex flex-col items-center justify-start w-[140px] -ml-[70px] -mt-[40px]"
            style={{ top: cy, left: cx, zIndex: 10 }}
          >
            <NodeCircle node={node} onTap={onNodeTap} />
          </div>
        )
      })}
    </div>
  )
}
