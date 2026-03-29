'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({ email, password })

  if (authError) {
    redirect(`/login?error=${encodeURIComponent(authError.message)}`)
  }

  // Fetch profile to determine role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', authData.user.id)
    .single()

  if (profileError || !profile) {
    redirect('/login?error=Profil+tidak+dijumpai')
  }

  switch (profile.role) {
    case 'admin':
      redirect('/admin')
    case 'teacher':
      redirect('/dashboard')
    case 'student':
      redirect('/learn')
    default:
      redirect('/login?error=Peranan+tidak+sah')
  }
}
