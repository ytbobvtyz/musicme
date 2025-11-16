import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { createOrder } from '@/api/orders'

const AuthCallbackPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setToken, isAuthenticated } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const token = searchParams.get('token')
        if (!token) {
          throw new Error('Token not found in URL')
        }
  
        setToken(token)
        await new Promise(resolve => setTimeout(resolve, 100))
  
        const pendingOrder = localStorage.getItem('pendingOrder')
        console.log('🔍 Raw pendingOrder from localStorage:', pendingOrder)
        
        if (pendingOrder) {
          const orderData = JSON.parse(pendingOrder)
          console.log('🔍 Parsed orderData for API:', orderData)
          
          // ПРЯМАЯ ОТПРАВКА - данные уже в правильном формате
          await createOrder(orderData)
          localStorage.removeItem('pendingOrder')
          
          navigate('/order/success', { 
            state: { 
              fromAuth: true,
              orderData 
            } 
          })
        } else {
          navigate('/orders')
        }
        
        setStatus('success')
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setTimeout(() => navigate('/'), 2000)
      }
    }
  
    handleAuthCallback()
  }, [navigate, searchParams, setToken])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Завершаем авторизацию...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка авторизации</h2>
          <p className="text-gray-600">Перенаправляем на главную страницу...</p>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallbackPage