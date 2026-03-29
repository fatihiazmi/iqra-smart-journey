'use client'

import { useRef, useCallback } from 'react'
import { useReactToPrint } from 'react-to-print'

interface WorksheetProps {
  studentName: string
  hurufLabel: string
  hurufImageUrl?: string
  date: string
}

export function Worksheet({
  studentName,
  hurufLabel,
  hurufImageUrl,
  date,
}: WorksheetProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `ISJ-Worksheet-${hurufLabel}-${studentName}`,
  })

  const onPrintClick = useCallback(() => {
    handlePrint()
  }, [handlePrint])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Print button */}
      <button
        onClick={onPrintClick}
        className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-700 active:scale-95 print:hidden"
      >
        Print Worksheet 🖨️
      </button>

      {/* Printable content */}
      <div
        ref={printRef}
        className="mx-auto w-full max-w-[210mm] border border-gray-200 bg-white p-8 shadow-sm print:border-none print:shadow-none"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        {/* Header */}
        <header className="mb-6 border-b-2 border-gray-800 pb-4 text-center">
          <h1 className="text-2xl font-bold tracking-wide text-gray-900">
            Iqra&apos; Smart-Journey
          </h1>
          <h2 className="mt-1 text-lg text-gray-700">
            Helaian Kerja / Worksheet
          </h2>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <span>
              <strong>Nama:</strong> {studentName}
            </span>
            <span>
              <strong>Tarikh:</strong> {date}
            </span>
          </div>
        </header>

        {/* Section 1: Trace the Dots */}
        <section className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            1. Sambung Titik / Trace the Dots
          </h3>
          <div
            className="flex h-40 items-center justify-center rounded-lg border-4 border-dashed border-gray-300"
            dir="rtl"
          >
            {hurufImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={hurufImageUrl}
                alt={`Trace huruf ${hurufLabel}`}
                className="h-32 w-32 object-contain opacity-30"
              />
            ) : (
              <span className="text-[120px] leading-none text-gray-300">
                {hurufLabel}
              </span>
            )}
          </div>
        </section>

        {/* Section 2: Color */}
        <section className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            2. Warna / Color
          </h3>
          <div
            className="flex h-40 items-center justify-center rounded-lg border-2 border-gray-200"
            dir="rtl"
          >
            <span
              className="text-[120px] leading-none"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px #1f2937',
              }}
            >
              {hurufLabel}
            </span>
          </div>
        </section>

        {/* Section 3: Write */}
        <section className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-gray-800">
            3. Tulis / Write
          </h3>
          <div className="grid grid-cols-6 grid-rows-2 gap-2" dir="rtl">
            {/* First box has faded huruf as guide */}
            <div className="flex h-20 items-center justify-center rounded border-2 border-gray-400">
              <span className="text-5xl leading-none text-gray-200">
                {hurufLabel}
              </span>
            </div>
            {/* Remaining 11 empty boxes */}
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={i}
                className="flex h-20 items-center justify-center rounded border-2 border-gray-300"
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-gray-300 pt-3 text-center text-xs text-gray-400">
          Iqra&apos; Smart-Journey — Dicetak pada {date}
        </footer>
      </div>
    </div>
  )
}
