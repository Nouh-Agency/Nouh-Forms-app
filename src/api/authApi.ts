import { apiClient } from './apiClient'

export interface LoginPayload {
  email: string
  password: string
}

export interface UserProfile {
  id?: number
  name?: string
  email?: string
  [key: string]: unknown
}

export interface LoginResponse {
  token?: string
  access_token?: string
  token_type?: string
  user?: UserProfile
  data?: {
    token?: string
    access_token?: string
    token_type?: string
    user?: UserProfile
    [key: string]: unknown
  }
  message?: string
}

export interface LogoutResponse {
  message?: string
  [key: string]: unknown
}

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/api/login', {
    email: payload.email,
    password: payload.password,
  })
  return response.data
}

export async function logoutUser(): Promise<LogoutResponse> {
  const response = await apiClient.post<LogoutResponse>('/api/logout')
  return response.data
}
