'use client'

import { useActionState } from 'react'
import { uploadContent } from '@/lib/actions/content'

type State = { error?: string; success?: boolean } | null

async function handleUpload(_prev: State, formData: FormData): Promise<State> {
  const result = await uploadContent(formData)
  return result
}

export default function UploadForm() {
  const [state, formAction, isPending] = useActionState(handleUpload, null)

  return (
    <form
      action={formAction}
      className="rounded-lg bg-white p-6 shadow"
    >
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Upload Content
      </h2>

      {state?.error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
          Content uploaded successfully!
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Level */}
        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700"
          >
            Level (0-6)
          </label>
          <input
            id="level"
            name="level"
            type="number"
            min={0}
            max={6}
            defaultValue={1}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Page Number */}
        <div>
          <label
            htmlFor="page_number"
            className="block text-sm font-medium text-gray-700"
          >
            Page Number
          </label>
          <input
            id="page_number"
            name="page_number"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {/* Content Type */}
        <div>
          <label
            htmlFor="content_type"
            className="block text-sm font-medium text-gray-700"
          >
            Content Type
          </label>
          <select
            id="content_type"
            name="content_type"
            required
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="huruf">Huruf</option>
            <option value="kalimah">Kalimah</option>
          </select>
        </div>

        {/* Label */}
        <div>
          <label
            htmlFor="label"
            className="block text-sm font-medium text-gray-700"
          >
            Label
          </label>
          <input
            id="label"
            name="label"
            type="text"
            required
            placeholder="e.g. Alif"
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* File Inputs */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            Image
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="audio"
            className="block text-sm font-medium text-gray-700"
          >
            Audio (Qari)
          </label>
          <input
            id="audio"
            name="audio"
            type="file"
            accept="audio/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="rhythm_audio"
            className="block text-sm font-medium text-gray-700"
          >
            Rhythm Audio (Nasyid)
          </label>
          <input
            id="rhythm_audio"
            name="rhythm_audio"
            type="file"
            accept="audio/*"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>

        <div>
          <label
            htmlFor="tracing_template"
            className="block text-sm font-medium text-gray-700"
          >
            Tracing Template (SVG)
          </label>
          <input
            id="tracing_template"
            name="tracing_template"
            type="file"
            accept=".svg,image/svg+xml"
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Uploading...' : 'Upload Content'}
        </button>
      </div>
    </form>
  )
}
