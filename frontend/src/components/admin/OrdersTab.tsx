// components/admin/OrdersTab.tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Order, OrderDisplay } from '@/types/order'
import { User } from '@/types/user'
import { 
  getAdminOrders, 
  getProducers, 
  assignProducerToOrder, 
  updateOrderStatusAdmin, 
  deleteOrderAdmin,
  confirmPaymentReceived 
} from '@/api/admin'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'

// Статусы для нового workflow
const statusOptions = [
  { value: 'draft', label: 'Черновики' },
  { value: 'waiting_interview', label: 'Ожидают интервью' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'ready_for_review', label: 'Готовы для проверки' },
  { value: 'payment_pending', label: 'Ожидают проверки оплаты' },
  { value: 'ready_for_final_review', label: 'Готовы для финальной проверки' },
  { value: 'completed', label: 'Завершены' },
  { value: 'cancelled', label: 'Отменены' }
]

// Пресет фильтры
const presetFilters = [
  { 
    label: 'Все активные', 
    value: ['draft', 'waiting_interview', 'in_progress', 'ready_for_review', 'payment_pending', 'ready_for_final_review'] 
  },
  { 
    label: 'Требуют назначения продюсера', 
    value: ['draft', 'ready_for_review'] 
  },
  { 
    label: 'В работе у продюсеров', 
    value: ['in_progress', 'revision_requested'] 
  },
  { 
    label: 'Ожидают оплаты', 
    value: ['ready_for_review'] 
  },
  { 
    label: 'Ожидают проверки оплаты', 
    value: ['payment_pending'] 
  },
  { 
    label: 'Готовы для финальной проверки', 
    value: ['ready_for_final_review'] 
  },
  { 
    label: 'Отменены', 
    value: ['cancelled']
  }
]

const orderToDisplay = (order: Order): OrderDisplay => ({
  ...order,
  theme: order.theme?.name || 'Неизвестно',
  genre: order.genre?.name || 'Неизвестно',
  producer: order.producer?.name || 'Не назначен',
})

