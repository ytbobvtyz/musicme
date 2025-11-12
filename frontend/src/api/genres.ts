import apiClient from './client'
import { Genre } from '@/types/genre'

export const getGenres = async (): Promise<Genre[]> => {
  const response = await apiClient.get('/genres')
  return response.data
}