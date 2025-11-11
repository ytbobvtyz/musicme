import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface Track {
    id: string
    order_id: string
    suno_id: string | null
    preview_url: string | null
    full_url: string | null
    title: string | null
    status: string
    created_at: string
    duration: number | null
    is_paid: boolean
    
    // Новые поля для хранения файлов
    audio_filename: string | null
    audio_size: number | null
    audio_mimetype: string | null
    
    order?: {
      id: string
      theme: string
      recipient_name: string
      genre: string
      status: string
      user?: {
        id: string
        email: string
        name: string | null
        avatar_url: string | null
      }
    }
  }

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

  useEffect(() => {
    fetchTracks()
  }, [])

  // Загружаем заказы при открытии формы
  const fetchOrdersForForm = async () => {
    setOrdersLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleShowAddForm = () => {
    setShowAddForm(true)
    fetchOrdersForForm() // Загружаем заказы когда открываем форму
  }

  const fetchTracks = async () => {
    try {
      console.log("Starting data fetch...")
      
      // Используем простой эндпоинт для отладки
      const tracksResponse = await fetch('http://localhost:8000/api/v1/admin/tracks-debug-simple', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
  
      console.log("Tracks response status:", tracksResponse.status)
  
      if (tracksResponse.ok) {
        const tracksData = await tracksResponse.json()
        
        console.log('=== SIMPLE TRACKS DATA ===')
        console.log('Tracks:', tracksData)
  
        // Проверяем что tracksData - массив, а не объект с ошибкой
        if (Array.isArray(tracksData)) {
          // Загружаем заказы отдельно
          const ordersResponse = await fetch('http://localhost:8000/api/v1/admin/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
  
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json()
            
            console.log('=== ORDERS DATA ===')
            console.log('Orders:', ordersData)
  
            // Создаем мапу заказов
            const ordersMap = new Map()
            ordersData.forEach((order: any) => {
              ordersMap.set(order.id, order)
            })
  
            // Обогащаем треки данными заказов
            const enrichedTracks = tracksData.map((track: any) => ({
              ...track,
              order: ordersMap.get(track.order_id) || null
            }))
  
            console.log('=== ENRICHED TRACKS ===')
            console.log('Enriched tracks:', enrichedTracks)
  
            setTracks(enrichedTracks)
            setOrders(ordersData)
          } else {
            // Если заказы не загрузились, используем только треки
            setTracks(tracksData)
          }
        } else {
          // Если tracksData не массив, показываем ошибку
          console.error('Tracks data is not array:', tracksData)
          setTracks([])
        }
      } else {
        console.error('Tracks response not ok:', tracksResponse.status)
        setTracks([])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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

    const formData = new FormData()
    formData.append('file', selectedFile)
    if (trackTitle.trim()) {
      formData.append('title', trackTitle.trim())
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/orders/${orderId}/tracks/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            // Не устанавливай Content-Type - браузер сделает это сам
          },
          body: formData
        }
      )

      console.log('Response status:', response.status)
      
      if (response.ok) {
        // Сбрасываем форму
        setSelectedFile(null)
        setTrackTitle('')
        setSelectedOrder('')
        setShowAddForm(false)
        
        // Обновляем список треков
        fetchTracks()
        alert('Трек успешно загружен!')
      } else {
        const errorText = await response.text()
        console.error('Upload error:', errorText)
        try {
          const errorData = JSON.parse(errorText)
          alert(`Ошибка: ${errorData.detail || 'Неизвестная ошибка'}`)
        } catch {
          alert(`Ошибка: ${errorText || `HTTP ${response.status}`}`)
        }
      }
    } catch (error) {
      console.error('Error uploading track:', error)
      alert('Ошибка сети при загрузке трека')
    } finally {
      setUploading(false)
    }
  }

  const deleteTrack = async (trackId: string) => {
    if (!confirm('Удалить этот трек?')) return

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/tracks/${trackId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        fetchTracks() // Обновляем список
        alert('Трек удален')
      } else {
        alert('Ошибка при удалении трека')
      }
    } catch (error) {
      console.error('Error deleting track:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      generating: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      generating: 'Генерируется',
      ready: 'Готов',
      error: 'Ошибка'
    }
    return statusMap[status] || status
  }

  const filteredTracks = selectedOrder 
    ? tracks.filter(track => track.order_id === selectedOrder)
    : tracks

  if (loading) {
    return <div className="text-center py-8">Загрузка треков...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление треками</h2>
        
        <button
          onClick={handleShowAddForm}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Загрузить трек
        </button>
      </div>

      {/* Форма загрузки трека */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Загрузить аудио файл</h3>
            
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="text-center py-4">Загрузка заказов...</div>
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
                        {order.theme} - {order.recipient_name} ({order.status})
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
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => handleFileUpload(selectedOrder)}
                      disabled={!selectedOrder || !selectedFile || uploading}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
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
          className="px-4 py-2 border rounded-lg w-full max-w-xs"
        >
          <option value="">Все заказы</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.theme} - {order.recipient_name}
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
                    Статус
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
                        <div className="font-medium">{track.order?.theme || 'Неизвестно'}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(track.status)}`}>
                        {getStatusText(track.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {track.audio_filename ? (
                            <div className="flex items-center space-x-2">
                            <audio 
                                controls 
                                className="h-8"
                                onError={(e) => console.error('Audio error for track:', track.id, e)}
                                onCanPlay={() => console.log('Audio can play:', track.id)}
                            >
                                <source 
                                src={`http://localhost:8000/api/v1/admin/tracks/${track.id}/audio-public`}
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
                        className="text-red-600 hover:text-red-900"
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