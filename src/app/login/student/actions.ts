'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function studentLogin(
  avatar: string,
  pin: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Find student profile matching avatar + pin + student role
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('avatar', avatar)
    .eq('pin', pin)
    .eq('role', 'student')
    .maybeSingle()

  if (error || !profile) {
    return { error: 'Cuba lagi!' }
  }

  // Sign in using the student's email with a service-level approach
  // For student PIN login, we use Supabase's signInWithPassword
  // The admin pre-creates student accounts with email = `<avatar>.<pin>@student.local`
  const studentEmail = `${avatar}.${pin}@student.local`
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: studentEmail,
    password: pin,
  })

  if (signInError) {
    return { error: 'Cuba lagi!' }
  }

  redirect('/learn')
}
