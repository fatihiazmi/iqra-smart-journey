'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProgress() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function completePage(
  level: number,
  page: number,
  starsEarned: number
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Get current progress
  const { data: progress, error: fetchError } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', user.id)
    .single()

  if (fetchError || !progress) {
    return { error: fetchError?.message ?? 'No progress record found' }
  }

  const newPagesCompleted = (progress.pages_completed ?? 0) + 1
  const newTotalStars = (progress.total_stars ?? 0) + starsEarned
  const nextPage = page + 1

  const { error: updateError } = await supabase
    .from('student_progress')
    .update({
      pages_completed: newPagesCompleted,
      total_stars: newTotalStars,
      current_page: nextPage,
      current_level: level,
      last_activity_date: new Date().toISOString().split('T')[0],
    })
    .eq('student_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath('/learn')
  return { success: true }
}

export async function updateStreak() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data: progress, error: fetchError } = await supabase
    .from('student_progress')
    .select('*')
    .eq('student_id', user.id)
    .single()

  if (fetchError || !progress) {
    return { error: fetchError?.message ?? 'No progress record found' }
  }

  const today = new Date().toISOString().split('T')[0]
  const lastDate = progress.last_activity_date

  let newStreak: number

  if (lastDate === today) {
    // Already active today — no change
    return { success: true, streak: progress.streak_days ?? 0 }
  }

  if (lastDate) {
    const last = new Date(lastDate)
    const now = new Date(today)
    const diffMs = now.getTime() - last.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      // Consecutive day — increment
      newStreak = (progress.streak_days ?? 0) + 1
    } else {
      // Gap — reset
      newStreak = 1
    }
  } else {
    // First ever activity
    newStreak = 1
  }

  const { error: updateError } = await supabase
    .from('student_progress')
    .update({
      streak_days: newStreak,
      last_activity_date: today,
    })
    .eq('student_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true, streak: newStreak }
}
