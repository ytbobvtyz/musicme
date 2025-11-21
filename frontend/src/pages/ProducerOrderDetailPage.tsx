// src/pages/ProducerOrderDetailPage.tsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getOrder } from '@/api/orders'
import { 
  updateOrderStatus, 
  uploadTrack, 
  updateTrack, 
  addProducerComment,
  producerConfirmPayment,
  uploadFinalTrack
} from '@/api/producer'
import { getRevisionComments, RevisionComment } from '@/api/revision'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'
import { OrderDetail } from '@/types/order'
import { Track } from '@/types/track'

const ProducerOrderDetailPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [newTrackTitle, setNewTrackTitle] = useState('')
  const [revisionComments, setRevisionComments] = useState<RevisionComment[]>([])
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrder()
      loadRevisionComments()
    }
  }, [isAuthenticated, orderId])

  const loadOrder = async () => {
    try {
      const data = await getOrder(orderId!)
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

  const handleUploadTrack = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orderId || !newTrackTitle.trim()) return
  
    setUploading(true)
    try {
      const formData = new FormData()
      const fileInput = document.getElementById('audioFile') as HTMLInputElement
      const trackTypeInput = document.querySelector('input[name="trackType"]:checked') as HTMLInputElement
      
      if (!fileInput?.files?.[0]) {
        alert('Пожалуйста, выберите аудиофайл')
        return
      }
  
      formData.append('audio_file', fileInput.files[0])
      formData.append('title', newTrackTitle)
      formData.append('order_id', orderId)
      formData.append('is_preview', trackTypeInput.value === 'preview' ? 'true' : 'false')
  
      await uploadTrack(formData)
      await loadOrder()
      setShowUploadForm(false)
      setNewTrackTitle('')
      alert('Трек успешно загружен!')
    } catch (error) {
      console.error('Ошибка при загрузке трека:', error)
      alert('Ошибка при загрузке трека')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadFinalTrack = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!orderId || !newTrackTitle.trim()) return
  
    setUploading(true)
    try {
      const formData = new FormData()
      const fileInput = document.getElementById('finalAudioFile') as HTMLInputElement
      
      if (!fileInput?.files?.[0]) {
        alert('Пожалуйста, выберите аудиофайл')
        return
      }
  
      formData.append('audio_file', fileInput.files[0])
      formData.append('title', newTrackTitle)
      formData.append('order_id', orderId)
  
      await uploadFinalTrack(formData)
      await loadOrder()
      setShowUploadForm(false)
      setNewTrackTitle('')
      alert('Финальный трек успешно загружен! Пользователь получит уведомление.')
    } catch (error) {
      console.error('Ошибка при загрузке финального трека:', error)
      alert('Ошибка при загрузке финального трека')
    } finally {
      setUploading(false)
    }
  }

  const handleMarkAsReady = async (trackId: string) => {
    try {
      await updateTrack(trackId, { status: 'ready' })
      await updateOrderStatus(orderId!, 'ready_for_review')
      await loadOrder()
      alert('Трек помечен как готовый для проверки клиентом')
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error)
      alert('Ошибка при обновлении статуса')
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      alert('Пожалуйста, введите комментарий')
      return
    }

    setAddingComment(true)
    try {
      await addProducerComment(orderId!, newComment)
      await loadRevisionComments()
      setNewComment('')
      setShowCommentForm(false)
      alert('Комментарий добавлен!')
    } catch (error: any) {
      console.error('Ошибка при добавлении комментария:', error)
      alert(error.message || 'Ошибка при добавлении комментария')
    } finally {
      setAddingComment(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!window.confirm('Вы уверены, что оплата получена? После подтверждения вы сможете загрузить финальный трек.')) {
      return
    }

    setProcessing(true)
    try {
      const result = await producerConfirmPayment(orderId!)
      await loadOrder()
      alert(result.message)
    } catch (error: any) {
      console.error('Ошибка при подтверждении оплаты:', error)
      alert(error.message || 'Ошибка подтверждения оплаты')
    } finally {
      setProcessing(false)
    }
  }

  const getTrackAudioUrl = (track: any) => {
    if (track.audio_filename) {
      return `http://localhost:8000/api/v1/tracks/${track.id}/audio`
    }
    return track.preview_url || track.full_url
  }

  const getTrackStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'generating': 'Генерируется',
      'ready': 'Готов для проверки',
      'ready_for_review': 'На проверке у клиента',
      'revision_requested': 'Требует доработки',
      'paid': 'Оплачен',
      'completed': 'Завершен'
    }
    return statusMap[status] || status
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

  const getLastRevisionNumber = () => {
    if (revisionComments.length === 0) return 0
    return Math.max(...revisionComments.map(comment => comment.revision_number))
  }

  const hasActiveRevision = getLastRevisionNumber() > 0

  // Проверка доступа к заказу
  const hasAccessToOrder = () => {
    if (!order || !user) return false
    if (user.is_admin) return true
    return order.producer_id === user.id
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
        <Link to="/producer" className="text-primary-600 hover:underline mt-4 inline-block">
          Вернуться к заказам
        </Link>
      </div>
    )
  }

  if (!hasAccessToOrder()) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">У вас нет доступа к этому заказу</p>
        <Link to="/producer" className="text-primary-600 hover:underline mt-4 inline-block">
          Вернуться к заказам
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Хлебные крошки */}
      <nav className="mb-8">
        <Link to="/producer" className="text-primary-600 hover:underline">
          ← Назад к заказам
        </Link>
      </nav>

      {/* Заголовок и статус */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Заказ #{order.id.slice(0, 8)}
          </h1>
          <div className={getStatusClasses(order.status)}>
            {getStatusText(order.status)}
          </div>
        </div>
        
        {/* Действия для продюсера */}
        <div className="flex gap-3">
          {(order.status === 'in_progress' || order.status === 'paid') && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              + Загрузить трек
            </button>
          )}
        </div>
      </div>

      {/* Блок статуса оплаты */}
      {order?.status === 'payment_pending' && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-full">
              <span className="text-orange-600 text-xl">💰</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">
                Пользователь заявил об оплате
              </h3>
              <p className="text-orange-700">
                Клиент подтвердил, что перевел оплату. Проверьте поступление средств и подтвердите оплату.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConfirmPayment}
              disabled={processing}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <span>✅</span>
              <span>Я убедился в оплате</span>
            </button>
            
            <div className="bg-orange-100 p-3 rounded-lg flex-1">
              <p className="text-sm text-orange-800">
                <strong>Внимание:</strong> Подтверждая оплату, вы берете на себя ответственность за проверку поступления средств.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Основная информация */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Информация о заказе</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Для кого</label>
            <p className="font-medium">{order.recipient_name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Повод</label>
            <p className="font-medium">{order.occasion || 'Не указано'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Тариф</label>
            <p className="font-medium capitalize">{order.tariff_plan}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Дедлайн</label>
            <p className="font-medium">
              {new Date(order.deadline_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        </div>

        {/* Детали заказа */}
        {order.details && (
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm text-gray-500">Пожелания клиента</label>
            <p className="mt-1 whitespace-pre-wrap">{order.details}</p>
          </div>
        )}

        {/* Анкета для продвинутых тарифов */}
        {order.preferences?.questionnaire && (
          <div className="mt-4 pt-4 border-t">
            <label className="text-sm text-gray-500">Ответы из анкеты</label>
            <div className="mt-2 space-y-2 text-sm">
              {Object.entries(order.preferences.questionnaire).map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium">{key}:</span> {String(value)}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Форма загрузки трека */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {order?.status === 'paid' ? 'Загрузка финального трека' : 'Загрузка нового трека'}
          </h3>
          <form onSubmit={order?.status === 'paid' ? handleUploadFinalTrack : handleUploadTrack} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название трека
              </label>
              <input
                type="text"
                value={newTrackTitle}
                onChange={(e) => setNewTrackTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder={
                  order?.status === 'paid' 
                    ? "Например: Полная версия для Марии" 
                    : "Например: Поздравление для Марии"
                }
                required
              />
            </div>
            
            {/* Переключатель превью/полный трек - только для НЕ оплаченных заказов */}
            {order?.status !== 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Версия трека
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trackType"
                      value="preview"
                      defaultChecked={order?.status !== 'paid'}
                      className="mr-2"
                    />
                    <span className="text-sm">Превью (первые 60 секунд)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="trackType"
                      value="full"
                      defaultChecked={order?.status === 'paid'}
                      className="mr-2"
                    />
                    <span className="text-sm">Полная версия</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {order?.status === 'paid' 
                    ? 'Заказ оплачен - загружайте полную версию' 
                    : 'Для неподтвержденных заказов рекомендуется загружать превью'
                  }
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Аудиофайл
              </label>
              <input
                id={order?.status === 'paid' ? 'finalAudioFile' : 'audioFile'}
                type="file"
                accept="audio/*"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              {order?.status === 'paid' && (
                <p className="text-sm text-green-600 mt-1">
                  ✅ Это финальная версия для клиента
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {uploading 
                  ? 'Загрузка...' 
                  : order?.status === 'paid' 
                    ? 'Загрузить финальный трек' 
                    : 'Загрузить'
                }
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* История комментариев */}
      {revisionComments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">История правок и комментарии</h2>
            {hasActiveRevision && (
              <button
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                {showCommentForm ? 'Отмена' : '+ Добавить комментарий'}
              </button>
            )}
          </div>

          {/* Форма добавления комментария */}
          {showCommentForm && (
            <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h3 className="font-medium text-blue-800 mb-3">Добавить комментарий к правке #{getLastRevisionNumber()}</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите ваш комментарий или уточнение по правке..."
                className="w-full border border-blue-300 rounded-lg p-3 mb-3 h-32 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddComment}
                  disabled={addingComment || !newComment.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingComment ? 'Отправка...' : 'Отправить комментарий'}
                </button>
                <button
                  onClick={() => {
                    setShowCommentForm(false)
                    setNewComment('')
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Список комментариев */}
          <div className="space-y-6">
            {Object.entries(getGroupedRevisionComments())
              .sort(([a], [b]) => parseInt(b) - parseInt(a))
              .map(([revisionNumber, comments]) => (
                <div key={revisionNumber} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                      Правка #{revisionNumber}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comments[0].created_at).toLocaleDateString('ru-RU')}
                    </span>
                    {parseInt(revisionNumber) === getLastRevisionNumber() && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                        Активная
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className={`rounded-lg p-3 ${
                        comment.user_id === user?.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              comment.user_id === user?.id ? 'text-blue-800' : 'text-gray-800'
                            }`}>
                              {comment.user_name || 'Пользователь'}
                            </span>
                            {comment.user_id === user?.id && (
                              <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs">
                                Вы
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.created_at).toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className={`${
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

      {/* Секция с треками */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Треки заказа</h2>
          <span className="text-sm text-gray-500">
            {order.tracks?.length || 0} треков
          </span>
        </div>

        {order.tracks && order.tracks.length > 0 ? (
          <div className="space-y-4">
            {order.tracks.map((track) => (
              <div key={track.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {track.title || `Трек ${track.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Статус: {getTrackStatusText(order.status)}
                    </p>
                    {track.created_at && (
                      <p className="text-sm text-gray-500">
                        Загружен: {new Date(track.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'ready' ? 'bg-green-100 text-green-800' :
                    order.status === 'ready_for_review' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getTrackStatusText(order.status)}
                  </span>
                </div>

                {/* Аудиоплеер */}
                {(track.audio_filename || track.preview_url) && (
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
                  </div>
                )}

                {/* Действия для трека */}
                <div className="mt-3 flex gap-2">
                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleMarkAsReady(track.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Отправить на проверку
                    </button>
                  )}
                  
                  {order.status === 'revision_requested' && (
                    <button
                      onClick={() => navigate(`/producer/tracks/${track.id}/edit`)}
                      className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                    >
                      Выполнить доработку
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/producer/tracks/${track.id}`)}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Детали
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Треки еще не загружены</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Загрузить первый трек
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProducerOrderDetailPage