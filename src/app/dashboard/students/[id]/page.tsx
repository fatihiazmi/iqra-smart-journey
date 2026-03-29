import Link from 'next/link'
import { getStudentDetail } from '@/lib/actions/analytics'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string | null): string {
  if (!iso) return 'Belum mula'
  return new Date(iso).toLocaleString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    approved: 'bg-green-100 text-green-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    retry: 'bg-red-100 text-red-800',
  }
  const labels: Record<string, string> = {
    approved: 'Lulus',
    pending_review: 'Menunggu',
    retry: 'Cuba Semula',
  }
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-gray-100 text-gray-800'}`}
    >
      {labels[status] ?? status}
    </span>
  )
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: student, error } = await getStudentDetail(id)

  if (error || !student) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/students"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
        >
          &larr; Kembali
        </Link>
        <p className="text-red-600">Ralat: {error ?? 'Pelajar tidak dijumpai'}</p>
      </div>
    )
  }

  const totalLevels = 7 // Iqra' 0-6
  const progressPercent = Math.round((student.currentLevel / totalLevels) * 100)

  return (
    <div className="space-y-8">
      {/* Back button */}
      <Link
        href="/dashboard/students"
        className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
      >
        &larr; Kembali ke Senarai Pelajar
      </Link>

      {/* Header */}
      <div className="flex items-center gap-6 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-4xl">
          {student.avatar || '\uD83E\uDDD2'}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{student.fullName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
              Iqra&apos; {student.currentLevel}
            </span>
            <span className="text-sm text-gray-600">
              &#11088; {student.totalStars} bintang
            </span>
            <span className="text-sm text-gray-600">
              &#128293; {student.streakCount} hari berturut
            </span>
          </div>
        </div>
      </div>

      {/* Kemajuan (Progress) */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Kemajuan</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Level 0</span>
            <span>Level {student.currentLevel} (muka surat {student.currentPage})</span>
            <span>Level 6</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">
            {student.pagesCompleted} muka surat diselesaikan
          </p>
        </div>
      </section>

      {/* Sejarah Diagnostik */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Sejarah Diagnostik</h2>
        {student.diagnostics.length === 0 ? (
          <p className="text-sm text-gray-500">Tiada rekod diagnostik lagi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Tarikh</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Jenis</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Skor</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {student.diagnostics.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {formatDate(d.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 capitalize text-gray-700">
                      {d.diagnosticType === 'reading' ? 'Bacaan' : 'Tulisan'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                      {d.score != null ? `${d.score}%` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Galeri */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Galeri</h2>
        {student.gallery.length === 0 ? (
          <p className="text-sm text-gray-500">Tiada gambar lagi.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {student.gallery.map((g) => (
              <div key={g.id} className="overflow-hidden rounded-lg border border-gray-200">
                <img
                  src={g.imageUrl}
                  alt={g.galleryType === 'digital_coloring' ? 'Mewarna Digital' : 'Foto Fizikal'}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-2">
                  <p className="text-xs text-gray-500">
                    {g.galleryType === 'digital_coloring' ? 'Mewarna Digital' : 'Foto Fizikal'}
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(g.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Masa Aktif */}
      <section className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Masa Aktif</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Terakhir Aktif</p>
            <p className="text-lg font-medium text-gray-900">
              {formatDateTime(student.lastActivityAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jumlah Muka Surat</p>
            <p className="text-lg font-medium text-gray-900">{student.pagesCompleted}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
