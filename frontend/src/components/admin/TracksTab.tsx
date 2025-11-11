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
      theme: string
      recipient_name: string
      user?: {
        email: string
        name: string
      }
    }
  }
  
interface ExampleTrack {
  id: string
  title: string
  genre: string
  theme: string
  description: string | null
  audio_filename: string | null
  audio_size: number | null
  audio_mimetype: string | null
  is_active: boolean
  created_at: string
}
const TracksTab = () => {
  const { token } = useAuthStore()
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState('')
  const [orders, setOrders] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTrackUrl, setNewTrackUrl] = useState('')
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
      const response = await fetch('http://localhost:8000/api/v1/admin/tracks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTracks(data)
        
        // Также загружаем заказы для фильтра
        const ordersResponse = await fetch('http://localhost:8000/api/v1/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json()
          setOrders(ordersData)
        }
      }
    } catch (error) {
      console.error('Error fetching tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTrackToOrder = async (orderId: string) => {
    // Извлекаем suno_id из URL
    const sunoId = extractSunoId(newTrackUrl.trim());
    
    if (!sunoId) {
      alert('Неверный формат URL Suno. Пример: https://suno.com/s/mT7R9CyNaLBHJ5as');
      return;
    }
  
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/orders/${orderId}/tracks`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            suno_id: sunoId,
            preview_url: newTrackUrl.trim(), // Используем как preview_url
            full_url: newTrackUrl.trim(),    // И как full_url
            title: `Трек ${sunoId}`,
            status: "ready"
          })
        }
      )
  
      console.log('Response status:', response.status)
      
      const responseText = await response.text()
      console.log('Raw response:', responseText)
  
      if (response.ok) {
        setNewTrackUrl('')
        setSelectedOrder('')
        setShowAddForm(false)
        fetchTracks()
        alert('Трек успешно добавлен!')
      } else {
        try {
          const errorData = JSON.parse(responseText)
          console.log('Parsed error:', errorData)
          alert(`Ошибка: ${errorData.detail || JSON.stringify(errorData)}`)
        } catch {
          alert(`Ошибка: ${responseText || `HTTP ${response.status}`}`)
        }
      }
    } catch (error) {
      console.error('Error adding track:', error)
      alert('Ошибка сети при добавлении трека')
    }
  }
  
  // Функция для извлечения suno_id из URL
  const extractSunoId = (url: string): string | null => {
    const match = url.match(/suno\.com\/s\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
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
          + Добавить трек
        </button>
      </div>

      {/* Форма добавления трека */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Добавить трек к заказу</h3>
            
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

                  <input
                    type="url"
                    placeholder="URL аудиофайла"
                    value={newTrackUrl}
                    onChange={(e) => setNewTrackUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowAddForm(false)
                        setSelectedOrder('')
                        setNewTrackUrl('')
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={() => addTrackToOrder(selectedOrder)}
                      disabled={!selectedOrder || !newTrackUrl.trim()}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      Добавить
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
                    Suno ID
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
                        {track.audio_filename ? (
                            <div className="flex items-center space-x-2">
                            <audio controls className="h-8">
                                <source 
                                src={`http://localhost:8000/api/v1/admin/tracks/${track.id}/audio`} 
                                type="audio/mpeg" 
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
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(track.status)}`}>
                        {getStatusText(track.status)}
                        </span>
                    </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {track.full_url ? (
                                <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">Полная:</span>
                                    <audio 
                                    controls 
                                    className="h-8"
                                    onError={(e) => {
                                        console.error('Audio error:', e);
                                        console.log('Audio URL:', track.full_url);
                                    }}
                                    onCanPlay={(e) => {
                                        console.log('Audio can play:', track.full_url);
                                    }}
                                    >
                                    <source src={track.full_url} type="audio/mpeg" />
                                    Ваш браузер не поддерживает аудио элементы.
                                    </audio>
                                    <a 
                                    href={track.full_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:text-blue-700"
                                    >
                                    ↗
                                    </a>
                                </div>
                                {track.preview_url && track.preview_url !== track.full_url && (
                                    <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">Превью:</span>
                                    <audio 
                                        controls 
                                        className="h-8"
                                        onError={(e) => console.error('Preview error:', e)}
                                    >
                                        <source src={track.preview_url} type="audio/mpeg" />
                                    </audio>
                                    <a 
                                        href={track.preview_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-500 hover:text-blue-700"
                                    >
                                        ↗
                                    </a>
                                    </div>
                                )}
                                </div>
                            ) : track.preview_url ? (
                                <div className="flex items-center space-x-2">
                                <audio 
                                    controls 
                                    className="h-8"
                                    onError={(e) => console.error('Audio error:', e)}
                                >
                                    <source src={track.preview_url} type="audio/mpeg" />
                                    Ваш браузер не поддерживает аудио элементы.
                                </audio>
                                <a 
                                    href={track.preview_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-500 hover:text-blue-700"
                                >
                                    ↗
                                </a>
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
      )}
    </div>
  )
}

export default TracksTab