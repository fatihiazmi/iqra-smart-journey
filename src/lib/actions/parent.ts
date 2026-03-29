'use server'

import { createClient } from '@/lib/supabase/server'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'

// ---------------------------------------------------------------------------
// Admin client for public (unauthenticated) parent view
// ---------------------------------------------------------------------------
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No cookies for service client
        },
      },
    }
  )
}

// ---------------------------------------------------------------------------
// Helper: resolve teacher's school_id (reused pattern from analytics.ts)
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
    .select('school_id, role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    return { supabase, schoolId: null, error: profileError?.message ?? 'Profile not found' }
  }

  if (profile.role !== 'teacher' && profile.role !== 'admin') {
    return { supabase, schoolId: null, error: 'Not authorized' }
  }

  return { supabase, schoolId: profile.school_id as string, error: null }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type ParentViewActivity = {
  id: string
  activityType: string
  completedAt: string
}

export type ParentViewGallery = {
  id: string
  galleryType: string
  imageUrl: string
  createdAt: string
}

export type ParentViewData = {
  studentName: string
  avatar: string | null
  currentLevel: number
  totalStars: number
  streakCount: number
  recentActivities: ParentViewActivity[]
  gallery: ParentViewGallery[]
}

export type ParentLink = {
  id: string
  studentId: string
  studentName: string
  token: string
  active: boolean
  createdAt: string
}

// ---------------------------------------------------------------------------
// getParentView — public, no auth required
// ---------------------------------------------------------------------------
export async function getParentView(
  token: string
): Promise<{ data: ParentViewData | null; error: string | null }> {
  const supabase = createServiceClient()

  // Look up the share link
  const { data: link, error: linkError } = await supabase
    .from('parent_share_links')
    .select('student_id, active')
    .eq('token', token)
    .eq('active', true)
    .single()

  if (linkError || !link) {
    return { data: null, error: 'Invalid or expired link' }
  }

  const studentId = link.student_id

  // Fetch profile, progress, recent activities, gallery in parallel
  const [profileRes, progressRes, activitiesRes, galleryRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar')
      .eq('id', studentId)
      .single(),
    supabase
      .from('student_progress')
      .select('current_level, total_stars, streak_count')
      .eq('student_id', studentId)
      .single(),
    supabase
      .from('activity_results')
      .select('id, activity_type, completed_at')
      .eq('student_id', studentId)
      .order('completed_at', { ascending: false })
      .limit(5),
    supabase
      .from('student_gallery')
      .select('id, gallery_type, image_url, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
  ])

  if (profileRes.error || !profileRes.data) {
    return { data: null, error: 'Student not found' }
  }

  const profile = profileRes.data
  const progress = progressRes.data

  const recentActivities: ParentViewActivity[] = (activitiesRes.data ?? []).map((a) => ({
    id: a.id,
    activityType: a.activity_type,
    completedAt: a.completed_at,
  }))

  const gallery: ParentViewGallery[] = (galleryRes.data ?? []).map((g) => ({
    id: g.id,
    galleryType: g.gallery_type,
    imageUrl: g.image_url,
    createdAt: g.created_at,
  }))

  return {
    data: {
      studentName: profile.full_name,
      avatar: profile.avatar,
      currentLevel: progress?.current_level ?? 0,
      totalStars: progress?.total_stars ?? 0,
      streakCount: progress?.streak_count ?? 0,
      recentActivities,
      gallery,
    },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// generateParentLink — teacher only
// ---------------------------------------------------------------------------
export async function generateParentLink(
  studentId: string
): Promise<{ token: string | null; error: string | null }> {
  const { supabase, schoolId, error: authErr } = await getTeacherSchoolId()
  if (authErr || !schoolId) return { token: null, error: authErr ?? 'Auth failed' }

  // Verify student belongs to teacher's school
  const { data: student, error: studentErr } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .single()

  if (studentErr || !student) {
    return { token: null, error: 'Student not found in your school' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: link, error: insertErr } = await supabase
    .from('parent_share_links')
    .insert({
      student_id: studentId,
      created_by: user!.id,
    })
    .select('token')
    .single()

  if (insertErr) {
    return { token: null, error: insertErr.message }
  }

  revalidatePath('/dashboard/parents')
  return { token: link.token, error: null }
}

// ---------------------------------------------------------------------------
// deactivateParentLink — teacher only
// ---------------------------------------------------------------------------
export async function deactivateParentLink(
  linkId: string
): Promise<{ error: string | null }> {
  const { supabase, schoolId, error: authErr } = await getTeacherSchoolId()
  if (authErr || !schoolId) return { error: authErr ?? 'Auth failed' }

  const { error: updateErr } = await supabase
    .from('parent_share_links')
    .update({ active: false })
    .eq('id', linkId)

  if (updateErr) {
    return { error: updateErr.message }
  }

  revalidatePath('/dashboard/parents')
  return { error: null }
}

// ---------------------------------------------------------------------------
// getParentLinks — teacher only, for management page
// ---------------------------------------------------------------------------
export async function getParentLinks(): Promise<{
  data: ParentLink[] | null
  error: string | null
}> {
  const { supabase, schoolId, error: authErr } = await getTeacherSchoolId()
  if (authErr || !schoolId) return { data: null, error: authErr ?? 'Auth failed' }

  const { data: links, error: linksErr } = await supabase
    .from('parent_share_links')
    .select(`
      id,
      student_id,
      token,
      active,
      created_at,
      profiles!parent_share_links_student_id_fkey (
        full_name
      )
    `)
    .order('created_at', { ascending: false })

  if (linksErr) {
    return { data: null, error: linksErr.message }
  }

  const mapped: ParentLink[] = (links ?? []).map((l) => {
    const profile = Array.isArray(l.profiles) ? l.profiles[0] : l.profiles
    return {
      id: l.id,
      studentId: l.student_id,
      studentName: (profile as { full_name: string } | null)?.full_name ?? 'Unknown',
      token: l.token,
      active: l.active,
      createdAt: l.created_at,
    }
  })

  return { data: mapped, error: null }
}

// ---------------------------------------------------------------------------
// getStudentsForLinkGeneration — teacher only
// ---------------------------------------------------------------------------
export async function getStudentsForLinkGeneration(): Promise<{
  data: { id: string; fullName: string }[] | null
  error: string | null
}> {
  const { supabase, schoolId, error: authErr } = await getTeacherSchoolId()
  if (authErr || !schoolId) return { data: null, error: authErr ?? 'Auth failed' }

  const { data: students, error: studentsErr } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('school_id', schoolId)
    .eq('role', 'student')
    .order('full_name')

  if (studentsErr) {
    return { data: null, error: studentsErr.message }
  }

  return {
    data: (students ?? []).map((s) => ({
      id: s.id,
      fullName: s.full_name,
    })),
    error: null,
  }
}
