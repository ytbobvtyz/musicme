import apiClient from './client'
import { Theme } from '@/types/theme'

export const getThemes = async (): Promise<Theme[]> => {
  const response = await apiClient.get('/themes')
  return response.data
}