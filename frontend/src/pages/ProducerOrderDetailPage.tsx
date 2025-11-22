// src/pages/ProducerOrderDetailPage.tsx - УПРОЩЕННАЯ ВЕРСИЯ
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

// Конфигурация действий по статусам
const STATUS_ACTIONS = {
  payment_pending: {
    showPaymentConfirmation: true,
    showUploadForm: false,
    uploadButtonText: 'Загрузить трек',
    uploadFormTitle: 'Загрузка трека'
  },
  in_progress: {
    showPaymentConfirmation: false,
    showUploadForm: true,
    uploadButtonText: 'Загрузить трек',
    uploadFormTitle: 'Загрузка трека'
  },
  paid: {
    showPaymentConfirmation: false,
    showUploadForm: true,
    uploadButtonText: 'Загрузить финальный трек',
    uploadFormTitle: 'Загрузка финального трека'
  },
  in_progress_final_revision: {
    showPaymentConfirmation: false,
    showUploadForm: true,
    uploadButtonText: 'Загрузить исправленный трек',
    uploadFormTitle: 'Загрузка исправленного трека'
  },
  ready_for_review: {
    showPaymentConfirmation: false,
    showUploadForm: true,
    uploadButtonText: 'Загрузить трек',
    uploadFormTitle: 'Загрузка трека'
  },
  revision_requested: {
    showPaymentConfirmation: false,
    showUploadForm: true,
    uploadButtonText: 'Загрузить исправленный трек',
    uploadFormTitle: 'Загрузка исправленного трека'
  }
} as const

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

  const handleUpload = async (event: React.FormEvent) => {
  event.preventDefault()
  if (!orderId || !newTrackTitle.trim() || !order) return

  setUploading(true)
  try {
    const formData = new FormData()
    const fileInput = document.getElementById('audioFile') as HTMLInputElement
    
    if (!fileInput?.files?.[0]) {
      alert('Пожалуйста, выберите аудиофайл')
      return
    }

    formData.append('audio_file', fileInput.files[0])
    formData.append('title', newTrackTitle)
    formData.append('order_id', orderId)

    console.log('🔍 Uploading track for order:', orderId)
    console.log('🔍 Order status:', order.status)
    console.log('🔍 File:', fileInput.files[0].name)

    // ⬇️⬇️⬇️ ПРОСТОЙ ВАРИАНТ - всегда используем обычную загрузку ⬇️⬇️⬇️
    const trackTypeInput = document.querySelector('input[name="trackType"]:checked') as HTMLInputElement
    const isPreview = trackTypeInput?.value === 'preview'
    
    formData.append('is_preview', isPreview ? 'true' : 'false')
    
    await uploadTrack(formData)
    alert('Трек успешно загружен!')
    
    await loadOrder()
    setShowUploadForm(false)
    setNewTrackTitle('')
  } catch (error) {
    console.error('Ошибка при загрузке трека:', error)
    alert('Ошибка при загрузке трека')
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

  // Получение конфигурации действий по текущему статусу
  const currentActions = order ? STATUS_ACTIONS[order.status as keyof typeof STATUS_ACTIONS] : null

  if (!isAuthenticated) {
    return <LoadingState message="Пожалуйста, войдите в систему" />
  }

  if (loading) {
    return <LoadingState message="Загрузка заказа..." />
  }

  if (!order) {
    return <ErrorState message="Заказ не найден" />
  }

  if (!hasAccessToOrder()) {
    return <ErrorState message="У вас нет доступа к этому заказу" />
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
        {currentActions?.showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            + {currentActions.uploadButtonText}
          </button>
        )}
      </div>

      {/* Блок подтверждения оплаты */}
      {currentActions?.showPaymentConfirmation && (
        <PaymentConfirmationBlock 
          onConfirm={handleConfirmPayment}
          processing={processing}
        />
      )}

      {/* Основная информация о заказе */}
      <OrderInfo order={order} />

      {/* Форма загрузки трека */}
      {showUploadForm && currentActions && (
        <UploadForm
          order={order}
          newTrackTitle={newTrackTitle}
          onTitleChange={setNewTrackTitle}
          onSubmit={handleUpload}
          onCancel={() => setShowUploadForm(false)}
          uploading={uploading}
          formTitle={currentActions.uploadFormTitle}
        />
      )}

      {/* История комментариев */}
      {revisionComments.length > 0 && (
        <CommentsSection
          comments={revisionComments}
          groupedComments={getGroupedRevisionComments()}
          lastRevisionNumber={getLastRevisionNumber()}
          hasActiveRevision={hasActiveRevision}
          showCommentForm={showCommentForm}
          onToggleCommentForm={() => setShowCommentForm(!showCommentForm)}
          newComment={newComment}
          onCommentChange={setNewComment}
          onAddComment={handleAddComment}
          addingComment={addingComment}
          currentUser={user}
        />
      )}

      {/* Секция с треками */}
      <TracksSection
        order={order}
        tracks={order.tracks || []}
        onMarkAsReady={handleMarkAsReady}
        // onNavigateToTrack={(trackId) => navigate(`/producer/tracks/${trackId}`)}
        onShowUploadForm={() => setShowUploadForm(true)}
        getTrackAudioUrl={getTrackAudioUrl}
      />
    </div>
  )
}

