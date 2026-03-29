'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function studentLogin(
  avatar: string,
  pin: string
): Promise<{ error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

  // Call the edge function to verify avatar+PIN and get session tokens
  const response = await fetch(`${supabaseUrl}/functions/v1/student-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ avatar, pin }),
  })

  const data = await response.json()

  if (!response.ok || !data.access_token) {
    console.error('[student-login] Edge function error:', data.error)
    return { error: data.error || 'Cuba lagi!' }
  }

  // Set the session on the Supabase client
  const supabase = await createClient()
  const { error } = await supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  })

  if (error) {
    console.error('[student-login] Set session failed:', error.message)
    return { error: 'Cuba lagi!' }
  }

  redirect('/learn')
}
