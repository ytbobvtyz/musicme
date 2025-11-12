import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getOrder } from '@/api/orders'
import { Order } from '@/types/order'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { isAuthenticated } = useAuthStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrder()
    }
  }, [isAuthenticated, orderId])

  const loadOrder = async () => {
    try {
      const data = await getOrder(orderId!)
      console.log('📦 Получен заказ:', data) // ← ДЛЯ ОТЛАДКИ
      setOrder(data)
    } catch (error) {
      console.error('Ошибка при загрузке заказа:', error)
    } finally {
      setLoading(false)
    }
  }


  // ⬇️⬇️⬇️ ОБНОВИЛИ ФУНКЦИИ ДЛЯ РАБОТЫ С ОБЪЕКТАМИ ⬇️⬇️⬇️
  const getThemeText = (themeObj?: { name: string }) => {
    return themeObj?.name || 'Неизвестно'
  }

  const getGenreText = (genreObj?: { name: string }) => {
    return genreObj?.name || 'Неизвестно'
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
        <p className="text-xl text-gray-600">Загрузка заказа...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Заказ не найден</p>
        <Link to="/orders" className="text-primary-600 hover:underline mt-4 inline-block">
          Вернуться к списку заказов
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Хлебные крошки */}
      <nav className="mb-8">
        <Link to="/orders" className="text-primary-600 hover:underline">
          ← Назад к заказам
        </Link>
      </nav>

      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Заказ #{order.id.slice(0, 8)}
        </h1>
        <div className={getStatusClasses(order.status)}>
          {getStatusText(order.status)}
        </div>
      </div>

      {/* Основная информация */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Повод</label>
            {/* ⬇️⬇️⬇️ ИСПОЛЬЗУЕМ ОБЪЕКТ theme ⬇️⬇️⬇️ */}
            <p className="font-medium">{getThemeText(order.theme)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Жанр</label>
            {/* ⬇️⬇️⬇️ ИСПОЛЬЗУЕМ ОБЪЕКТ genre ⬇️⬇️⬇️ */}
            <p className="font-medium">{getGenreText(order.genre)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Для кого</label>
            <p className="font-medium">{order.recipient_name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Дата создания</label>
            <p className="font-medium">
              {new Date(order.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>
      </div>

      {/* Детали заказа */}
      {(order.occasion || order.details) && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Детали заказа</h2>
          {order.occasion && (
            <div className="mb-4">
              <label className="text-sm text-gray-500">Описание повода</label>
              <p className="mt-1">{order.occasion}</p>
            </div>
          )}
          {order.details && (
            <div>
              <label className="text-sm text-gray-500">Особые пожелания</label>
              <p className="mt-1 whitespace-pre-wrap">{order.details}</p>
            </div>
          )}
        </div>
      )}

      {/* Интервью (если есть) */}
      {order.interview_link && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ссылка на интервью</h2>
          <a 
            href={order.interview_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline break-all"
          >
            {order.interview_link}
          </a>
        </div>
      )}

      {/* Действия */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Действия</h2>
        <div className="flex flex-wrap gap-4">
          {order.status === 'waiting_interview' && order.interview_link && (
            <a 
              href={order.interview_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Пройти интервью
            </a>
          )}
          <Link 
            to="/orders"
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            К списку заказов
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage