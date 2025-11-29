import apiClient from './client'
import { useAuthStore } from '@/store/authStore'

export const loginWithOAuth = async (provider: string, code: string, redirectUri: string) => {
  const response = await apiClient.post(`/auth/login/${provider}`, {
    code,
    redirect_uri: redirectUri,
  })
  
  const { access_token, user } = response.data
  useAuthStore.getState().setToken(access_token)
  useAuthStore.getState().setUser(user)
  
  return response.data
}

export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me')
  useAuthStore.getState().setUser(response.data)
  return response.data
}

export const getOAuthUrl = (provider: string) => {
  return `/api/v1/auth/${provider}/login`
}

// Или если нужно полный URL для редиректа
export const getOAuthRedirectUrl = (provider: string) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://musicme.ru'
  return `${baseUrl}/api/v1/auth/${provider}/login`
}