// Компоненты-помощники

const LoadingState = ({ message }: { message: string }) => (
  <div className="container mx-auto px-4 py-12 text-center">
    <p className="text-xl text-gray-600">{message}</p>
  </div>
)

const ErrorState = ({ message }: { message: string }) => (
  <div className="container mx-auto px-4 py-12 text-center">
    <p className="text-xl text-gray-600">{message}</p>
    <Link to="/producer" className="text-primary-600 hover:underline mt-4 inline-block">
      Вернуться к заказам
    </Link>
  </div>
)

const PaymentConfirmationBlock = ({ onConfirm, processing }: { 
  onConfirm: () => void, 
  processing: boolean 
}) => (
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
        onClick={onConfirm}
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
)

const OrderInfo = ({ order }: { order: OrderDetail }) => (
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

    {order.details && (
      <div className="mt-4 pt-4 border-t">
        <label className="text-sm text-gray-500">Пожелания клиента</label>
        <p className="mt-1 whitespace-pre-wrap">{order.details}</p>
      </div>
    )}

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
)

const UploadForm = ({ 
  order, 
  newTrackTitle, 
  onTitleChange, 
  onSubmit, 
  onCancel, 
  uploading 
}: any) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {order.status === 'in_progress_final_revision' ? 'Загрузка исправленного трека' : 'Загрузка трека'}
      </h3>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название трека
          </label>
          <input
            type="text"
            value={newTrackTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="Например: Поздравление для Марии"
            required
          />
        </div>
        
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
                defaultChecked={order.status !== 'paid' && order.status !== 'in_progress_final_revision'}
                className="mr-2"
              />
              <span className="text-sm">Превью (первые 60 секунд)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="trackType"
                value="full"
                defaultChecked={order.status === 'paid' || order.status === 'in_progress_final_revision'}
                className="mr-2"
              />
              <span className="text-sm">Полная версия</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {order.status === 'in_progress_final_revision' 
              ? 'Загрузите исправленную полную версию' 
              : order.status === 'paid'
              ? 'Заказ оплачен - загружайте полную версию'
              : 'Для неподтвержденных заказов рекомендуется загружать превью'
            }
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Аудиофайл
          </label>
          <input
            id="audioFile"
            type="file"
            accept="audio/*"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {uploading ? 'Загрузка...' : 'Загрузить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

const CommentsSection = ({ 
  comments, 
  groupedComments, 
  lastRevisionNumber, 
  hasActiveRevision, 
  showCommentForm, 
  onToggleCommentForm, 
  newComment, 
  onCommentChange, 
  onAddComment, 
  addingComment, 
  currentUser 
}: any) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">История правок и комментарии</h2>
      {hasActiveRevision && (
        <button
          onClick={onToggleCommentForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
        >
          {showCommentForm ? 'Отмена' : '+ Добавить комментарий'}
        </button>
      )}
    </div>

    {showCommentForm && (
      <div className="mb-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
        <h3 className="font-medium text-blue-800 mb-3">Добавить комментарий к правке #{lastRevisionNumber}</h3>
        <textarea
          value={newComment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Напишите ваш комментарий или уточнение по правке..."
          className="w-full border border-blue-300 rounded-lg p-3 mb-3 h-32 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex gap-3">
          <button
            onClick={onAddComment}
            disabled={addingComment || !newComment.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {addingComment ? 'Отправка...' : 'Отправить комментарий'}
          </button>
          <button
            onClick={onToggleCommentForm}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Отмена
          </button>
        </div>
      </div>
    )}

    <div className="space-y-6">
      {Object.entries(groupedComments)
        .sort(([a], [b]) => parseInt(b) - parseInt(a))
        .map(([revisionNumber, comments]) => (
          <CommentGroup
            key={revisionNumber}
            revisionNumber={parseInt(revisionNumber)}
            comments={comments}
            lastRevisionNumber={lastRevisionNumber}
            currentUser={currentUser}
          />
        ))}
    </div>
  </div>
)

const CommentGroup = ({ revisionNumber, comments, lastRevisionNumber, currentUser }: any) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-3">
      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
        Правка #{revisionNumber}
      </span>
      <span className="text-sm text-gray-500">
        {new Date(comments[0].created_at).toLocaleDateString('ru-RU')}
      </span>
      {revisionNumber === lastRevisionNumber && (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
          Активная
        </span>
      )}
    </div>
    
    <div className="space-y-3">
      {comments.map((comment: any) => (
        <Comment key={comment.id} comment={comment} currentUser={currentUser} />
      ))}
    </div>
  </div>
)

const Comment = ({ comment, currentUser }: any) => {
  const isCurrentUser = comment.user_id === currentUser?.id
  
  return (
    <div className={`rounded-lg p-3 ${
      isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`font-medium ${
            isCurrentUser ? 'text-blue-800' : 'text-gray-800'
          }`}>
            {comment.user_name || 'Пользователь'}
          </span>
          {isCurrentUser && (
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
        isCurrentUser ? 'text-blue-700' : 'text-gray-700'
      } whitespace-pre-wrap`}>
        {comment.comment}
      </p>
    </div>
  )
}

const TracksSection = ({ order, tracks, onMarkAsReady, onNavigateToTrack, onShowUploadForm, getTrackAudioUrl }: any) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Треки заказа</h2>
      <span className="text-sm text-gray-500">
        {tracks.length} треков
      </span>
    </div>

    {tracks.length > 0 ? (
      <div className="space-y-4">
        {tracks.map((track: any) => (
          <TrackCard
            key={track.id}
            track={track}
            order={order}
            onMarkAsReady={onMarkAsReady}
            onNavigateToTrack={onNavigateToTrack}
            getTrackAudioUrl={getTrackAudioUrl}
          />
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Треки еще не загружены</p>
        <button
          onClick={onShowUploadForm}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Загрузить первый трек
        </button>
      </div>
    )}
  </div>
)

const TrackCard = ({ track, order, onMarkAsReady, onNavigateToTrack, getTrackAudioUrl }: any) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex justify-between items-start mb-3">
      <div>
        <h3 className="font-semibold text-gray-900">
          {track.title || `Трек ${track.id.slice(0, 8)}`}
        </h3>
        <p className="text-sm text-gray-600">
          Статус: {getStatusText(order.status)}
        </p>
        {track.created_at && (
          <p className="text-sm text-gray-500">
            Загружен: {new Date(track.created_at).toLocaleDateString('ru-RU')}
          </p>
        )}
      </div>
      <span className={getStatusClasses(order.status)}>
        {getStatusText(order.status)}
      </span>
    </div>

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

    <div className="mt-3 flex gap-2">
      {order.status === 'ready_for_review' && (
        <button
          onClick={() => onMarkAsReady(track.id)}
          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          Отправить на проверку
        </button>
      )}
      
      {order.status === 'revision_requested' && (
        <button
          onClick={() => onNavigateToTrack(track.id)}
          className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
        >
          Выполнить доработку
        </button>
      )}

      <button
        onClick={() => onNavigateToTrack(track.id)}
        className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
      >
        Детали
      </button>
    </div>
  </div>
)

export default ProducerOrderDetailPage