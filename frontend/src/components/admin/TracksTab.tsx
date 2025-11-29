// components/admin/TracksTab.tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Track } from '@/types/track'
import { 
  getAdminOrders, 
  getAdminTracksSimple,
  uploadAdminTrack,
  deleteAdminTrack,
  getTrackAudioPublicUrl 
} from '@/api/admin'
import { getStatusText, getStatusClasses } from '@/utils/statusUtils'

const TracksTab = () => {
  const { token } = useAuthStore()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [trackTitle, setTrackTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTracks()
  }, [])

  // Загружаем заказы при открытии формы
  const fetchOrdersForForm = async () => {
    setOrdersLoading(true)
    setError(null)
    try {
      const data = await getAdminOrders()
      setOrders(data)
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      setError('Ошибка загрузки заказов')
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleShowAddForm = () => {
    setShowAddForm(true)
    fetchOrdersForForm()
  }

  const fetchTracks = async () => {
    try {
      setError(null)
      console.log("Starting data fetch...")
      
      // Используем API модули вместо прямых fetch
      const [tracksData, ordersData] = await Promise.all([
        getAdminTracksSimple(),
        getAdminOrders()
      ])
  
      console.log('=== TRACKS DATA ===')
      console.log('Tracks:', tracksData)
      console.log('=== ORDERS DATA ===') 
      console.log('Orders:', ordersData)

      // Обогащаем треки данными заказов
      const ordersMap = new Map()
      ordersData.forEach((order: any) => {
        ordersMap.set(order.id, order)
      })

      const enrichedTracks = tracksData.map((track: any) => ({
        ...track,
        order: ordersMap.get(track.order_id) || null
      }))

      console.log('=== ENRICHED TRACKS ===')
      console.log('Enriched tracks:', enrichedTracks)

      setTracks(enrichedTracks)
      setOrders(ordersData)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      setError('Ошибка загрузки данных')
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (orderId: string) => {
    if (!selectedFile) {
      alert('Выберите файл для загрузки')
      return
    }

    if (!orderId) {
      alert('Выберите заказ')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      if (trackTitle.trim()) {
        formData.append('title', trackTitle.trim())
      }

      await uploadAdminTrack(orderId, formData)
      
      // Сбрасываем форму
      setSelectedFile(null)
      setTrackTitle('')
      setSelectedOrder('')
      setShowAddForm(false)
      
      // Обновляем список треков
      await fetchTracks()
      alert('Трек успешно загружен!')
    } catch (error: any) {
      console.error('Error uploading track:', error)
      setError(error.message || 'Ошибка загрузки трека')
      alert(error.message || 'Ошибка загрузки трека')
    } finally {
      setUploading(false)
    }
  }

  const deleteTrack = async (trackId: string) => {
    if (!confirm('Удалить этот трек?')) return

    setError(null)

    try {
      await deleteAdminTrack(trackId)
      await fetchTracks()
      alert('Трек удален')
    } catch (error: any) {
      console.error('Error deleting track:', error)
      setError(error.message || 'Ошибка удаления трека')
      alert(error.message || 'Ошибка удаления трека')
    }
  }

  const filteredTracks = selectedOrder 
    ? tracks.filter(track => track.order_id === selectedOrder)
    : tracks

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загрузка треков...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление треками</h2>
        
        <button
          onClick={handleShowAddForm}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          + Загрузить трек
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-2">⚠️</div>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Форма загрузки трека */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Загрузить аудио файл</h3>
            
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Загрузка заказов...</p>
                </div>
              ) : (
                <>
                  <select
                    value={selectedOrder}
                    onChange={(e) => setSelectedOrder(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Выберите заказ</option>
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.theme?.name || 'Неизвестно'} - {order.recipient_name} ({getStatusText(order.status)})
                      </option>
                    ))}
                  </select>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название трека (необязательно)
                    </label>
                    <input
                      type="text"
                      placeholder="Название трека"
                      value={trackTitle}
                      onChange={(e) => setTrackTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Аудио файл *
                    </label>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/wav,audio/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Файл:</strong> {selectedFile.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Размер:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Тип:</strong> {selectedFile.type || 'Не определен'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setSelectedOrder('')
                        setSelectedFile(null)
                        setTrackTitle('')
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleFileUpload(selectedOrder)}
                      disabled={!selectedOrder || !selectedFile || uploading}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      {uploading ? 'Загрузка...' : 'Загрузить'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Фильтр по заказам */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фильтр по заказу:
        </label>
        <select 
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full max-w-xs transition-colors"
        >
          <option value="">Все заказы</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.theme?.name || 'Неизвестно'} - {order.recipient_name} ({getStatusText(order.status)})
            </option>
          ))}
        </select>
      </div>

      {/* Список треков */}
      {filteredTracks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedOrder ? 'Треков для этого заказа не найдено' : 'Треков не найдено'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID трека
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заказ / Получатель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Аудио
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTracks.map((track) => (
                  <tr key={track.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {track.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{track.order?.theme?.name || 'Неизвестно'}</div>
                        <div className="text-xs text-gray-400">
                          Для: {track.order?.recipient_name || 'Не указано'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {track.order?.user?.name || track.order?.user?.email || 'Неизвестно'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {track.title || 'Без названия'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {track.audio_filename ? (
                            <div className="flex items-center space-x-2">
                            <audio 
                                controls 
                                className="h-8"
                                onError={(e) => console.error('Audio error for track:', track.id, e)}
                            >
                                <source 
                                src={getTrackAudioPublicUrl(track.id)}
                                type={track.audio_mimetype || "audio/mpeg"} 
                                />
                                Ваш браузер не поддерживает аудио элементы.
                            </audio>
                            {track.audio_size && (
                                <span className="text-xs text-gray-400">
                                ({(track.audio_size / 1024 / 1024).toFixed(1)} MB)
                                </span>
                            )}
                            </div>
                        ) : (
                            <span className="text-gray-400">Нет аудио</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteTrack(track.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
        </div>
      )}
    </div>
  )
}

export default TracksTab