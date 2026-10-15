import { apiClient } from './apiClient'
import type { ProjectType } from '../types/projectType.types'

export async function fetchProjectTypes(categoryId?: number): Promise<ProjectType[]> {
  const url = categoryId ? `/api/project-types?project_category_id=${categoryId}` : '/api/project-types'
  const response = await apiClient.get<ProjectType[] | { data: ProjectType[] }>(url)
  if (Array.isArray(response.data)) {
    return response.data
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data
  }
  return []
}
