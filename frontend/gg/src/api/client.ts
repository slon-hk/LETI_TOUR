import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

export const apiClient = axios.create({ baseURL: '/api' })

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// On 401 — attempt token refresh once, then logout
apiClient.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/auth/refresh', {
            refresh_token: refreshToken,
          })
          localStorage.setItem('access_token', data.access_token)
          if (original.headers) {
            original.headers['Authorization'] = `Bearer ${data.access_token}`
          }
          return apiClient(original)
        } catch {
          // Refresh failed — clear tokens
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        }
      }
    }
    return Promise.reject(error)
  },
)
