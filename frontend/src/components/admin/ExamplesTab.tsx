import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

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

const ExamplesTab = () => {
  const { token } = useAuthStore()
  const [tracks, setTracks] = useState<ExampleTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Форма загрузки
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [theme, setTheme] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchExampleTracks()
  }, [])

  const fetchExampleTracks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/admin/example-tracks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTracks(data)
      }
    } catch (error) {
      console.error('Error fetching example tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !title || !genre || !theme) {
      alert('Заполните все обязательные поля')
      return
    }

    setUploading(true)
    
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', title)
    formData.append('genre', genre)
    formData.append('theme', theme)
    if (description) {
      formData.append('description', description)
    }

    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/admin/example-tracks/upload',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      )

      if (response.ok) {
        // Сбрасываем форму
        setTitle('')
        setGenre('')
        setTheme('')
        setDescription('')
        setSelectedFile(null)
        setShowUploadForm(false)
        
        // Обновляем список
        fetchExampleTracks()
        alert('Пример трека успешно загружен!')
      } else {
        const error = await response.text()
        alert(`Ошибка загрузки: ${error}`)
      }
    } catch (error) {
      console.error('Error uploading example track:', error)
      alert('Ошибка при загрузке примера трека')
    } finally {
      setUploading(false)
    }
  }

  const deleteExampleTrack = async (trackId: string) => {
    if (!confirm('Удалить этот пример трека?')) return

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/admin/example-tracks/${trackId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (response.ok) {
        fetchExampleTracks()
        alert('Пример трека удален')
      }
    } catch (error) {
      console.error('Error deleting example track:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка примеров треков...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Управление примерами треков</h2>
        
        <button
          onClick={() => setShowUploadForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          + Добавить пример
        </button>
      </div>

      {/* Форма загрузки */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Добавить пример трека</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Название трека *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Жанр *"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="Тема *"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />

              <textarea
                placeholder="Описание (необязательно)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MP3 файл *
                </label>
                <input
                  type="file"
                  accept="audio/mpeg,audio/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">
                    Выбран: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadForm(false)
                    setTitle('')
                    setGenre('')
                    setTheme('')
                    setDescription('')
                    setSelectedFile(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Отмена
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!title || !genre || !theme || !selectedFile || uploading}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {uploading ? 'Загрузка...' : 'Загрузить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Список примеров треков */}
      {tracks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Примеров треков не найдено</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Жанр / Тема
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Описание
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
              {tracks.map((track) => (
                <tr key={track.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {track.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{track.genre}</div>
                      <div className="text-xs text-gray-400">{track.theme}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {track.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {track.audio_filename ? (
                        <div className="flex items-center space-x-2">
                        <audio controls className="h-8">
                            <source 
                            src={`http://localhost:8000/api/v1/admin/example-tracks/${track.id}/audio`} 
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteExampleTrack(track.id)}
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

export default ExamplesTab