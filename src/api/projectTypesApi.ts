import { apiClient } from './apiClient'
import type { ProjectType } from '../types/projectType.types'

export async function fetchProjectTypes(categoryId?: number): Promise<ProjectType[]> {
  try {
    const url = categoryId ? `/api/project-types?project_category_id=${categoryId}` : '/api/project-types'
    const response = await apiClient.get<ProjectType[] | { data: ProjectType[] }>(url)
    const list = Array.isArray(response.data)
      ? response.data
      : response.data && Array.isArray(response.data.data)
        ? response.data.data
        : []
    if (categoryId && list.length === 0) {
      const fallbackResponse = await apiClient.get<ProjectType[] | { data: ProjectType[] }>('/api/project-types')
      const allList = Array.isArray(fallbackResponse.data)
        ? fallbackResponse.data
        : fallbackResponse.data && Array.isArray(fallbackResponse.data.data)
          ? fallbackResponse.data.data
          : []
      return allList.filter((pt) => pt.project_category_id === categoryId)
    }
    return list
  } catch {
    const fallbackResponse = await apiClient.get<ProjectType[] | { data: ProjectType[] }>('/api/project-types')
    const allList = Array.isArray(fallbackResponse.data)
      ? fallbackResponse.data
      : fallbackResponse.data && Array.isArray(fallbackResponse.data.data)
        ? fallbackResponse.data.data
        : []
    return categoryId ? allList.filter((pt) => pt.project_category_id === categoryId) : allList
  }
}
