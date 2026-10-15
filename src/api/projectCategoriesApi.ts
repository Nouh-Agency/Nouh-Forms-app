import { apiClient } from './apiClient'
import type { ProjectCategory } from '../types/projectCategory.types'

export async function fetchProjectCategories(departmentId?: number): Promise<ProjectCategory[]> {
  const url = departmentId ? `/api/project-categories?department_id=${departmentId}` : '/api/project-categories'
  const response = await apiClient.get<ProjectCategory[] | { data: ProjectCategory[] }>(url)
  if (Array.isArray(response.data)) {
    return response.data
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data
  }
  return []
}
