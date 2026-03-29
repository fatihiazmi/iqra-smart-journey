'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'

export async function studentLogin(
  avatar: string,
  pin: string
): Promise<{ error?: string }> {
  // Use service role to find the student (bypasses RLS)
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Find student profile matching avatar + pin
  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select('id')
    .eq('avatar', avatar)
    .eq('pin', pin)
    .eq('role', 'student')
    .maybeSingle()

  if (error || !profile) {
    console.error('[student-login] Profile lookup failed:', error)
    return { error: 'Cuba lagi!' }
  }

  console.log('[student-login] Found profile:', profile.id)

  // Get the student's email from auth.users
  const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(profile.id)

  if (authError || !authUser?.user?.email) {
    console.error('[student-login] Auth user lookup failed:', authError)
    return { error: 'Cuba lagi!' }
  }

  console.log('[student-login] Auth user email:', authUser.user.email)

  // Sign in as the student using their actual email + PIN as password
  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: authUser.user.email,
    password: pin,
  })

  if (signInError) {
    console.error('[student-login] Sign-in failed:', signInError.message)
    return { error: 'Cuba lagi!' }
  }

  redirect('/learn')
}
