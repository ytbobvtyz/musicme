// src/hooks/useExampleTracks.ts
import { useState, useEffect } from 'react'
import { ExampleTrack } from '@/types/exampleTrack'
import { getPublicExampleTracks } from '@/api/exampleTracks'

export const useExampleTracks = () => {
  const [tracks, setTracks] = useState<ExampleTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExampleTracks = async () => {
    try {
      setError(null)
      const data = await getPublicExampleTracks()
      setTracks(data)
    } catch (err: any) {
      console.error('Error fetching example tracks:', err)
      setError(err.message || 'Не удалось загрузить примеры')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExampleTracks()
  }, [])

  // Группировка треков по темам
  const tracksByTheme = tracks.reduce((acc, track) => {
    const themeName = track.theme?.name || 'Другие'
    if (!acc[themeName]) {
      acc[themeName] = []
    }
    acc[themeName].push(track)
    return acc
  }, {} as Record<string, ExampleTrack[]>)

  return {
    tracks,
    tracksByTheme,
    loading,
    error,
    refetch: fetchExampleTracks
  }
}