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

