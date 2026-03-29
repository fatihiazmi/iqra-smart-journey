import { getClassAnalytics } from '@/lib/actions/analytics'

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const width = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="h-5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full ${color} transition-all`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export default async function AnalyticsPage() {
  const { data, error } = await getClassAnalytics()

  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analitik Kelas</h1>
        <p className="mt-4 text-red-600">Ralat: {error ?? 'Gagal memuatkan data'}</p>
      </div>
    )
  }

  if (data.totalStudents === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analitik Kelas</h1>
        <p className="mt-4 text-gray-500">Tiada pelajar lagi. Tambah pelajar untuk melihat analitik.</p>
      </div>
    )
  }

  const maxStreakCount = Math.max(1, ...data.streakDistribution.map((b) => b.count))
  const maxAvgDays = Math.max(1, ...data.avgDaysPerLevel.map((d) => d.avgDays))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analitik Kelas</h1>
        <span className="text-sm text-gray-500">{data.totalStudents} pelajar</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Huruf Mencabar */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Huruf Mencabar</h2>
          <p className="mb-3 text-xs text-gray-500">
            Huruf dengan purata skor diagnostik terendah
          </p>
          {data.challengingHuruf.length === 0 ? (
            <p className="text-sm text-gray-400">Tiada data diagnostik lagi.</p>
          ) : (
            <div className="space-y-3">
              {data.challengingHuruf.map((h) => (
                <div key={h.label} className="flex items-center gap-3">
                  <span className="w-10 text-right text-lg font-bold text-gray-800">
                    {h.label}
                  </span>
                  <div className="flex-1">
                    <Bar value={h.avgScore} max={100} color="bg-red-400" />
                  </div>
                  <span className="w-12 text-right text-sm text-gray-600">
                    {h.avgScore}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Kadar Penyelesaian */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Kadar Penyelesaian</h2>
          <p className="mb-3 text-xs text-gray-500">
            Peratus pelajar yang telah selesaikan setiap level
          </p>
          <div className="space-y-3">
            {data.completionRates.map((c) => (
              <div key={c.level} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-gray-700">
                  Level {c.level}
                </span>
                <div className="flex-1">
                  <Bar value={c.rate} max={100} color="bg-indigo-500" />
                </div>
                <span className="w-12 text-right text-sm text-gray-600">
                  {c.rate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Purata Masa */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Purata Masa</h2>
          <p className="mb-3 text-xs text-gray-500">
            Purata hari diambil untuk selesaikan setiap level
          </p>
          <div className="space-y-3">
            {data.avgDaysPerLevel.map((d) => (
              <div key={d.level} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-gray-700">
                  Level {d.level}
                </span>
                <div className="flex-1">
                  <Bar value={d.avgDays} max={maxAvgDays} color="bg-amber-400" />
                </div>
                <span className="w-16 text-right text-sm text-gray-600">
                  {d.avgDays > 0 ? `${d.avgDays} hari` : '-'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Streak */}
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Streak</h2>
          <p className="mb-3 text-xs text-gray-500">
            Taburan streak harian pelajar
          </p>
          <div className="space-y-3">
            {data.streakDistribution.map((b) => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-gray-700">
                  {b.label} hari
                </span>
                <div className="flex-1">
                  <Bar value={b.count} max={maxStreakCount} color="bg-emerald-500" />
                </div>
                <span className="w-16 text-right text-sm text-gray-600">
                  {b.count} pelajar
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
