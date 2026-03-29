'use client'

import { useState, useTransition } from 'react'
import { AvatarGrid } from '@/components/avatar-grid'
import { PinPad } from '@/components/pin-pad'
import { studentLogin } from './actions'

type Step = 'avatar' | 'pin'

export default function StudentLoginPage() {
  const [step, setStep] = useState<Step>('avatar')
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>()
  const [error, setError] = useState<string | undefined>()
  const [resetKey, setResetKey] = useState(0)
  const [isPending, startTransition] = useTransition()

  function handleAvatarSelect(avatarId: string) {
    setSelectedAvatar(avatarId)
    setError(undefined)
    setStep('pin')
  }

  function handlePinComplete(pin: string) {
    if (!selectedAvatar) return
    setError(undefined)

    startTransition(async () => {
      const result = await studentLogin(selectedAvatar, pin)
      if (result?.error) {
        setError(result.error)
        setResetKey((k) => k + 1)
      }
    })
  }

  function handleBack() {
    setStep('avatar')
    setError(undefined)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-400 to-blue-500 p-6">
      {step === 'avatar' && (
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Pilih Avatar Kamu!
          </h1>
          <AvatarGrid
            selectedId={selectedAvatar}
            onSelect={handleAvatarSelect}
          />
        </div>
      )}

      {step === 'pin' && (
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Masukkan PIN
          </h1>

          <PinPad onComplete={handlePinComplete} resetKey={resetKey} />

          {error && (
            <p className="text-lg font-bold text-red-200 animate-bounce">
              {error}
            </p>
          )}

          {isPending && (
            <p className="text-lg text-white/80 animate-pulse">
              Sedang masuk...
            </p>
          )}

          <button
            type="button"
            onClick={handleBack}
            className="mt-2 text-sm text-white/70 underline hover:text-white"
          >
            ← Tukar avatar
          </button>
        </div>
      )}
    </main>
  )
}
