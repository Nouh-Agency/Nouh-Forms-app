import { useQuery } from '@tanstack/react-query'
import { fetchProjectCategories } from '../api/projectCategoriesApi'

export function useProjectCategoriesQuery(departmentId?: number) {
  return useQuery({
    queryKey: ['project-categories', departmentId],
    queryFn: () => fetchProjectCategories(departmentId),
  })
}
