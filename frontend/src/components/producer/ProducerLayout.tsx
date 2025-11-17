// src/components/producer/ProducerLayout.tsx
import { useAuthStore } from '@/store/authStore'
import { Navigate } from 'react-router-dom'
import { useProducer } from '@/hooks/useProducer'

interface ProducerLayoutProps {
  children: React.ReactNode
}

const ProducerLayout = ({ children }: ProducerLayoutProps) => {
  const { isProducer, loading } = useProducer()
  const { user } = useAuthStore()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Проверка прав доступа...</div>
        </div>
      </div>
    )
  }

  if (!isProducer) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация продюсера */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Панель продюсера
              </h1>
              <nav className="ml-8 flex space-x-4">
                <a 
                  href="/producer" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Мои заказы
                </a>
                <a 
                  href="/producer/completed" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Завершенные
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.name || 'Продюсер'}
              </span>
              <a 
                href="/" 
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                На сайт
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Контент */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}

export default ProducerLayout