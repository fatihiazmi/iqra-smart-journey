'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { StudentOverview } from '@/lib/actions/dashboard'

type SortKey = 'level' | 'stars' | 'activity'

function relativeTime(date: string | null): string {
  if (!date) return 'Belum mula'
  const diff = Date.now() - new Date(date).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'Baru sahaja'
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  return `${days} hari lalu`
}

function levelColor(level: number): string {
  if (level === 0) return 'bg-gray-100 text-gray-700'
  if (level <= 3) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

function sortStudents(
  students: StudentOverview[],
  key: SortKey
): StudentOverview[] {
  const sorted = [...students]
  switch (key) {
    case 'level':
      return sorted.sort((a, b) => b.currentLevel - a.currentLevel)
    case 'stars':
      return sorted.sort((a, b) => b.totalStars - a.totalStars)
    case 'activity':
      return sorted.sort((a, b) => {
        if (!a.lastActivityAt && !b.lastActivityAt) return 0
        if (!a.lastActivityAt) return 1
        if (!b.lastActivityAt) return -1
        return (
          new Date(b.lastActivityAt).getTime() -
          new Date(a.lastActivityAt).getTime()
        )
      })
  }
}

export function ClassOverviewClient({
  students,
}: {
  students: StudentOverview[]
}) {
  const [sortKey, setSortKey] = useState<SortKey>('activity')
  const sorted = sortStudents(students, sortKey)

  const sortButtons: { key: SortKey; label: string }[] = [
    { key: 'level', label: 'Level' },
    { key: 'stars', label: 'Stars' },
    { key: 'activity', label: 'Activity' },
  ]

  return (
    <div>
      {/* Sort Controls */}
      <div className="mb-4 flex gap-2">
        {sortButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSortKey(btn.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              sortKey === btn.key
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Student Card Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((student) => (
          <Link
            key={student.id}
            href={`/dashboard/students/${student.id}`}
            className="block rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">
                {student.avatar || '🧒'}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-gray-900">
                  {student.fullName}
                </h3>
                <span
                  className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${levelColor(student.currentLevel)}`}
                >
                  Iqra&apos; {student.currentLevel}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span>&#11088;</span> {student.totalStars}
              </span>
              <span className="flex items-center gap-1">
                <span>&#128293;</span> {student.streakCount}
              </span>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              {relativeTime(student.lastActivityAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
