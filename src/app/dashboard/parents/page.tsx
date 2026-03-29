import { getParentLinks, getStudentsForLinkGeneration } from '@/lib/actions/parent'
import { ParentLinksClient } from './parent-links-client'

export default async function ParentLinksPage() {
  const [linksResult, studentsResult] = await Promise.all([
    getParentLinks(),
    getStudentsForLinkGeneration(),
  ])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Parent Links</h1>

      {linksResult.error ? (
        <p className="text-red-600">Ralat: {linksResult.error}</p>
      ) : (
        <ParentLinksClient
          initialLinks={linksResult.data ?? []}
          students={studentsResult.data ?? []}
        />
      )}
    </div>
  )
}
