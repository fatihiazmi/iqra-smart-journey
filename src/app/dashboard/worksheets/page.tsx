import { Worksheet } from '@/components/worksheet'

export default function WorksheetsPage() {
  const today = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Worksheets</h1>

      {/* Info card */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <h2 className="font-semibold text-blue-900">
          Generate Printable Worksheets
        </h2>
        <p className="mt-1 text-sm text-blue-700">
          Select a student and a huruf page to generate a personalized worksheet.
          Worksheets include tracing, coloring, and writing exercises.
        </p>
        <p className="mt-2 text-xs text-blue-500">
          Student and page selection coming soon — preview below uses sample data.
        </p>
      </div>

      {/* Preview with sample data */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Preview</h2>
        <Worksheet
          studentName="Ahmad"
          hurufLabel="ا"
          date={today}
        />
      </div>
    </div>
  )
}
