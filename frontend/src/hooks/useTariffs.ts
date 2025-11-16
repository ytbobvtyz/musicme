import { useState, useEffect } from 'react'
import { TariffPlan } from '@/types/tariff'

export const useTariffs = () => {
  const [tariffs, setTariffs] = useState<TariffPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // ⬇️ ОТНОСИТЕЛЬНЫЙ URL - будет проксироваться через Vite
        const url = '/api/v1/tariffs'
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setTariffs(data.tariffs)
      } catch (err) {
        console.error('Error fetching tariffs:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTariffs()
  }, [])

  return { tariffs, loading, error }
}