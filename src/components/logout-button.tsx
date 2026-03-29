'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className={className ?? 'text-sm text-gray-500 hover:text-red-600 transition-all min-h-[44px] px-4 py-2 flex items-center justify-center font-medium rounded-lg hover:bg-gray-100 active:scale-95'}
    >
      Log Keluar
    </button>
  )
}
