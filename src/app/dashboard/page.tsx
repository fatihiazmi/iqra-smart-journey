import { getClassOverview, getStudentCount } from '@/lib/actions/dashboard'
import { ClassOverviewClient } from './class-overview-client'

export default async function DashboardPage() {
  const [overview, countResult] = await Promise.all([
    getClassOverview(),
    getStudentCount(),
  ])

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Class Overview</h1>
        <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-0.5 text-sm font-medium text-indigo-800">
          {countResult.count} pelajar
        </span>
      </div>

      {overview.error ? (
        <p className="text-red-600">Ralat: {overview.error}</p>
      ) : !overview.data || overview.data.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">
          <p className="text-lg text-gray-500">
            Tiada pelajar lagi. Tambah pelajar di Admin.
          </p>
        </div>
      ) : (
        <ClassOverviewClient students={overview.data} />
      )}
    </div>
  )
}
