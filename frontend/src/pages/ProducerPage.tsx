// В src/pages/ProducerPage.tsx - ИСПРАВЛЯЕМ ТИПЫ
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getProducerOrders, updateOrderStatus } from '@/api/producer'
import { Order } from '@/types/order'
import ProducerLayout from '@/components/producer/ProducerLayout'
import { useNavigate } from 'react-router-dom'
import { getStatusText, getStatusClasses, ORDER_STATUSES } from '@/utils/statusUtils'

// Типы вкладок
type TabType = 'in_progress' | 'awaiting_interview' | 'paid' | 'completed'

// ⬇️⬇️⬇️ ИСПРАВЛЯЕМ КОНФИГУРАЦИЮ С ЯВНЫМИ ТИПАМИ ⬇️⬇️⬇️
type TabConfig = {
  [key in TabType]: {
    label: string
    statuses: string[]
  }
}

const TAB_CONFIG: TabConfig = {
  in_progress: {
    label: 'В работе',
    statuses: ['in_progress']
  },
  awaiting_interview: {
    label: 'Ожидают интервью', 
    statuses: ['waiting_interview']
  },
  paid: {
    label: 'Ожидают финальный трек',
    statuses: ['payment_pending', 'paid', 'revision_requested', 'in_progress_final_revision']
  },
  completed: {
    label: 'Завершённые',
    statuses: ['completed']
  }
}

const ProducerPage = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('in_progress')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      const ordersData = await getProducerOrders()
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading producer orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // ⬇️⬇️⬇️ ФИЛЬТРАЦИЯ ТЕПЕРЬ РАБОТАЕТ КОРРЕКТНО ⬇️⬇️⬇️
  const filteredOrders = orders.filter(order => 
    TAB_CONFIG[activeTab].statuses.includes(order.status)
  )

  // ⬇️⬇️⬇️ СТАТИСТИКА ТЕПЕРЬ РАБОТАЕТ КОРРЕКТНО ⬇️⬇️⬇️
  const tabStats = Object.entries(TAB_CONFIG).reduce((acc, [tabId, config]) => ({
    ...acc,
    [tabId]: orders.filter(order => config.statuses.includes(order.status)).length
  }), {} as Record<TabType, number>)

  const handleStartWork = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'in_progress')
      navigate(`/producer/orders/${orderId}`)
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

  const handleViewOrder = (orderId: string) => {
    navigate(`/producer/orders/${orderId}`)
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

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(TAB_CONFIG).map(([tabId, config]) => (
              <div key={tabId} className="bg-white p-4 rounded-lg shadow border">
                <div className="text-2xl font-bold text-gray-900">
                  {tabStats[tabId as TabType]}
                </div>
                <div className="text-sm text-gray-600">{config.label}</div>
              </div>
            ))}
          </div>

          {/* Вкладки */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b">
              <nav className="flex -mb-px">
                {Object.entries(TAB_CONFIG).map(([tabId, config]) => (
                  <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId as TabType)}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === tabId
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {config.label} ({tabStats[tabId as TabType]})
                  </button>
                ))}
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
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  activeTab={activeTab}
                  onViewOrder={handleViewOrder}
                  onStartWork={handleStartWork}
                  onCompleteInterview={handleCompleteInterview}
                />
              ))}
              
              {filteredOrders.length === 0 && (
                <EmptyState activeTab={activeTab} />
              )}
            </div>
          )}
        </div>
      </div>
    </ProducerLayout>
  )
}

// Компонент пустого состояния
const EmptyState = ({ activeTab }: { activeTab: TabType }) => {
  const icons = {
    in_progress: '🎵',
    awaiting_interview: '🎤',
    paid: '💰',
    completed: '✅'
  }

  const messages = {
    in_progress: { title: 'Нет заказов в работе', subtitle: 'Новые заказы появятся здесь после назначения администратором' },
    awaiting_interview: { title: 'Нет заказов, ожидающих интервью', subtitle: 'Все интервью проведены' },
    paid: { title: 'Нет заказов, ожидающих финальный трек', subtitle: 'Заказы появятся здесь после подтверждения оплаты' },
    completed: { title: 'Нет завершённых заказов', subtitle: 'Завершённые заказы появятся здесь' }
  }

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <div className="text-gray-400 text-6xl mb-4">
        {icons[activeTab]}
      </div>
      <p className="text-gray-500 text-lg">
        {messages[activeTab].title}
      </p>
      <p className="text-gray-400 mt-2">
        {messages[activeTab].subtitle}
      </p>
    </div>
  )
}

// Упрощенный компонент карточки заказа
const OrderCard = ({ 
  order, 
  activeTab,
  onViewOrder,
  onStartWork,
  onCompleteInterview
}: {
  order: Order
  activeTab: TabType
  onViewOrder: (orderId: string) => void
  onStartWork?: (orderId: string) => void
  onCompleteInterview?: (orderId: string) => void
}) => {
  const getActionButton = () => {
    switch (order.status) {
      case 'waiting_interview':
        return (
          <button
            onClick={() => onCompleteInterview?.(order.id)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Интервью проведено
          </button>
        )
      case 'in_progress':
        return (
          <button
            onClick={() => onStartWork?.(order.id)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Начать работу
          </button>
        )
      case 'payment_pending':
        return (
          <button
            onClick={() => {
              if (window.confirm('Вы уверены, что оплата получена?')) {
                // TODO: Вызов API producerConfirmPayment
                console.log('Confirming payment for order:', order.id)
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Подтвердить оплату
          </button>
        )
      case 'paid':
        return (
          <button
            onClick={() => onViewOrder(order.id)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Загрузить финальный трек
          </button>
        )
      case 'revision_requested':
        return (
          <button
            onClick={() => onViewOrder(order.id)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Выполнить доработку
          </button>
        )
      case 'in_progress_final_revision':
        return (
          <button
            onClick={() => onViewOrder(order.id)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Выполнить финальную правку
          </button>
        )
      default:
        return (
          <button
            onClick={() => onViewOrder(order.id)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Подробнее
          </button>
        )
    }
  }

  const getActionDescription = () => {
    const descriptions: Record<string, string> = {
      waiting_interview: '💬 Запланируйте видео-интервью с клиентом',
      in_progress: '🎵 Приступайте к созданию трека',
      payment_pending: '💰 Клиент заявил об оплате',
      paid: '✅ Оплата подтверждена',
      revision_requested: '🔄 Клиент запросил доработку',
      in_progress_final_revision: '✨ Клиент запросил финальную правку',
      completed: '✅ Заказ успешно завершен'
    }
    return descriptions[order.status] || 'Просмотреть детали заказа'
  }

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
            <span className={getStatusClasses(order.status)}>
              {getStatusText(order.status)}
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
            <p className="font-medium">{order.theme?.name || 'Не указана'}</p>
          </div>
          <div>
            <p className="text-gray-500">Жанр:</p>
            <p className="font-medium">{order.genre?.name || 'Не указан'}</p>
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
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {getActionDescription()}
            </p>
            {order.preferences?.contact && order.status === 'waiting_interview' && (
              <p className="text-sm text-gray-500 mt-1">
                Контакт: {order.preferences.contact.contact_value}
              </p>
            )}
            {order.tariff_plan === 'premium' && order.preferences?.questionnaire && order.status === 'in_progress' && (
              <p className="text-sm text-gray-500 mt-1">
                Доступна детальная анкета клиента
              </p>
            )}
          </div>
          {getActionButton()}
        </div>
      </div>
    </div>
  )
}

export default ProducerPage