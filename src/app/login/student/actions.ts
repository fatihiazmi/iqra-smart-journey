'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function studentLogin(
  avatar: string,
  pin: string
): Promise<{ error?: string }> {
  // Use service role to get student's auth email via DB function
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: email, error } = await adminSupabase
    .rpc('get_student_email', { p_avatar: avatar, p_pin: pin })

  if (error || !email) {
    console.error('[student-login] RPC failed:', error)
    return { error: 'Cuba lagi!' }
  }

  console.log('[student-login] Found email:', email)

  // Sign in with the student's actual email + PIN as password
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: pin,
  })

  if (signInError) {
    console.error('[student-login] Sign-in failed:', signInError.message)
    return { error: 'Cuba lagi!' }
  }

  redirect('/learn')
}
