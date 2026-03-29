'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  getTasmikQueue,
  reviewTasmik,
  type TasmikQueueEntry,
} from '@/lib/actions/tasmik'
import { AudioPlayer } from '@/components/audio-player'

const IQRA_LEVELS = [0, 1, 2, 3, 4, 5, 6] as const

export default function TasmikQueuePage() {
  const router = useRouter()
  const [entries, setEntries] = useState<TasmikQueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track per-card state
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [overrideLevels, setOverrideLevels] = useState<Record<string, number>>({})
  const [showOverride, setShowOverride] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})

  const fetchQueue = useCallback(async () => {
    const result = await getTasmikQueue()
    if (result.error) {
      setError(result.error)
    } else {
      setEntries(result.data)
      setError(null)
    }
    setLoading(false)
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('tasmik-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasmik_queue' },
        () => {
          router.refresh()
          fetchQueue()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, fetchQueue])

  const handleReview = useCallback(
    async (
      tasmikId: string,
      verdict: 'approved' | 'retry' | 'override_level'
    ) => {
      setSubmitting((prev) => ({ ...prev, [tasmikId]: true }))

      const result = await reviewTasmik({
        tasmikId,
        verdict,
        notes: notes[tasmikId] || undefined,
        overrideLevel:
          verdict === 'override_level' ? overrideLevels[tasmikId] : undefined,
      })

      if (result.error) {
        setError(result.error)
      } else {
        // Remove from local list
        setEntries((prev) => prev.filter((e) => e.id !== tasmikId))
      }

      setSubmitting((prev) => ({ ...prev, [tasmikId]: false }))
    },
    [notes, overrideLevels]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Tasmik Queue</h1>
        {entries.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            {entries.length} pending
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <span className="text-4xl">🎉</span>
          <p className="mt-3 text-lg font-medium text-gray-500">
            Tiada tasmik menunggu!
          </p>
          <p className="mt-1 text-sm text-gray-400">
            All reviews are up to date.
          </p>
        </div>
      )}

      {/* Queue cards */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <TasmikCard
            key={entry.id}
            entry={entry}
            notes={notes[entry.id] ?? ''}
            onNotesChange={(val) =>
              setNotes((prev) => ({ ...prev, [entry.id]: val }))
            }
            showOverride={showOverride[entry.id] ?? false}
            onToggleOverride={() =>
              setShowOverride((prev) => ({
                ...prev,
                [entry.id]: !prev[entry.id],
              }))
            }
            overrideLevel={overrideLevels[entry.id] ?? entry.suggested_level}
            onOverrideLevelChange={(val) =>
              setOverrideLevels((prev) => ({ ...prev, [entry.id]: val }))
            }
            submitting={submitting[entry.id] ?? false}
            onReview={(verdict) => handleReview(entry.id, verdict)}
          />
        ))}
      </div>
    </div>
  )
}

interface TasmikCardProps {
  entry: TasmikQueueEntry
  notes: string
  onNotesChange: (val: string) => void
  showOverride: boolean
  onToggleOverride: () => void
  overrideLevel: number
  onOverrideLevelChange: (val: number) => void
  submitting: boolean
  onReview: (verdict: 'approved' | 'retry' | 'override_level') => void
}

function TasmikCard({
  entry,
  notes,
  onNotesChange,
  showOverride,
  onToggleOverride,
  overrideLevel,
  onOverrideLevelChange,
  submitting,
  onReview,
}: TasmikCardProps) {
  const webSpeechTranscript =
    (entry.web_speech_result?.transcript as string) ?? null
  const webSpeechConfidence =
    (entry.web_speech_result?.confidence as number) ?? null

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* Student info row */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
          {entry.student_avatar_url ? (
            <img
              src={entry.student_avatar_url}
              alt={entry.student_name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            entry.student_name.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{entry.student_name}</p>
          <p className="text-xs text-gray-400">
            {new Date(entry.created_at).toLocaleDateString('ms-MY', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {/* Type badge */}
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            entry.diagnostic_type === 'reading'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {entry.diagnostic_type === 'reading' ? 'Reading' : 'Writing'}
        </span>
      </div>

      {/* Audio player (reading only) */}
      {entry.diagnostic_type === 'reading' && entry.audio_recording_url && (
        <div className="mt-4">
          <AudioPlayer
            src={entry.audio_recording_url}
            label="Student Recording"
          />
        </div>
      )}

      {/* Web Speech result */}
      {webSpeechTranscript && (
        <div className="mt-4 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">
            Web Speech Result
          </p>
          <p className="mt-1 text-sm text-gray-800">
            &ldquo;{webSpeechTranscript}&rdquo;
          </p>
          {webSpeechConfidence !== null && (
            <p className="mt-1 text-xs text-gray-400">
              Confidence: {Math.round(webSpeechConfidence * 100)}%
            </p>
          )}
        </div>
      )}

      {/* Score and suggested level */}
      <div className="mt-4 flex gap-4">
        <div className="rounded-lg bg-gray-50 px-4 py-2">
          <p className="text-xs text-gray-500">Score</p>
          <p className="text-lg font-bold text-gray-900">{entry.score}%</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-4 py-2">
          <p className="text-xs text-gray-500">Suggested Level</p>
          <p className="text-lg font-bold text-gray-900">
            Iqra&apos; {entry.suggested_level}
          </p>
        </div>
      </div>

      {/* Notes textarea */}
      <div className="mt-4">
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Nota guru (optional)..."
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Override level selector */}
      {showOverride && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <label className="text-sm font-medium text-amber-800">
            Override to level:
          </label>
          <select
            value={overrideLevel}
            onChange={(e) => onOverrideLevelChange(Number(e.target.value))}
            className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-200"
          >
            {IQRA_LEVELS.map((level) => (
              <option key={level} value={level}>
                Iqra&apos; {level}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onReview('override_level')}
            className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            Confirm Override
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={submitting}
          onClick={() => onReview('approved')}
          className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
        >
          Lulus ✅
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={() => onReview('retry')}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          Cuba Lagi 🔄
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onToggleOverride}
          className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
            showOverride
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {showOverride ? 'Cancel' : 'Tukar Tahap ⬆️'}
        </button>
      </div>
    </div>
  )
}
