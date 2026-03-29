'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadContent(formData: FormData) {
  const supabase = await createClient()

  // Get current user and their school_id
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.school_id) {
    return { error: 'Could not determine school' }
  }

  const schoolId = profile.school_id

  // Extract form fields
  const level = Number(formData.get('level'))
  const pageNumber = Number(formData.get('page_number'))
  const contentType = formData.get('content_type') as string
  const label = formData.get('label') as string

  // Upload files to storage
  const imageFile = formData.get('image') as File | null
  const audioFile = formData.get('audio') as File | null
  const rhythmAudioFile = formData.get('rhythm_audio') as File | null
  const tracingFile = formData.get('tracing_template') as File | null

  let imageUrl: string | null = null
  let audioUrl: string | null = null
  let rhythmAudioUrl: string | null = null
  let tracingSvgUrl: string | null = null

  async function uploadFile(file: File, prefix: string): Promise<string> {
    const path = `${schoolId}/${prefix}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from('iqra-content')
      .upload(path, file)
    if (error) throw new Error(`Upload failed for ${prefix}: ${error.message}`)
    const {
      data: { publicUrl },
    } = supabase.storage.from('iqra-content').getPublicUrl(path)
    return publicUrl
  }

  try {
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadFile(imageFile, 'images')
    }
    if (audioFile && audioFile.size > 0) {
      audioUrl = await uploadFile(audioFile, 'audio')
    }
    if (rhythmAudioFile && rhythmAudioFile.size > 0) {
      rhythmAudioUrl = await uploadFile(rhythmAudioFile, 'rhythm')
    }
    if (tracingFile && tracingFile.size > 0) {
      tracingSvgUrl = await uploadFile(tracingFile, 'tracing')
    }
  } catch (err) {
    return { error: (err as Error).message }
  }

  // Insert record into iqra_content table
  const { error: insertError } = await supabase.from('iqra_content').insert({
    school_id: schoolId,
    level,
    page_number: pageNumber,
    content_type: contentType,
    label,
    image_url: imageUrl,
    audio_url: audioUrl,
    rhythm_audio_url: rhythmAudioUrl,
    tracing_svg_url: tracingSvgUrl,
  })

  if (insertError) {
    return { error: `Insert failed: ${insertError.message}` }
  }

  revalidatePath('/admin/content')
  return { success: true }
}

export async function getContentByLevel(level: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('iqra_content')
    .select('*')
    .eq('level', level)
    .order('page_number', { ascending: true })
    .order('sort_order', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}
