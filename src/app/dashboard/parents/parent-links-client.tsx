'use client'

import { useState, useTransition } from 'react'
import {
  generateParentLink,
  deactivateParentLink,
  type ParentLink,
} from '@/lib/actions/parent'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function truncateToken(token: string): string {
  if (token.length <= 12) return token
  return `${token.slice(0, 6)}...${token.slice(-6)}`
}

export function ParentLinksClient({
  initialLinks,
  students,
}: {
  initialLinks: ParentLink[]
  students: { id: string; fullName: string }[]
}) {
  const [links, setLinks] = useState(initialLinks)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleGenerate() {
    if (!selectedStudent) return
    setError(null)

    startTransition(async () => {
      const result = await generateParentLink(selectedStudent)
      if (result.error) {
        setError(result.error)
        return
      }

      // Refresh — add the new link to the top
      const student = students.find((s) => s.id === selectedStudent)
      if (result.token) {
        setLinks((prev) => [
          {
            id: crypto.randomUUID(),
            studentId: selectedStudent,
            studentName: student?.fullName ?? 'Unknown',
            token: result.token!,
            active: true,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ])
      }
      setSelectedStudent('')
    })
  }

  function handleDeactivate(linkId: string) {
    startTransition(async () => {
      const result = await deactivateParentLink(linkId)
      if (result.error) {
        setError(result.error)
        return
      }
      setLinks((prev) =>
        prev.map((l) => (l.id === linkId ? { ...l, active: false } : l))
      )
    })
  }

  function handleCopy(link: ParentLink) {
    const url = `${window.location.origin}/parent/${link.token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(link.id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Generate Link Section */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Jana Pautan Baharu
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <label
              htmlFor="student-select"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Pilih Pelajar
            </label>
            <select
              id="student-select"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Pilih pelajar --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!selectedStudent || isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Menjana...' : 'Jana Pautan'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Links Table */}
      <div className="rounded-xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Pelajar
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Token
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Tarikh
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {links.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Tiada pautan lagi.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">
                      {link.studentName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-600">
                      {truncateToken(link.token)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {formatDate(link.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {link.active ? (
                        <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                          Tidak Aktif
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        {link.active && (
                          <>
                            <button
                              onClick={() => handleCopy(link)}
                              className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                            >
                              {copiedId === link.id ? 'Disalin!' : 'Salin Pautan'}
                            </button>
                            <button
                              onClick={() => handleDeactivate(link.id)}
                              disabled={isPending}
                              className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                            >
                              Nyahaktif
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
