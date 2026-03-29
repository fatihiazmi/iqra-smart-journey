'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface PinPadProps {
  onComplete: (pin: string) => void
}

const PIN_LENGTH = 4

export function PinPad({ onComplete }: PinPadProps) {
  const [digits, setDigits] = useState<string[]>([])
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (digits.length === PIN_LENGTH) {
      onCompleteRef.current(digits.join(''))
    }
  }, [digits])

  const handleDigit = useCallback((digit: string) => {
    setDigits((prev) => {
      if (prev.length >= PIN_LENGTH) return prev
      return [...prev, digit]
    })
  }, [])

  const handleDelete = useCallback(() => {
    setDigits((prev) => prev.slice(0, -1))
  }, [])

  const digitButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Dot indicators */}
      <div className="flex gap-4">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            data-testid="pin-dot"
            data-filled={i < digits.length ? 'true' : 'false'}
            className={`h-5 w-5 rounded-full border-2 border-white transition-all duration-200 ${
              i < digits.length
                ? 'scale-110 bg-yellow-300 shadow-lg shadow-yellow-300/50'
                : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Number grid */}
      <div className="grid grid-cols-3 gap-3">
        {digitButtons.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(String(d))}
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-indigo-700 shadow-lg transition-all duration-150 active:scale-95 active:shadow-md hover:bg-indigo-50 min-w-[64px] min-h-[64px]"
          >
            {d}
          </button>
        ))}

        {/* Bottom row: delete, 0, empty */}
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Padam"
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-400 text-xl font-bold text-white shadow-lg transition-all duration-150 active:scale-95 active:shadow-md hover:bg-red-500 min-w-[64px] min-h-[64px]"
        >
          ←
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-indigo-700 shadow-lg transition-all duration-150 active:scale-95 active:shadow-md hover:bg-indigo-50 min-w-[64px] min-h-[64px]"
        >
          0
        </button>

        <div className="h-16 w-16" />
      </div>
    </div>
  )
}
