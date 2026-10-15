import { apiClient } from './apiClient'
import type { DesignStyle } from '../types/designStyle.types'

export async function fetchDesignStyles(): Promise<DesignStyle[]> {
  const response = await apiClient.get<DesignStyle[] | { data: DesignStyle[] }>('/api/design-styles')
  if (Array.isArray(response.data)) {
    return response.data
  }
  if (response.data && Array.isArray(response.data.data)) {
    return response.data.data
  }
  return []
}
