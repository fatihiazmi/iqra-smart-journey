'use server'

import { createClient } from '@/lib/supabase/server'

interface DiagnosticAttemptData {
  diagnosticType: 'reading' | 'writing'
  audioRecordingUrl?: string | null
  webSpeechResult?: Record<string, unknown> | null
  canvasData?: Record<string, unknown> | null
  score: number
  suggestedLevel: number
}

export async function saveDiagnosticAttempt(data: DiagnosticAttemptData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Insert diagnostic attempt
  const { data: attempt, error: insertError } = await supabase
    .from('diagnostic_attempts')
    .insert({
      student_id: user.id,
      diagnostic_type: data.diagnosticType,
      audio_recording_url: data.audioRecordingUrl ?? null,
      web_speech_result: data.webSpeechResult ?? null,
      canvas_data: data.canvasData ?? null,
      score: data.score,
      suggested_level: data.suggestedLevel,
      status: data.score > 90 ? 'approved' : 'pending_review',
    })
    .select('id')
    .single()

  if (insertError) {
    return { error: `Failed to save attempt: ${insertError.message}` }
  }

  // If score <= 90, push to tasmik queue for teacher review
  if (data.score <= 90) {
    const { error: queueError } = await supabase.from('tasmik_queue').insert({
      student_id: user.id,
      diagnostic_attempt_id: attempt.id,
    })

    if (queueError) {
      return { error: `Failed to queue for review: ${queueError.message}` }
    }
  }

  // Upsert student_progress with the suggested level
  const { error: progressError } = await supabase
    .from('student_progress')
    .upsert(
      {
        student_id: user.id,
        current_level: data.suggestedLevel,
        current_page: 0,
        last_activity_at: new Date().toISOString(),
      },
      { onConflict: 'student_id' }
    )

  if (progressError) {
    return { error: `Failed to update progress: ${progressError.message}` }
  }

  return { success: true, attemptId: attempt.id }
}

export async function uploadAudioRecording(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const audioFile = formData.get('audio') as File | null
  if (!audioFile || audioFile.size === 0) {
    return { error: 'No audio file provided' }
  }

  const path = `${user.id}/${Date.now()}-recording.webm`
  const { error: uploadError } = await supabase.storage
    .from('audio-recordings')
    .upload(path, audioFile)

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('audio-recordings').getPublicUrl(path)

  return { url: publicUrl }
}
