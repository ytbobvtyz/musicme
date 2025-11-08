import apiClient from './client'
import { Track } from '@/types/track'

export const getTrack = async (trackId: string) => {
  const response = await apiClient.get(`/tracks/${trackId}`)
  return response.data
}

