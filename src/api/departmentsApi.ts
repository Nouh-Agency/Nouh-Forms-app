import { apiClient } from './apiClient'
import type { Department } from '../types/department.types'

export async function fetchDepartments(): Promise<Department[]> {
  const response = await apiClient.get<Department[] | { data: Department[] }>('/api/departments')
  if (Array.isArray(response.data)) {
    return response.data
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data
  }
  return []
}
