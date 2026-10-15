import { useQuery } from '@tanstack/react-query'
import { fetchProjectTypes } from '../api/projectTypesApi'

export function useProjectTypesQuery(categoryId?: number) {
  return useQuery({
    queryKey: ['project-types', categoryId],
    queryFn: () => fetchProjectTypes(categoryId),
  })
}
