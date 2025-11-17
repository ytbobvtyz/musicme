import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'

export const useProducer = () => {
  const { user, token } = useAuthStore()
  const [isProducer, setIsProducer] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token && user) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        // ПРОВЕРЯЕМ is_producer В JWT
        setIsProducer(
          payload.is_producer === true || 
          payload.is_admin === true  // админы тоже могут быть продюсерами
        )
      } catch (error) {
        console.error('Error decoding JWT:', error)
        setIsProducer(false)
      }
    } else {
      setIsProducer(false)
    }
    setLoading(false)
  }, [token, user])

  return { isProducer, loading }
}