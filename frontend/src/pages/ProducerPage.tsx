// src/pages/ProducerPage.tsx - ПОЛНЫЙ ОБНОВЛЕННЫЙ КОД
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getProducerOrders, updateOrderStatus } from '@/api/producer'
import { Order } from '@/types/order'
import ProducerLayout from '@/components/producer/ProducerLayout'
import { useNavigate } from 'react-router-dom'

// Типы вкладок
type TabType = 'in_progress' | 'awaiting_interview' | 'paid' | 'completed'

const ProducerPage = () => {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'in_progress' | 'awaiting_interview' | 'paid' | 'completed'>('in_progress')
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  const loadOrders = async () => {
    try {
      // Загружаем ВСЕ заказы без фильтрации (бэкенд вернет все статусы)
      const ordersData = await getProducerOrders()
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading producer orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Фильтруем заказы по активной вкладке на фронтенде
  const getFilteredOrders = () => {
    switch (activeTab) {
      case 'in_progress':
        return orders.filter(order => 
          ['in_progress'].includes(order.status) // ТОЛЬКО in_progress
        )
      case 'awaiting_interview':
        return orders.filter(order => order.status === 'waiting_interview')
      case 'paid':
        return orders.filter(order => 
          ['payment_pending', 'paid', 'revision_requested', 'in_progress_final_revision'].includes(order.status)
        )
      case 'completed':
        return orders.filter(order => order.status === 'completed')
      default:
        return []
    }
  }

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

  const filteredOrders = getFilteredOrders()

  // Статистика для вкладок
  const tabStats = {
    in_progress: orders.filter(order => 
      ['in_progress'].includes(order.status)
    ).length,
    awaiting_interview: orders.filter(order => order.status === 'waiting_interview').length,
    paid: orders.filter(order => 
      ['payment_pending', 'paid', 'revision_requested', 'in_progress_final_revision'].includes(order.status)
    ).length,
    completed: orders.filter(order => order.status === 'completed').length
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
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{tabStats.in_progress}</div>
              <div className="text-sm text-blue-800">В работе</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{tabStats.awaiting_interview}</div>
              <div className="text-sm text-orange-800">Ожидают интервью</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{tabStats.paid}</div>
              <div className="text-sm text-green-800">Ожидают финальный трек</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{tabStats.completed}</div>
              <div className="text-sm text-gray-800">Завершены</div>
            </div>
          </div>

          {/* Табы */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b">
              <nav className="flex -mb-px">
                {[
                  { id: 'in_progress' as TabType, label: 'В работе', count: tabStats.in_progress },
                  { id: 'awaiting_interview' as TabType, label: 'Ожидают интервью', count: tabStats.awaiting_interview },
                  { id: 'paid' as TabType, label: 'Ожидают финальный трек', count: tabStats.paid },
                  { id: 'completed' as TabType, label: 'Завершённые', count: tabStats.completed }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label} ({tab.count})
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
                  onStartWork={handleStartWork}
                  onCompleteInterview={handleCompleteInterview}
                  onViewOrder={handleViewOrder}
                />
              ))}
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <div className="text-gray-400 text-6xl mb-4">
                    {activeTab === 'in_progress' ? '🎵' : 
                     activeTab === 'awaiting_interview' ? '🎤' :
                     activeTab === 'paid' ? '💰' : '✅'}
                  </div>
                  <p className="text-gray-500 text-lg">
                    {activeTab === 'in_progress' && 'Нет заказов в работе'}
                    {activeTab === 'awaiting_interview' && 'Нет заказов, ожидающих интервью'}
                    {activeTab === 'paid' && 'Нет заказов, ожидающих финальный трек'}
                    {activeTab === 'completed' && 'Нет завершённых заказов'}
                  </p>
                  <p className="text-gray-400 mt-2">
                    {activeTab === 'in_progress' && 'Новые заказы появятся здесь после назначения администратором'}
                    {activeTab === 'paid' && 'Заказы появятся здесь после подтверждения оплаты'}
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

// Обновленный компонент карточки заказа
const OrderCard = ({ 
  order, 
  activeTab,
  onStartWork, 
  onCompleteInterview,
  onViewOrder 
}: {
  order: Order
  activeTab: string
  onStartWork: (orderId: string) => void
  onCompleteInterview: (orderId: string) => void
  onViewOrder: (orderId: string) => void
}) => {
  const getStatusInfo = (status: string) => {
  const statusMap: Record<string, { label: string, color: string, bgColor: string }> = {
    'in_progress': { label: 'В работе', color: 'text-green-800', bgColor: 'bg-green-100' },
    'revision_requested': { label: 'Требует доработки', color: 'text-orange-800', bgColor: 'bg-orange-100' },
    'ready_for_review': { label: 'Готов для проверки', color: 'text-blue-800', bgColor: 'bg-blue-100' },
    'payment_pending': { label: 'Ожидает оплаты', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
    'waiting_interview': { label: 'Ожидает интервью', color: 'text-purple-800', bgColor: 'bg-purple-100' },
    'paid': { label: 'Оплачен', color: 'text-green-800', bgColor: 'bg-green-100' },
    'in_progress_final_revision': { label: 'Финальная правка', color: 'text-purple-800', bgColor: 'bg-purple-100' }, // ⬅️ НОВЫЙ
    'completed': { label: 'Завершен', color: 'text-gray-800', bgColor: 'bg-gray-100' }
  }
  return statusMap[status] || { label: status, color: 'text-gray-800', bgColor: 'bg-gray-100' }
}

  const statusInfo = getStatusInfo(order.status)

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
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              {statusInfo.label}
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
        {activeTab === 'awaiting_interview' ? (
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
        ) : activeTab === 'in_progress' ? (
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
        ) : activeTab === 'paid' ? (
         <div className="space-y-3">
            {/* Для payment_pending - кнопка подтверждения оплаты */}
            {order.status === 'payment_pending' && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    💰 Клиент заявил об оплате
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    Проверьте поступление средств и подтвердите оплату
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Вы уверены, что оплата получена? После подтверждения вы сможете загрузить финальный трек.')) {
                      // TODO: Вызов API producerConfirmPayment
                      console.log('Confirming payment for order:', order.id)
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Подтвердить оплату
                </button>
              </div>
            )}
            
            {/* Для paid - кнопка загрузки финального трека */}
            {order.status === 'paid' && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    ✅ Оплата подтверждена
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Загрузите финальный трек для клиента
                  </p>
                </div>
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Загрузить финальный трек
                </button>
              </div>
            )}
            
            {/* Для revision_requested - кнопка выполнения доработки */}
            {order.status === 'revision_requested' && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    🔄 Клиент запросил доработку
                  </p>
                  <p className="text-sm text-orange-600 mt-1">
                    Выполните правки и загрузите обновленный трек
                  </p>
                </div>
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Выполнить доработку
                </button>
              </div>
            )}
            
            {/* ⬇️⬇️⬇️ ДОБАВЛЯЕМ ОБРАБОТКУ in_progress_final_revision ⬇️⬇️⬇️ */}
            {order.status === 'in_progress_final_revision' && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    ✨ Клиент запросил финальную правку
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    Выполните финальные правки и загрузите обновленную версию
                  </p>
                </div>
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Выполнить финальную правку
                </button>
              </div>
            )}
            
            {/* Общая кнопка просмотра заказа */}
            <div className="flex justify-center">
              <button
                onClick={() => onViewOrder(order.id)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-sm"
              >
                Подробнее о заказе
              </button>
            </div>
          </div>
        ) : (
          // Для completed
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">
                ✅ Заказ успешно завершен
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Клиент получил финальную версию
              </p>
            </div>
            <button
              onClick={() => onViewOrder(order.id)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Просмотреть заказ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProducerPage