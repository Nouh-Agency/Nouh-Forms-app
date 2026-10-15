import { apiClient } from './apiClient'

export interface CreateClientPayload {
  name: string
  phone: string
  email: string
  address: string
}

export interface ClientResponse {
  id: number
  name: string
  phone: string
  email: string
  address: string
  created_at?: string
  updated_at?: string
}

export async function createClient(payload: CreateClientPayload): Promise<ClientResponse> {
  const response = await apiClient.post<ClientResponse | { data: ClientResponse }>('/api/clients', payload)
  if ('data' in response.data && response.data.data) {
    return response.data.data
  }
  return response.data as ClientResponse
}
