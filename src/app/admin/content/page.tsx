import Link from 'next/link'
import UploadForm from './upload-form'
import { getContentByLevel } from '@/lib/actions/content'

const LEVELS = [0, 1, 2, 3, 4, 5, 6]

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string }>
}) {
  const params = await searchParams
  const selectedLevel = params.level !== undefined ? Number(params.level) : 1
  const { data: content } = await getContentByLevel(selectedLevel)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Content Manager</h1>

      <UploadForm />

      {/* Level Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Level:</span>
        {LEVELS.map((level) => (
          <Link
            key={level}
            href={`/admin/content?level=${level}`}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              level === selectedLevel
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {level}
          </Link>
        ))}
      </div>

      {/* Content Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Page
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Label
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Assets
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {content && content.length > 0 ? (
              content.map((item: Record<string, unknown>) => (
                <tr key={item.id as string}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {item.page_number as number}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                    {item.label as string}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {item.content_type as string}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span title="Image">{item.image_url ? '🖼️' : '⬜'}</span>
                    {' '}
                    <span title="Audio">{item.audio_url ? '🔊' : '⬜'}</span>
                    {' '}
                    <span title="Rhythm">{item.rhythm_audio_url ? '🎵' : '⬜'}</span>
                    {' '}
                    <span title="Tracing">{item.tracing_svg_url ? '✏️' : '⬜'}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No content for level {selectedLevel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
