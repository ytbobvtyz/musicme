import { useState, useEffect } from 'react'
import { ExampleTrack } from '@/types/exampleTrack'

export const useExampleTracks = () => {
  const [tracks, setTracks] = useState<ExampleTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExampleTracks()
  }, [])

  const fetchExampleTracks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/example-tracks')
      
      if (response.ok) {
        const data = await response.json()
        setTracks(data)
      } else {
        setError('Ошибка загрузки примеров')
      }
    } catch (error) {
      console.error('Error fetching example tracks:', error)
      setError('Не удалось загрузить примеры')
    } finally {
      setLoading(false)
    }
  }

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