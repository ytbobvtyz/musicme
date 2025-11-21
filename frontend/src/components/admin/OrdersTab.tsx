// components/admin/OrdersTab.tsx - ОБНОВЛЯЕМ КОД
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Order, OrderDisplay } from '@/types/order'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'
import { User } from '@/types/user'

// Обновляем статусы для нового workflow
const statusOptions = [
  { value: 'draft', label: 'Черновики' },
  { value: 'waiting_interview', label: 'Ожидают интервью' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'ready_for_review', label: 'Готовы для проверки' }, // ⬅️ НОВЫЙ
  { value: 'payment_pending', label: 'Ожидают проверки оплаты' }, // ⬅️ НОВЫЙ
  { value: 'ready_for_final_review', label: 'Готовы для финальной проверки' }, // ⬅️ НОВЫЙ
  { value: 'completed', label: 'Завершены' },
  { value: 'cancelled', label: 'Отменены' }
]

// Обновляем пресет фильтры
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
  const [showFilters, setShowFilters] = useState(false)
  const [producers, setProducers] = useState<User[]>([])
  const [assigning, setAssigning] = useState<string | null>(null) // ⬅️ НОВЫЙ

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
      const response = await fetch('http://localhost:8000/api/v1/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data: Order[] = await response.json()
        const displayOrders = data.map(orderToDisplay)
        setAllOrders(displayOrders)
        setOrders(displayOrders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducers = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/producers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProducers(data)
      }
    } catch (error) {
      console.error('Error fetching producers:', error)
    }
  }

  // ⬇️⬇️⬇️ ОБНОВЛЯЕМ ФУНКЦИЮ НАЗНАЧЕНИЯ ПРОДЮСЕРА ⬇️⬇️⬇️
  const assignProducer = async (orderId: string, producerId: string) => {
    if (!producerId) {
      alert('Пожалуйста, выберите продюсера')
      return
    }
  
    setAssigning(orderId)
    console.log('🔍 Frontend: Assigning producer', { orderId, producerId })
    
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/orders/${orderId}/assign`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ producer_id: producerId })
        }
      )
  
      console.log('🔍 Frontend: Response status', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('🔍 Frontend: Success response', result)
        
        alert(result.message || 'Продюсер успешно назначен')
        await fetchOrders() // Перезагружаем данные
        
        // Автоматически меняем статус на IN_PROGRESS если заказ был в READY_FOR_REVIEW
        const order = allOrders.find(o => o.id === orderId)
        if (order && order.status === 'ready_for_review') {
          await updateOrderStatus(orderId, 'in_progress')
        }
      } else {
        const errorText = await response.text()
        console.error('🔍 Frontend: Error response', errorText)
        alert(`Ошибка: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('🔍 Frontend: Fetch error', error)
      alert('Ошибка при назначении продюсера')
    } finally {
      setAssigning(null)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/orders/${orderId}/status?status=${newStatus}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        // Обновляем локальное состояние
        const updatedOrders = allOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
        setAllOrders(updatedOrders)
        alert(`Статус заказа изменен на: ${getStatusText(newStatus)}`)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Ошибка при изменении статуса')
    }
  }

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить.')) {
      return
    }

    setDeleting(orderId)
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/orders/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        const updatedAllOrders = allOrders.filter(order => order.id !== orderId)
        setAllOrders(updatedAllOrders)
        alert('Заказ успешно удален')
      } else {
        const error = await response.text()
        alert(`Ошибка при удалении заказа: ${error}`)
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Ошибка при удалении заказа')
    } finally {
      setDeleting(null)
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

  // ⬇️⬇️⬇️ НОВАЯ ФУНКЦИЯ ДЛЯ ПРОВЕРКИ ОПЛАТЫ ⬇️⬇️⬇️
  const confirmPaymentReceived = async (orderId: string) => {
    if (!confirm('Подтвердить, что оплата получена и можно выкладывать полную версию?')) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/orders/${orderId}/confirm-payment-received`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        alert('Оплата подтверждена! Заказ переведен в статус "Оплачен"')
        await fetchOrders()
      } else {
        const error = await response.text()
        alert(`Ошибка: ${error}`)
      }
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Ошибка при подтверждении оплаты')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка заказов...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление заказами</h2>
        <div className="text-sm text-gray-500">
          Всего заказов: {allOrders.length}
        </div>
      </div>

      {/* Статистика по статусам */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
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
                          onClick={() => confirmPaymentReceived(order.id)}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
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
                      <option value="draft">Черновик</option>
                      <option value="waiting_interview">Ожидает интервью</option>
                      <option value="in_progress">В работе</option>
                      <option value="ready_for_review">Готов для проверки</option>
                      <option value="payment_pending">Ожидает проверки оплаты</option>
                      <option value="ready_for_final_review">Готов для финальной проверки</option>
                      <option value="completed">Завершен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                    
                    <button
                      onClick={() => deleteOrder(order.id)}
                      disabled={deleting === order.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 text-xs block w-full text-center mt-1"
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