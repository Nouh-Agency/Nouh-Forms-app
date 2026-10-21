import axios from 'axios'

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-forms.nouh-agency.com'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status
      if (status === 401 || status === 403) {
        const isLoginRequest = error.config?.url?.includes('/login')
        if (!isLoginRequest) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      }
    }
    return Promise.reject(error)
  }
)