const OrdersTab = () => {
  const { token } = useAuthStore()
  const [orders, setOrders] = useState<OrderDisplay[]>([])
  const [allOrders, setAllOrders] = useState<OrderDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const [producers, setProducers] = useState<User[]>([])
  const [assigning, setAssigning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchOrders()
    fetchProducers()
  }, [])

  useEffect(() => {
    if (selectedStatuses.length === 0) {
      setOrders(allOrders)
    } else {
      const filtered = allOrders.filter(order => 
        selectedStatuses.includes(order.status)
      )
      setOrders(filtered)
    }
  }, [selectedStatuses, allOrders])

  const fetchOrders = async () => {
    try {
      setError(null)
      const data = await getAdminOrders()
      const displayOrders = data.map(orderToDisplay)
      setAllOrders(displayOrders)
      setOrders(displayOrders)
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      setError('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducers = async () => {
    try {
      const data = await getProducers()
      setProducers(data)
    } catch (error: any) {
      console.error('Error fetching producers:', error)
      setError('Ошибка загрузки продюсеров')
    }
  }

  const assignProducer = async (orderId: string, producerId: string) => {
    if (!producerId) {
      alert('Пожалуйста, выберите продюсера')
      return
    }

    setAssigning(orderId)
    setError(null)
    
    try {
      console.log('🔍 Frontend: Assigning producer', { orderId, producerId })
      await assignProducerToOrder(orderId, producerId)
      
      alert('Продюсер успешно назначен')
      await fetchOrders()
      
      // Автоматически меняем статус на IN_PROGRESS если заказ был в READY_FOR_REVIEW
      const order = allOrders.find(o => o.id === orderId)
      if (order && order.status === 'ready_for_review') {
        await updateOrderStatus(orderId, 'in_progress')
      }
    } catch (error: any) {
      console.error('🔍 Frontend: Assign error', error)
      setError(error.message || 'Ошибка при назначении продюсера')
      alert(error.message || 'Ошибка при назначении продюсера')
    } finally {
      setAssigning(null)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setError(null)
    
    try {
      await updateOrderStatusAdmin(orderId, newStatus)
      
      // Обновляем локальное состояние
      const updatedOrders = allOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
      setAllOrders(updatedOrders)
      alert(`Статус заказа изменен на: ${getStatusText(newStatus)}`)
    } catch (error: any) {
      console.error('Error updating order status:', error)
      setError(error.message || 'Ошибка при изменении статуса')
      alert(error.message || 'Ошибка при изменении статуса')
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.')) {
      return
    }

    setDeleting(orderId)
    setError(null)
    
    try {
      await deleteOrderAdmin(orderId)
      
      const updatedAllOrders = allOrders.filter(order => order.id !== orderId)
      setAllOrders(updatedAllOrders)
      alert('Заказ успешно удален')
    } catch (error: any) {
      console.error('Error deleting order:', error)
      setError(error.message || 'Ошибка при удалении заказа')
      alert(error.message || 'Ошибка при удалении заказа')
    } finally {
      setDeleting(null)
    }
  }

  const handlePaymentConfirmation = async (orderId: string) => {
    if (!confirm('Подтвердить, что оплата получена и можно выкладывать полную версию?')) {
      return
    }

    setError(null)
    
    try {
      await confirmPaymentReceived(orderId)
      alert('Оплата подтверждена! Заказ переведен в статус "Оплачен"')
      await fetchOrders()
    } catch (error: any) {
      console.error('Error confirming payment:', error)
      setError(error.message || 'Ошибка при подтверждении оплаты')
      alert(error.message || 'Ошибка при подтверждении оплаты')
    }
  }

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const applyPresetFilter = (statuses: string[]) => {
    setSelectedStatuses(statuses)
  }

  const clearFilters = () => {
    setSelectedStatuses([])
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка заказов...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление заказами</h2>
        <div className="text-sm text-gray-500">
          Всего заказов: {allOrders.length}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Статистика по статусам */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {allOrders.filter(o => ['draft', 'ready_for_review'].includes(o.status)).length}
          </div>
          <div className="text-sm text-blue-800">Требуют назначения</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {allOrders.filter(o => ['in_progress', 'revision_requested'].includes(o.status)).length}
          </div>
          <div className="text-sm text-yellow-800">В работе</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {allOrders.filter(o => o.status === 'payment_pending').length}
          </div>
          <div className="text-sm text-orange-800">Ожидают проверки оплаты</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {allOrders.filter(o => o.status === 'completed').length}
          </div>
          <div className="text-sm text-green-800">Завершены</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {allOrders.filter(o => o.status === 'cancelled').length}
          </div>
          <div className="text-sm text-red-800">Отменены</div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Фильтры по статусам</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Сбросить все
          </button>
        </div>

        {/* Быстрые фильтры */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Быстрые фильтры:
          </label>
          <div className="flex flex-wrap gap-2">
            {presetFilters.map((filter, index) => (
              <button
                key={index}
                onClick={() => applyPresetFilter(filter.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Выбор отдельных статусов */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите статусы:
          </label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <label key={option.value} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(option.value)}
                  onChange={() => handleStatusToggle(option.value)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedStatuses.length > 0 ? 'Заказов с выбранными статусами не найдено' : 'Заказов не найдено'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Для кого / Повод
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тариф
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Продюсер
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.recipient_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.theme} • {order.genre}
                    </div>
                    {order.occasion && (
                      <div className="text-xs text-gray-400 mt-1">
                        {order.occasion}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {order.tariff_plan}
                    <div className="text-xs text-gray-400">
                      {order.price} ₽
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusClasses(order.status)}>
                      {getStatusText(order.status)}
                    </span>
                    {/* Специальные действия для определенных статусов */}
                    {order.status === 'payment_pending' && (
                      <div className="mt-1">
                        <button
                          onClick={() => handlePaymentConfirmation(order.id)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          Подтвердить оплату
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.producer_id || ''}
                      onChange={(e) => assignProducer(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-full"
                      disabled={assigning === order.id || ['completed', 'cancelled'].includes(order.status)}
                    >
                      <option value="">Не назначен</option>
                      {producers.map(producer => (
                        <option key={producer.id} value={producer.id}>
                          {producer.name} ({producer.email})
                        </option>
                      ))}
                    </select>
                    {assigning === order.id && (
                      <div className="text-xs text-gray-500 mt-1">Назначаем...</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 w-full"
                    >
                      {statusOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    
                    <button
                      onClick={() => deleteOrder(order.id)}
                      disabled={deleting === order.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs block w-full text-center mt-1 transition-colors"
                    >
                      {deleting === order.id ? 'Удаление...' : 'Удалить'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default OrdersTab