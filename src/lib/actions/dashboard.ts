'use server'

import { createClient } from '@/lib/supabase/server'

export type StudentOverview = {
  id: string
  fullName: string
  avatar: string | null
  currentLevel: number
  totalStars: number
  streakCount: number
  lastActivityAt: string | null
}

export async function getClassOverview(): Promise<{
  data: StudentOverview[] | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get teacher's school
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { data: null, error: profileError?.message ?? 'Profile not found' }
  }

  // Fetch all students in school with their progress
  const { data: students, error: studentsError } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      avatar,
      student_progress (
        current_level,
        total_stars,
        streak_count,
        last_activity_at
      )
    `)
    .eq('school_id', profile.school_id)
    .eq('role', 'student')
    .order('full_name')

  if (studentsError) {
    return { data: null, error: studentsError.message }
  }

  const mapped: StudentOverview[] = (students ?? []).map((s) => {
    // student_progress is a one-to-one via unique constraint, but Supabase returns array
    const progress = Array.isArray(s.student_progress)
      ? s.student_progress[0]
      : s.student_progress

    return {
      id: s.id,
      fullName: s.full_name,
      avatar: s.avatar,
      currentLevel: progress?.current_level ?? 0,
      totalStars: progress?.total_stars ?? 0,
      streakCount: progress?.streak_count ?? 0,
      lastActivityAt: progress?.last_activity_at ?? null,
    }
  })

  return { data: mapped, error: null }
}

export async function getStudentCount(): Promise<{
  count: number
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { count: 0, error: 'Not authenticated' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { count: 0, error: profileError?.message ?? 'Profile not found' }
  }

  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', profile.school_id)
    .eq('role', 'student')

  return { count: count ?? 0, error: error?.message ?? null }
}
