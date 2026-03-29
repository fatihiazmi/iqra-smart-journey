import { getParentView } from '@/lib/actions/parent'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ms-MY', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LevelIndicator({ level }: { level: number }) {
  const totalLevels = 7 // Iqra' 0-6
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>Iqra&apos; 0</span>
        <span>Iqra&apos; 6</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
          style={{ width: `${Math.round((level / (totalLevels - 1)) * 100)}%` }}
        />
      </div>
    </div>
  )
}

export default async function ParentViewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const { data, error } = await getParentView(token)

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-6xl">{'\uD83D\uDE1E'}</div>
          <h1 className="mb-2 text-lg font-semibold text-gray-900">
            Link tidak sah atau sudah tamat tempoh
          </h1>
          <p className="text-sm text-gray-500">
            Sila minta guru untuk menghantar pautan baharu.
          </p>
        </div>
      </div>
    )
  }

  const activityLabels: Record<string, string> = {
    coloring: 'Mewarna',
    tracing: 'Menulis',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white px-4 py-6 shadow-sm">
        <div className="mx-auto max-w-lg text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-600">
            Iqra&apos; Smart-Journey
          </p>
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-5xl">
            {data.avatar || '\uD83E\uDDD2'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{data.studentName}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Current Level */}
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium text-gray-500">Tahap Semasa</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {data.currentLevel}
            </p>
            <p className="text-xs text-gray-400">Iqra&apos;</p>
          </div>

          {/* Streak */}
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium text-gray-500">Streak</p>
            <p className="mt-1 text-2xl font-bold text-orange-500">
              {'\uD83D\uDD25'} {data.streakCount}
            </p>
            <p className="text-xs text-gray-400">hari berturut-turut</p>
          </div>

          {/* Stars */}
          <div className="rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="text-xs font-medium text-gray-500">Bintang</p>
            <p className="mt-1 text-2xl font-bold text-yellow-500">
              {'\u2B50'} {data.totalStars}
            </p>
            <p className="text-xs text-gray-400">dikumpul</p>
          </div>
        </div>

        {/* Level Progress */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">Tahap Semasa</h2>
          <LevelIndicator level={data.currentLevel} />
          <p className="mt-2 text-center text-sm font-medium text-emerald-600">
            Iqra&apos; {data.currentLevel}
          </p>
        </div>

        {/* Recent Activities */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Aktiviti Terbaru
          </h2>
          {data.recentActivities.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada aktiviti.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentActivities.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {a.activityType === 'coloring' ? '\uD83C\uDFA8' : '\u270D\uFE0F'}
                    </span>
                    <span className="text-sm text-gray-700">
                      {activityLabels[a.activityType] ?? a.activityType}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(a.completedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gallery */}
        {data.gallery.length > 0 && (
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Galeri</h2>
            <div className="grid grid-cols-2 gap-3">
              {data.gallery.map((g) => (
                <div
                  key={g.id}
                  className="overflow-hidden rounded-lg border border-gray-100"
                >
                  <img
                    src={g.imageUrl}
                    alt={
                      g.galleryType === 'digital_coloring'
                        ? 'Mewarna Digital'
                        : 'Foto Fizikal'
                    }
                    className="aspect-square w-full object-cover"
                  />
                  <div className="px-2 py-1.5">
                    <p className="text-xs text-gray-500">
                      {g.galleryType === 'digital_coloring'
                        ? 'Mewarna Digital'
                        : 'Foto Fizikal'}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(g.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pb-8 pt-4 text-center">
          <p className="text-xs text-gray-400">
            Dijana oleh Iqra&apos; Smart-Journey
          </p>
        </div>
      </main>
    </div>
  )
}
