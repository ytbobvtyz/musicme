import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getOrder, requestRevision } from '@/api/orders'
import { createPayment } from '@/api/payments'
import { getRevisionComments, RevisionComment } from '@/api/revision'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'
import { OrderDetail } from '@/types/order'
import PaymentFAQ from '@/components/PaymentFAQ'

const OrderDetailPage = () => {
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const { isAuthenticated, user } = useAuthStore()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [revisionComment, setRevisionComment] = useState('')
  const [processing, setProcessing] = useState(false)
  const [revisionComments, setRevisionComments] = useState<RevisionComment[]>([])
  const [showFAQ, setShowFAQ] = useState(false)

  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrder()
      loadRevisionComments()
    }
  }, [isAuthenticated, orderId])

  const loadOrder = async () => {
    try {
      const data = await getOrder(orderId!)
      console.log('📦 Получен заказ:', data)
      console.log('🎵 Треки заказа:', data.tracks)
      setOrder(data)
    } catch (error) {
      console.error('Ошибка при загрузке заказа:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRevisionComments = async () => {
    try {
      const comments = await getRevisionComments(orderId!)
      setRevisionComments(comments)
    } catch (error) {
      console.error('Ошибка при загрузке комментариев:', error)
    }
  }
  // Функции для работы с треками
  const getTrackAudioUrl = (track: any) => {
    if (track.audio_filename) {
      return `http://localhost:8000/api/v1/tracks/${track.id}/audio`
    }
    return track.preview_url || track.full_url
  }

  // Функция для проверки доступности аудио
  const hasAudio = (track: any) => {
    return track.audio_filename || track.preview_url || track.full_url
  }

  const handleRequestRevision = async () => {
    if (!revisionComment.trim()) {
      alert('Пожалуйста, укажите комментарий к правке')
      return
    }

    setProcessing(true)
    try {
      await requestRevision(orderId!, revisionComment)
      await loadOrder()
      await loadRevisionComments()
      setShowRevisionModal(false)
      setRevisionComment('')
      alert('Правка запрошена успешно!')
    } catch (error: any) {
      console.error('Ошибка при запросе правки:', error)
      alert(error.message || 'Ошибка при запросе правки')
    } finally {
      setProcessing(false)
    }
  }
  const getGroupedRevisionComments = () => {
    const grouped: { [key: number]: RevisionComment[] } = {}
    
    revisionComments.forEach(comment => {
      if (!grouped[comment.revision_number]) {
        grouped[comment.revision_number] = []
      }
      grouped[comment.revision_number].push(comment)
    })
    
    return grouped
  }

  const handleCreatePayment = async () => {
    if (!orderId) return
    // Переходим на страницу ручной оплаты
    navigate(`/orders/${orderId}/payment`)
  }

  // Функции для работы с объектами
  const getThemeText = (themeObj?: { name: string }) => {
    return themeObj?.name || 'Неизвестно'
  }

  const getGenreText = (genreObj?: { name: string }) => {
    return genreObj?.name || 'Неизвестно'
  }

  // Проверка доступности правок
  const canRequestRevision = order && order.rounds_remaining > 0

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
            <p className="font-medium">{getThemeText(order.theme)}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Жанр</label>
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
          <div>
            <label className="text-sm text-gray-500">Тариф</label>
            <p className="font-medium capitalize">{order.tariff_plan}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Цена</label>
            <p className="font-medium">{order.price} ₽</p>
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
                    {track.duration && (
                      <p className="text-sm text-gray-600">
                        Длительность: {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                    {/* Показываем тип трека */}
                    {track.is_preview ? (
                      <p className="text-sm text-purple-600">🎵 Превью версия (60 сек)</p>
                    ) : (
                      <p className="text-sm text-green-600">✅ Полная версия</p>
                    )}
                  </div>
                  {/* УДАЛЯЕМ статус трека */}
                </div>

                {/* Аудиоплеер - показываем всегда если есть аудио */}
                {hasAudio(track) && (
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
                    
                    {/* Информация о доступности */}
                    {track.is_preview && order.status === 'ready_for_review' && (
                      <p className="text-sm text-blue-600 mt-2">
                        ⏱️ Доступно для прослушивания 60 секунд
                      </p>
                    )}
                  </div>
                )}

                {/* Сообщение если аудио нет */}
                {!hasAudio(track) && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Аудиофайл еще не загружен
                    </p>
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
      {/* секция истории правок */}
      {revisionComments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">История ваших правок</h2>
          <div className="space-y-4">
            {Object.entries(getGroupedRevisionComments())
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([revisionNumber, comments]) => (
                <div key={revisionNumber} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                      Правка #{revisionNumber}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comments[0].created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {comments.map((comment) => (
                      <div key={comment.id} className={`rounded-lg p-3 ${
                        comment.user_id === user?.id ? 'bg-blue-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-sm font-medium ${
                            comment.user_id === user?.id ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {comment.user_id === user?.id ? 'Вы' : 'Продюсер'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleTimeString('ru-RU')}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          comment.user_id === user?.id ? 'text-blue-700' : 'text-gray-700'
                        } whitespace-pre-wrap`}>
                          {comment.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {/* Модальное окно для запроса правки */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Запрос правки</h3>
            <p className="text-sm text-gray-600 mb-2">
              Осталось правок: <strong>{order?.rounds_remaining || 0}</strong>
            </p>
            <textarea
              value={revisionComment}
              onChange={(e) => setRevisionComment(e.target.value)}
              placeholder="Опишите, что именно нужно изменить в треке..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 h-32 resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleRequestRevision}
                disabled={processing || !revisionComment.trim()}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 flex-1"
              >
                {processing ? 'Отправка...' : 'Отправить на доработку'}
              </button>
              <button
                onClick={() => {
                  setShowRevisionModal(false)
                  setRevisionComment('')
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex-1"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Блок действий */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Действия</h2>
        <div className="flex flex-wrap gap-4">
          {/* Запрос правки */}
          {order.status === 'ready_for_review' && (
            <>
              {canRequestRevision ? (
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
                >
                  Отправить на доработку
                </button>
              ) : (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-gray-600 text-sm">
                    Лимит правок по вашему тарифу исчерпан
                  </p>
                </div>
              )}
            </>
          )}

          {/* Оплата */}
          {order.status === 'ready_for_review' && (
            <>
              <button
                onClick={handleCreatePayment}
                disabled={processing}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Обработка...' : `Оплатить ${order.price} ₽`}
              </button>
              
              <button
                onClick={() => setShowFAQ(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                ❓ Что будет после оплаты?
              </button>
            </>
          )}

          {/* Интервью */}
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

        {/* Информация о правках */}
        {order.status === 'ready_for_review' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Осталось правок по тарифу: <strong>{order.rounds_remaining}</strong>
            </p>
            {order.rounds_remaining === 0 && (
              <p className="text-sm text-orange-800 mt-1">
                После исчерпания лимита вы не сможете запрашивать дополнительные правки
              </p>
            )}
          </div>
        )}
      </div>
      <PaymentFAQ isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
    </div>
  )
}

export default OrderDetailPage