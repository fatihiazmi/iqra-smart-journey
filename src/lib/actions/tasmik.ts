'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TasmikQueueEntry {
  id: string
  student_id: string
  diagnostic_attempt_id: string
  status: string
  created_at: string
  student_name: string
  student_avatar_url: string | null
  diagnostic_type: 'reading' | 'writing'
  audio_recording_url: string | null
  web_speech_result: Record<string, unknown> | null
  score: number
  suggested_level: number
}

export async function getTasmikQueue(): Promise<{
  data: TasmikQueueEntry[]
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { data: [], error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('tasmik_queue')
    .select(
      `
      id,
      student_id,
      diagnostic_attempt_id,
      status,
      created_at,
      profiles!tasmik_queue_student_id_fkey (
        full_name,
        avatar_url
      ),
      diagnostic_attempts!tasmik_queue_diagnostic_attempt_id_fkey (
        diagnostic_type,
        audio_recording_url,
        web_speech_result,
        score,
        suggested_level
      )
    `
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  const entries: TasmikQueueEntry[] = (data ?? []).map((row: Record<string, unknown>) => {
    const profile = row.profiles as Record<string, unknown> | null
    const attempt = row.diagnostic_attempts as Record<string, unknown> | null

    return {
      id: row.id as string,
      student_id: row.student_id as string,
      diagnostic_attempt_id: row.diagnostic_attempt_id as string,
      status: row.status as string,
      created_at: row.created_at as string,
      student_name: (profile?.full_name as string) ?? 'Unknown',
      student_avatar_url: (profile?.avatar_url as string) ?? null,
      diagnostic_type: (attempt?.diagnostic_type as 'reading' | 'writing') ?? 'reading',
      audio_recording_url: (attempt?.audio_recording_url as string) ?? null,
      web_speech_result: (attempt?.web_speech_result as Record<string, unknown>) ?? null,
      score: (attempt?.score as number) ?? 0,
      suggested_level: (attempt?.suggested_level as number) ?? 0,
    }
  })

  return { data: entries, error: null }
}

interface ReviewTasmikData {
  tasmikId: string
  verdict: 'approved' | 'retry' | 'override_level'
  notes?: string
  overrideLevel?: number
}

export async function reviewTasmik(data: ReviewTasmikData): Promise<{
  success: boolean
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Fetch the tasmik entry to get linked IDs
  const { data: tasmikEntry, error: fetchError } = await supabase
    .from('tasmik_queue')
    .select('student_id, diagnostic_attempt_id')
    .eq('id', data.tasmikId)
    .single()

  if (fetchError || !tasmikEntry) {
    return { success: false, error: fetchError?.message ?? 'Tasmik entry not found' }
  }

  // Update tasmik_queue status to reviewed
  const { error: queueError } = await supabase
    .from('tasmik_queue')
    .update({
      status: 'reviewed',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      teacher_notes: data.notes ?? null,
    })
    .eq('id', data.tasmikId)

  if (queueError) {
    return { success: false, error: `Failed to update queue: ${queueError.message}` }
  }

  // Update diagnostic_attempts with teacher verdict
  const { error: attemptError } = await supabase
    .from('diagnostic_attempts')
    .update({
      teacher_verdict: data.verdict,
      status: data.verdict === 'retry' ? 'pending_review' : 'approved',
    })
    .eq('id', tasmikEntry.diagnostic_attempt_id)

  if (attemptError) {
    return { success: false, error: `Failed to update attempt: ${attemptError.message}` }
  }

  // If override, update student's current level
  if (data.verdict === 'override_level' && data.overrideLevel !== undefined) {
    const { error: progressError } = await supabase
      .from('student_progress')
      .update({
        current_level: data.overrideLevel,
        last_activity_at: new Date().toISOString(),
      })
      .eq('student_id', tasmikEntry.student_id)

    if (progressError) {
      return { success: false, error: `Failed to update level: ${progressError.message}` }
    }
  }

  revalidatePath('/dashboard/tasmik')
  return { success: true, error: null }
}
