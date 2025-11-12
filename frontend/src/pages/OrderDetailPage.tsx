import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getOrder } from '@/api/orders'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'
import { OrderDetail } from '@/types/order'

const OrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { isAuthenticated } = useAuthStore()
  const [order, setOrder] = useState<OrderDetail | null>(null)
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
      console.log('🎵 Треки заказа:', data.tracks) 
      setOrder(data)
    } catch (error) {
      console.error('Ошибка при загрузке заказа:', error)
    } finally {
      setLoading(false)
    }
  }

  // Функции для работы с треками
  const getTrackAudioUrl = (track: any) => {
    if (track.audio_filename) {
      return `http://localhost:8000/api/v1/tracks/${track.id}/audio`
    }
    return track.preview_url || track.full_url
  }

  const getTrackStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'generating': 'Генерируется',
      'ready': 'Готов',
      'error': 'Ошибка'
    }
    return statusMap[status] || status
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
      {/* Секция с треками */}
      {order.tracks && order.tracks.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Треки заказа</h2>
          <div className="space-y-4">
            {order.tracks.map((track) => (
              <div key={track.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {track.title || `Трек ${track.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Статус: {getTrackStatusText(track.status)}
                    </p>
                    {track.duration && (
                      <p className="text-sm text-gray-600">
                        Длительность: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    track.status === 'ready' ? 'bg-green-100 text-green-800' :
                    track.status === 'generating' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {getTrackStatusText(track.status)}
                  </span>
                </div>

                {/* Аудиоплеер для готовых треков */}
                {track.status === 'ready' && (
                  <div className="mt-3">
                    <audio 
                      controls 
                      className="w-full rounded-lg [&::-webkit-media-controls-panel]:bg-gray-100"
                    >
                      <source 
                        src={getTrackAudioUrl(track)} 
                        type="audio/mpeg" 
                      />
                      Ваш браузер не поддерживает аудио элементы.
                    </audio>
                    {track.is_paid && (
                      <p className="text-sm text-green-600 mt-2">✅ Оплачено</p>
                    )}
                  </div>
                )}

                {/* Кнопка оплаты для превью */}
                {track.status === 'ready' && track.preview_url && !track.is_paid && (
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Доступно 60 секунд превью
                    </span>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm">
                      Купить полную версию
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Сообщение если треков нет */}
      {order.tracks && order.tracks.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Треки заказа</h2>
          <p className="text-gray-600 text-center py-4">
            Треки еще не созданы. Мы уведомим вас, когда они появятся.
          </p>
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