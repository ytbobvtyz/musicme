import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getProducerOrders, updateOrderStatus } from '@/api/producer'
import { Order } from '@/types/order'
import ProducerLayout from '@/components/producer/ProducerLayout'

const ProducerPage = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'in_progress' | 'awaiting_interview'>('in_progress')

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user, activeTab])

  const loadOrders = async () => {
    try {
      const ordersData = await getProducerOrders(activeTab)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading producer orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartWork = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'in_progress')
      await loadOrders()
    } catch (error) {
      console.error('Error starting work:', error)
      alert('Ошибка при старте работы')
    }
  }

  const handleCompleteInterview = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'in_progress')
      await loadOrders()
    } catch (error) {
      console.error('Error completing interview:', error)
      alert('Ошибка при завершении интервью')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Необходима авторизация</p>
        </div>
      </div>
    )
  }

  return (
    <ProducerLayout>
        <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
            {/* Заголовок */}
            <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Панель продюсера
            </h1>
            <p className="text-gray-600">
                Добро пожаловать, {user.name}! Здесь вы можете управлять своими заказами.
            </p>
            </div>

            {/* Табы */}
            <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b">
                <nav className="flex -mb-px">
                <button
                    onClick={() => setActiveTab('in_progress')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'in_progress'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    В работе ({orders.filter(o => o.status === 'in_progress').length})
                </button>
                <button
                    onClick={() => setActiveTab('awaiting_interview')}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'awaiting_interview'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Ожидают интервью ({orders.filter(o => o.status === 'awaiting_interview').length})
                </button>
                </nav>
            </div>
            </div>

            {/* Список заказов */}
            {loading ? (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Загрузка заказов...</p>
            </div>
            ) : (
            <div className="grid gap-6">
                {orders.map((order) => (
                <OrderCard
                    key={order.id}
                    order={order}
                    onStartWork={handleStartWork}
                    onCompleteInterview={handleCompleteInterview}
                />
                ))}
                
                {orders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="text-gray-400 text-6xl mb-4">
                    {activeTab === 'in_progress' ? '🎵' : '🎤'}
                    </div>
                    <p className="text-gray-500 text-lg">
                    {activeTab === 'in_progress' 
                        ? 'Нет заказов в работе' 
                        : 'Нет заказов, ожидающих интервью'}
                    </p>
                    <p className="text-gray-400">
                    {activeTab === 'in_progress'
                        ? 'Все заказы выполнены или ожидают интервью'
                        : 'Все интервью проведены'}
                    </p>
                </div>
                )}
            </div>
            )}
        </div>
        </div>
    </ProducerLayout>
  )
}

// Компонент карточки заказа
const OrderCard = ({ order, onStartWork, onCompleteInterview }: {
  order: Order
  onStartWork: (orderId: string) => void
  onCompleteInterview: (orderId: string) => void
}) => {
  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Заказ #{order.id.slice(-8)}
          </h3>
          <p className="text-gray-600">
            Для: {order.recipient_name} • {order.occasion}
          </p>
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              order.tariff_plan === 'premium' 
                ? 'bg-purple-100 text-purple-800' 
                : order.tariff_plan === 'advanced'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {order.tariff_plan === 'premium' ? 'Премиум' : 
               order.tariff_plan === 'advanced' ? 'Продвинутый' : 'Базовый'}
            </span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              order.status === 'awaiting_interview' 
                ? 'bg-orange-100 text-orange-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {order.status === 'awaiting_interview' ? 'Ожидает интервью' : 'В работе'}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Срок</p>
          <p className="text-sm font-medium">
            До {new Date(order.deadline_at).toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>

      {/* Детали заказа */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Тема:</p>
            <p className="font-medium">{order.theme?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Жанр:</p>
            <p className="font-medium">{order.genre?.name}</p>
          </div>
        </div>
        
        {order.details && (
          <div className="mt-4">
            <p className="text-gray-500 text-sm mb-1">Пожелания:</p>
            <p className="text-sm">{order.details}</p>
          </div>
        )}
      </div>

      {/* Действия */}
      <div className="border-t pt-4 mt-4">
        {order.status === 'awaiting_interview' ? (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                💬 Запланируйте видео-интервью с клиентом
              </p>
              {order.preferences?.contact && (
                <p className="text-sm text-gray-500 mt-1">
                  Контакт: {order.preferences.contact.contact_value}
                </p>
              )}
            </div>
            <button
              onClick={() => onCompleteInterview(order.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Интервью проведено
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                🎵 Приступайте к созданию трека
              </p>
              {order.tariff_plan === 'premium' && order.preferences?.questionnaire && (
                <p className="text-sm text-gray-500 mt-1">
                  Доступна детальная анкета клиента
                </p>
              )}
            </div>
            <button
              onClick={() => onStartWork(order.id)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Начать работу
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProducerPage