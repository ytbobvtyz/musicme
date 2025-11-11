import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'

export const useAdmin = () => {
  const { user, token } = useAuthStore()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем есть ли поле is_admin в JWT токене
    if (token && user) {
      // Декодируем JWT чтобы проверить is_admin
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setIsAdmin(payload.is_admin === true)
      } catch (error) {
        console.error('Error decoding JWT:', error)
        setIsAdmin(false)
      }
    }
    setLoading(false)
  }, [token, user])

  return { isAdmin, loading }
}