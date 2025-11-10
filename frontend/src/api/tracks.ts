import apiClient from './client'

export const getTrack = async (trackId: string) => {
  const response = await apiClient.get(`/tracks/${trackId}`)
  return response.data
}

