import { apiClient } from './apiClient'
import type { CreateProjectPayload, ProjectResponse } from '../types/project.types'

export async function createProject(payload: CreateProjectPayload): Promise<ProjectResponse> {
  const response = await apiClient.post<ProjectResponse | { data: ProjectResponse }>('/api/projects', payload)
  if ('data' in response.data && response.data.data) {
    return response.data.data
  }
  return response.data as ProjectResponse
}
