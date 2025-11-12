import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getOrders } from '@/api/orders'
import { Order, OrderDisplay } from '@/types/order'

// ⬇️⬇️⬇️ ПЕРЕНЕСЕМ ФУНКЦИИ В КОМПОНЕНТ ⬇️⬇️⬇️
const orderToDisplay = (order: Order): OrderDisplay => ({
  ...order,
  theme: order.theme?.name || 'Неизвестно',
  genre: order.genre?.name || 'Неизвестно',
})

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'Черновик',
    waiting_interview: 'Ожидает интервью',
    in_progress: 'В работе',
    ready: 'Готов',
    paid: 'Оплачен',
    completed: 'Завершен',
    cancelled: 'Отменен'
  }
  return statusMap[status] || status
}

const OrdersPage = () => {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<OrderDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated])

  const loadOrders = async () => {
    try {
      console.log('🔄 Загрузка заказов...')
      const data: Order[] = await getOrders()
      
      console.log('📦 Получены заказы:', data)
      
      // Преобразуем заказы для отображения
      const displayOrders = data.map(orderToDisplay)
      
      console.log('🎨 Преобразованные заказы:', displayOrders)
      
      setOrders(displayOrders || [])
    } catch (error) {
      console.error('❌ Ошибка при загрузке заказов:', error)
      alert('Не удалось загрузить заказы')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Пожалуйста, войдите в систему</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Загрузка заказов...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
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
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    Песня для {order.recipient_name}
                  </h3>
                  <p className="text-gray-600">
                    Повод: {order.theme} | Жанр: {order.genre}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Статус: {getStatusText(order.status)} | Создан: {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </p>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Подробнее
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage