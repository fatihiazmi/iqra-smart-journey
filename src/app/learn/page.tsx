'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JourneyMap } from '@/components/journey-map'
import { createClient } from '@/lib/supabase/client'
import type { JourneyNode } from '@/lib/journey'

interface Progress {
  current_level: number
  current_page: number
  total_stars: number
  streak_count: number
}

export default function LearnPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<Progress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('student_progress')
        .select('current_level, current_page, total_stars, streak_count')
        .eq('student_id', user.id)
        .single()

      setProgress(data)
      setLoading(false)
    }

    fetchProgress()
  }, [])

  const handleNodeTap = (node: JourneyNode) => {
    if (node.type === 'review') {
      // Review mode — go to a random previous level page
      const reviewLevel = Math.floor(Math.random() * node.level)
      router.push(`/learn/page/${reviewLevel}/1`)
    } else {
      router.push(`/learn/page/${node.level}/1`)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center px-4 pt-20">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // First time — no progress yet, show diagnostic
  if (!progress) {
    return (
      <div className="flex flex-col items-center justify-center px-4 pt-12 gap-8 text-center">
        <div className="text-8xl animate-bounce">🐰</div>
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Selamat Datang!
        </h1>
        <p className="text-xl text-white/80 max-w-sm">
          Mari mulakan kembara Iqra&apos; kamu bersama Arnab!
        </p>
        <button
          onClick={() => router.push('/learn/diagnostic')}
          className="min-h-[64px] min-w-[200px] rounded-2xl bg-yellow-400 px-8 py-4 text-2xl font-extrabold text-yellow-900 shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Mula Kembara! 🚀
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center px-4 pb-8">
      <h1 className="text-2xl font-bold text-white drop-shadow-lg mt-4 mb-2 sticky top-0 z-10 bg-gradient-to-b from-sky-400/90 to-transparent py-3 w-full text-center">
        Kembara Iqra&apos;
      </h1>
      <JourneyMap
        totalLevels={7}
        currentLevel={progress.current_level}
        currentPage={progress.current_page}
        pagesPerLevel={5}
        onNodeTap={handleNodeTap}
      />
    </div>
  )
}
