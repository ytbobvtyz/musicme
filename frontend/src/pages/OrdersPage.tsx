import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getOrders } from '@/api/orders'
import { Order, OrderDisplay } from '@/types/order'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils' 
import { cancelOrder } from '@/api/orders'

// ⬇️⬇️⬇️ ПЕРЕНЕСЕМ ФУНКЦИИ В КОМПОНЕНТ ⬇️⬇️⬇️
const orderToDisplay = (order: Order): OrderDisplay => ({
  ...order,
  theme: order.theme?.name || 'Неизвестно',
  genre: order.genre?.name || 'Неизвестно',
  producer: order.producer?.name || 'Неизвестно'
})

// Функция для определения нужно ли подсвечивать заказ
const shouldHighlightOrder = (status: string): boolean => {
  return ['ready_for_review', 'ready_for_final_review', 'payment_pending'].includes(status)
}

// Функция для получения текста действия пользователя
const getUserActionText = (status: string): string => {
  const actionMap: Record<string, string> = {
    'ready_for_review': '🎵 Прослушайте превью и подтвердите заказ',
    'ready_for_final_review': '✅ Прослушайте финальную версию',
    'payment_pending': '💳 Ожидается проверка оплаты',
    'in_progress': '🔄 Продюсер работает над вашим заказом',
    'completed': '🎉 Заказ завершен!',
    'paid': '⏳ Продюсер готовит финальную версию'
  }
  return actionMap[status] || 'Заказ в процессе'
}

const OrdersPage = () => {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<OrderDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  const loadOrders = async () => {
    try {
      const data: Order[] = await getOrders()
      const displayOrders = data.map(orderToDisplay)
      setOrders(displayOrders || [])
    } catch (error) {
      console.error('Ошибка при загрузке заказов:', error)
      alert('Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }

  // ⬇️⬇️⬇️ ФУНКЦИЯ ОТМЕНЫ ЗАКАЗА ⬇️⬇️⬇️
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Вы уверены, что хотите отменить заказ? Это действие нельзя отменить.')) {
      return
    }

    setCancellingOrder(orderId)
    try {
      // Вызываем реальный API
      await cancelOrder(orderId)
      
      // Обновляем локальное состояние
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      ))
      
      alert('Заказ успешно отменен')
    } catch (error: any) {
      console.error('Ошибка при отмене заказа:', error)
      alert(error.message || 'Не удалось отменить заказ')
    } finally {
      setCancellingOrder(null)
    }
  }

  // Функция для проверки можно ли отменить заказ
  const canCancelOrder = (status: string): boolean => {
    // Можно отменить только заказы в начальных статусах
    const cancellableStatuses = [
      'draft', 
      'waiting_interview', 
      'in_progress', 
      'ready_for_review',
      'payment_pending',
      'revision_requested'
    ]
    return cancellableStatuses.includes(status)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Загрузка заказов...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Мои заказы</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">У вас пока нет заказов</p>
          <Link
            to="/order"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            Создать заказ
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const shouldHighlight = shouldHighlightOrder(order.status)
            const userActionText = getUserActionText(order.status)
            const canCancel = canCancelOrder(order.status)
            
            return (
              <div 
                key={order.id} 
                className={`
                  bg-white rounded-lg shadow-md p-6 border-2 transition-all duration-200
                  ${order.status === 'cancelled' 
                    ? 'border-gray-300 bg-gray-50 opacity-70' 
                    : shouldHighlight 
                      ? 'border-blue-500 bg-blue-50 shadow-lg transform hover:scale-[1.02]' 
                      : 'border-gray-200 hover:shadow-lg'
                  }
                `}
              >
                {/* Заголовок и статус */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      Песня для {order.recipient_name}
                    </h3>
                    <div className="flex items-center gap-4 mb-2">
                      <span className={getStatusClasses(order.status)}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {order.tariff_plan} • {order.price} ₽
                      </span>
                    </div>
                    
                    {/* Текст действия пользователя */}
                    {shouldHighlight && (
                      <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mt-2">
                        <p className="text-blue-800 font-medium text-sm">
                          {userActionText}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`/orders/${order.id}`}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Подробнее
                    </Link>
                    
                    {/* Кнопка отмены */}
                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrder === order.id}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                      >
                        {cancellingOrder === order.id ? '...' : 'Отменить'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Детали заказа */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Повод:</span> {order.theme}
                  </div>
                  <div>
                    <span className="font-medium">Жанр:</span> {order.genre}
                  </div>
                  <div>
                    <span className="font-medium">Создан:</span> {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </div>
                  <div>
                    <span className="font-medium">Дедлайн:</span> {new Date(order.deadline_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>

                {/* Дополнительная информация для определенных статусов */}
                {order.status === 'ready_for_review' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 text-sm">
                      💫 Превью трек готов! Перейдите в детали заказа чтобы прослушать и подтвердить создание полной версии.
                    </p>
                  </div>
                )}

                {order.status === 'ready_for_final_review' && (
                  <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-purple-800 text-sm">
                      🎉 Финальная версия готова! Остался последний шаг - подтвердить получение.
                    </p>
                  </div>
                )}
                {order.status === 'cancelled' && (
                  <div className="mb-3 p-2 bg-gray-100 border border-gray-300 rounded">
                    <p className="text-gray-600 text-sm">❌ Заказ отменен</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrdersPage