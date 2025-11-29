// src/api/exampleTracks.ts
import apiClient from './client'
import { ExampleTrack } from '@/types/exampleTrack'

export const getExampleTracks = async (token: string): Promise<ExampleTrack[]> => {
  const response = await apiClient.get('/admin/example-tracks', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  return response.data
}

export const uploadExampleTrack = async (
  token: string,
  file: File,
  title: string,
  genreId: string,
  themeId: string,
  description?: string
): Promise<void> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('title', title)
  formData.append('genre_id', genreId)
  formData.append('theme_id', themeId)
  if (description) {
    formData.append('description', description)
  }

  const response = await apiClient.post('/admin/example-tracks/upload', formData, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  
  return response.data
}

export const deleteExampleTrack = async (token: string, trackId: string): Promise<void> => {
  await apiClient.delete(`/admin/example-tracks/${trackId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

// Публичные примеры треков (без авторизации)
export const getPublicExampleTracks = async (): Promise<ExampleTrack[]> => {
  const response = await apiClient.get('/example-tracks')
  return response.data
}

// URL хелперы для картинок и аудио
export const getExampleTrackCoverUrl = (trackId: string) => {
  return `/api/v1/example-tracks/${trackId}/cover`
}

export const getExampleTrackAudioUrl = (trackId: string) => {
  return `/api/v1/example-tracks/${trackId}/audio`
}