'use server'

import { createClient } from '@/lib/supabase/server'

// ---------------------------------------------------------------------------
// Helper: resolve teacher's school_id
// ---------------------------------------------------------------------------
async function getTeacherSchoolId() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { supabase, schoolId: null, error: 'Not authenticated' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    return { supabase, schoolId: null, error: profileError?.message ?? 'Profile not found' }
  }

  return { supabase, schoolId: profile.school_id as string, error: null }
}

// ---------------------------------------------------------------------------
// getStudentDetail
// ---------------------------------------------------------------------------
export type DiagnosticRecord = {
  id: string
  diagnosticType: string
  score: number | null
  status: string
  createdAt: string
}

export type GalleryItem = {
  id: string
  galleryType: string
  imageUrl: string
  createdAt: string
}

export type StudentDetail = {
  id: string
  fullName: string
  avatar: string | null
  currentLevel: number
  currentPage: number
  totalStars: number
  streakCount: number
  pagesCompleted: number
  lastActivityAt: string | null
  diagnostics: DiagnosticRecord[]
  gallery: GalleryItem[]
}

export async function getStudentDetail(
  studentId: string
): Promise<{ data: StudentDetail | null; error: string | null }> {
  const { supabase, schoolId, error: authErr } = await getTeacherSchoolId()
  if (authErr || !schoolId) return { data: null, error: authErr ?? 'Auth failed' }

  // Fetch profile (ensure student belongs to same school)
  const { data: student, error: studentErr } = await supabase
    .from('profiles')
    .select('id, full_name, avatar')
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .single()

  if (studentErr || !student) {
    return { data: null, error: studentErr?.message ?? 'Student not found' }
  }

  // Fetch progress, diagnostics, gallery in parallel
  const [progressRes, diagnosticsRes, galleryRes] = await Promise.all([
    supabase
      .from('student_progress')
      .select('current_level, current_page, total_stars, streak_count, pages_completed, last_activity_at')
      .eq('student_id', studentId)
      .single(),
    supabase
      .from('diagnostic_attempts')
      .select('id, diagnostic_type, score, status, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    supabase
      .from('student_gallery')
      .select('id, gallery_type, image_url, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
  ])

  const progress = progressRes.data
  const diagnostics: DiagnosticRecord[] = (diagnosticsRes.data ?? []).map((d) => ({
    id: d.id,
    diagnosticType: d.diagnostic_type,
    score: d.score,
    status: d.status,
    createdAt: d.created_at,
  }))
  const gallery: GalleryItem[] = (galleryRes.data ?? []).map((g) => ({
    id: g.id,
    galleryType: g.gallery_type,
    imageUrl: g.image_url,
    createdAt: g.created_at,
  }))

  return {
    data: {
      id: student.id,
      fullName: student.full_name,
      avatar: student.avatar,
      currentLevel: progress?.current_level ?? 0,
      currentPage: progress?.current_page ?? 0,
      totalStars: progress?.total_stars ?? 0,
      streakCount: progress?.streak_count ?? 0,
      pagesCompleted: progress?.pages_completed ?? 0,
      lastActivityAt: progress?.last_activity_at ?? null,
      diagnostics,
      gallery,
    },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// getClassAnalytics
// ---------------------------------------------------------------------------
export type HurufScore = {
  label: string
  avgScore: number
}

export type LevelCompletion = {
  level: number
  rate: number // 0-100
}

export type StreakBucket = {
  label: string
  count: number
}

export type ClassAnalytics = {
  challengingHuruf: HurufScore[]
  completionRates: LevelCompletion[]
  avgDaysPerLevel: { level: number; avgDays: number }[]
  streakDistribution: StreakBucket[]
  totalStudents: number
}

export async function getClassAnalytics(): Promise<{
  data: ClassAnalytics | null
  error: string | null
}> {
  const { supabase, schoolId, error: authErr } = await getTeacherSchoolId()
  if (authErr || !schoolId) return { data: null, error: authErr ?? 'Auth failed' }

  // Get all student IDs in school
  const { data: students, error: studErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('school_id', schoolId)
    .eq('role', 'student')

  if (studErr) return { data: null, error: studErr.message }

  const studentIds = (students ?? []).map((s) => s.id)
  const totalStudents = studentIds.length

  if (totalStudents === 0) {
    return {
      data: {
        challengingHuruf: [],
        completionRates: [],
        avgDaysPerLevel: [],
        streakDistribution: [],
        totalStudents: 0,
      },
      error: null,
    }
  }

  // Fetch diagnostics, progress, and content in parallel
  const [diagnosticsRes, progressRes, contentRes] = await Promise.all([
    supabase
      .from('diagnostic_attempts')
      .select('student_id, score, status, created_at, diagnostic_type')
      .in('student_id', studentIds),
    supabase
      .from('student_progress')
      .select('student_id, current_level, streak_count, pages_completed, last_activity_at')
      .in('student_id', studentIds),
    supabase
      .from('iqra_content')
      .select('level, label')
      .eq('school_id', schoolId),
  ])

  const diagnostics = diagnosticsRes.data ?? []
  const progressData = progressRes.data ?? []
  const contentData = contentRes.data ?? []

  // ---- Challenging Huruf (lowest avg diagnostic scores by content label) ----
  // We join diagnostic scores with content labels through level info
  // Since diagnostics have a score but no direct content_id, group by label from
  // content at the suggested_level. Simpler approach: group diagnostic scores by
  // the content labels at each level students are being tested on.
  // Actually diagnostics don't have a content label directly. Let's compute
  // average score per level from diagnostics, then map to the content labels.
  // Better: fetch diagnostics with their suggested_level and join with content labels.

  // Re-fetch diagnostics with suggested_level for huruf mapping
  const { data: diagWithLevel } = await supabase
    .from('diagnostic_attempts')
    .select('score, suggested_level')
    .in('student_id', studentIds)
    .not('score', 'is', null)

  // Build label -> scores map via content labels per level
  const levelLabels = new Map<number, string[]>()
  for (const c of contentData) {
    const labels = levelLabels.get(c.level) ?? []
    if (!labels.includes(c.label)) labels.push(c.label)
    levelLabels.set(c.level, labels)
  }

  const labelScores = new Map<string, number[]>()
  for (const d of diagWithLevel ?? []) {
    if (d.score == null || d.suggested_level == null) continue
    const labels = levelLabels.get(d.suggested_level) ?? []
    for (const label of labels) {
      const scores = labelScores.get(label) ?? []
      scores.push(Number(d.score))
      labelScores.set(label, scores)
    }
  }

  const challengingHuruf: HurufScore[] = Array.from(labelScores.entries())
    .map(([label, scores]) => ({
      label,
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 10)

  // ---- Completion Rates per Level ----
  const levelCounts = new Map<number, number>()
  for (const p of progressData) {
    // A student has "completed" a level if their current_level is higher
    for (let l = 0; l < p.current_level; l++) {
      levelCounts.set(l, (levelCounts.get(l) ?? 0) + 1)
    }
  }

  const maxLevel = 6
  const completionRates: LevelCompletion[] = []
  for (let l = 0; l <= maxLevel; l++) {
    completionRates.push({
      level: l,
      rate: Math.round(((levelCounts.get(l) ?? 0) / totalStudents) * 100),
    })
  }

  // ---- Average Days per Level (estimate from pages_completed and current_level) ----
  // Simplified: compute average current_level progress timing from first diagnostic to now
  const avgDaysPerLevel: { level: number; avgDays: number }[] = []
  const levelDays = new Map<number, number[]>()

  for (const p of progressData) {
    if (!p.last_activity_at) continue
    // Find student's earliest diagnostic
    const studentDiags = diagnostics
      .filter((d) => d.student_id === p.student_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    if (studentDiags.length === 0) continue

    const startDate = new Date(studentDiags[0].created_at)
    const lastDate = new Date(p.last_activity_at)
    const totalDays = Math.max(1, Math.round((lastDate.getTime() - startDate.getTime()) / 86400000))
    const levelsCompleted = Math.max(1, p.current_level)
    const daysPerLevel = Math.round(totalDays / levelsCompleted)

    for (let l = 0; l < p.current_level; l++) {
      const days = levelDays.get(l) ?? []
      days.push(daysPerLevel)
      levelDays.set(l, days)
    }
  }

  for (let l = 0; l <= maxLevel; l++) {
    const days = levelDays.get(l) ?? []
    avgDaysPerLevel.push({
      level: l,
      avgDays: days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0,
    })
  }

  // ---- Streak Distribution ----
  const buckets = { '0': 0, '1-3': 0, '4-7': 0, '7+': 0 }
  for (const p of progressData) {
    const s = p.streak_count ?? 0
    if (s === 0) buckets['0']++
    else if (s <= 3) buckets['1-3']++
    else if (s <= 7) buckets['4-7']++
    else buckets['7+']++
  }

  // Students without progress records count as 0 streak
  const withProgress = new Set(progressData.map((p) => p.student_id))
  for (const sid of studentIds) {
    if (!withProgress.has(sid)) buckets['0']++
  }

  const streakDistribution: StreakBucket[] = Object.entries(buckets).map(([label, count]) => ({
    label,
    count,
  }))

  return {
    data: {
      challengingHuruf,
      completionRates,
      avgDaysPerLevel,
      streakDistribution,
      totalStudents,
    },
    error: null,
  }
}
