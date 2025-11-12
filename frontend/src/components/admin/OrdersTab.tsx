import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Order, OrderDisplay } from '@/types/order'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'

// Функция преобразования Order в OrderDisplay
const orderToDisplay = (order: Order): OrderDisplay => ({
  ...order,
  theme: order.theme?.name || 'Неизвестно',
  genre: order.genre?.name || 'Неизвестно',
})

// Опции для множественного выбора
const statusOptions = [
  { value: 'draft', label: 'Черновики' },
  { value: 'waiting_interview', label: 'Ожидают интервью' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'ready', label: 'Готовы' },
  { value: 'paid', label: 'Оплачены' },
  { value: 'completed', label: 'Завершены' },
  { value: 'cancelled', label: 'Отменены' }
]

// Предустановленные фильтры
const presetFilters = [
  { 
    label: 'Все активные', 
    value: ['draft', 'waiting_interview', 'in_progress', 'ready', 'paid'] 
  },
  { 
    label: 'В работе', 
    value: ['waiting_interview', 'in_progress'] 
  },
  { 
    label: 'Готовые к оплате', 
    value: ['ready'] 
  },
  { 
    label: 'Все кроме отмененных', 
    value: ['draft', 'waiting_interview', 'in_progress', 'ready', 'paid', 'completed'] 
  },
  { 
    label: 'Завершенные', 
    value: ['completed'] 
  }
]

const OrdersTab = () => {
  const { token } = useAuthStore()
  const [orders, setOrders] = useState<OrderDisplay[]>([])
  const [allOrders, setAllOrders] = useState<OrderDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  // Фильтруем заказы когда меняются выбранные статусы
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
      }
    } catch (error) {
      console.error('Error updating order status:', error)
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
        // Удаляем заказ из локального состояния
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

  if (loading) {
    return <div className="text-center py-8">Загрузка заказов...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление заказами</h2>
        
        <div className="flex items-center space-x-4">
          {/* Кнопка показа/скрытия фильтров */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>
      </div>

      {/* Расширенные фильтры */}
      {showFilters && (
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

          {/* Информация о выбранных фильтрах */}
          {selectedStatuses.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Показаны заказы со статусами: {' '}
                {selectedStatuses.map(status => getStatusText(status)).join(', ')}
                {' '}({orders.length} из {allOrders.length})
              </p>
            </div>
          )}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedStatuses.length > 0 ? 'Заказов с выбранными статусами не найдено' : 'Заказов не найдено'}
          </p>
          {selectedStatuses.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-2 text-primary-600 hover:text-primary-800"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Показано {orders.length} из {allOrders.length} заказов
              {selectedStatuses.length > 0 && ` (фильтр по ${selectedStatuses.length} статусам)`}
            </p>
          </div>
          
          {/* ТАБЛИЦА ЗАКАЗОВ - ЭТУ ЧАСТЬ Я ПРОПУСТИЛ */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тема
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Жанр
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Для кого
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата создания
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.theme}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.genre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.recipient_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusClasses(order.status)}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1 mb-2"
                    >
                      <option value="draft">Черновик</option>
                      <option value="waiting_interview">Ожидает интервью</option>
                      <option value="in_progress">В работе</option>
                      <option value="ready">Готов</option>
                      <option value="paid">Оплачен</option>
                      <option value="completed">Завершен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                    <br />
                    <button
                      onClick={() => deleteOrder(order.id)}
                      disabled={deleting === order.id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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