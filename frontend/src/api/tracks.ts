import apiClient from './client'

export const getTrack = async (trackId: string) => {
  try {
    const response = await apiClient.get(`/tracks/${trackId}`)
    return response.data
  } catch (error: any) {
    console.error('🔍 Get track error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка загрузки трека')
  }
}

// ⬇️⬇️⬇️ ДОБАВЛЯЕМ НОВЫЕ МЕТОДЫ ДЛЯ ТРЕКОВ ⬇️⬇️⬇️

export const updateTrack = async (trackId: string, updateData: any) => {
  try {
    const response = await apiClient.patch(`/tracks/${trackId}`, updateData)
    return response.data
  } catch (error: any) {
    console.error('🔍 Update track error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка обновления трека')
  }
}

export const getTrackAudioUrl = (trackId: string) => {
  return `${apiClient.defaults.baseURL}/tracks/${trackId}/audio`
}