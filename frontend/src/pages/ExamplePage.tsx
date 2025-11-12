import { useState, useEffect } from 'react'
import { ExampleTrack } from '@/types/exampleTrack'

const ExamplesPage = () => {
  const [tracks, setTracks] = useState<ExampleTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGenre, setActiveGenre] = useState<string>('all')

  useEffect(() => {
    fetchExampleTracks()
  }, [])

  const fetchExampleTracks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/example-tracks')
      
      if (response.ok) {
        const data = await response.json()
        // Фильтруем только активные треки
        const activeTracks = data.filter((track: ExampleTrack) => track.is_active)
        setTracks(activeTracks)
      }
    } catch (error) {
      console.error('Error fetching example tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Группировка треков по жанрам
  const tracksByGenre = tracks.reduce((acc, track) => {
    const genreName = track.genre?.name || 'Другие'
    if (!acc[genreName]) {
      acc[genreName] = []
    }
    acc[genreName].push(track)
    return acc
  }, {} as Record<string, ExampleTrack[]>)

  // Получаем все жанры для фильтрации
  const allGenres = Object.keys(tracksByGenre)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка примеров...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Примеры наших работ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Послушайте песни, которые мы создали для наших клиентов, сгруппированные по жанрам
          </p>
        </div>

        {/* Фильтр по жанрам */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => setActiveGenre('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeGenre === 'all'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            }`}
          >
            Все жанры
          </button>
          {allGenres.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeGenre === genre
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Секции по жанрам с горизонтальной прокруткой */}
        <div className="space-y-16">
          {Object.entries(tracksByGenre)
            .filter(([genre]) => activeGenre === 'all' || genre === activeGenre)
            .map(([genre, genreTracks]) => (
              <section key={genre} className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <span className="w-3 h-3 bg-primary-500 rounded-full mr-3"></span>
                  {genre}
                  <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {genreTracks.length} треков
                  </span>
                </h2>
                
                {/* Горизонтальная прокрутка треков */}
                <div className="flex overflow-x-auto pb-6 -mx-2 px-2 scrollbar-hide">
                  <div className="flex space-x-6">
                    {genreTracks.map((track) => (
                      <div
                        key={track.id}
                        className="flex-shrink-0 w-80 bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200"
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {track.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {track.description || 'Без описания'}
                          </p>
                          {track.theme && (
                            <span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                              {track.theme.name}
                            </span>
                          )}
                        </div>
                        
                        {/* Аудиоплеер */}
                        <div className="space-y-3">
                          <audio
                            controls
                            className="w-full h-12 rounded-lg [&::-webkit-media-controls-panel]:bg-gray-100"
                          >
                            <source
                              src={`http://localhost:8000/api/v1/example-tracks/${track.id}/audio`}
                              type="audio/mpeg"
                            />
                            Ваш браузер не поддерживает аудио элементы.
                          </audio>
                          {track.audio_size && (
                            <p className="text-xs text-gray-500 text-center">
                              {(track.audio_size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
        </div>

        {/* Если нет треков */}
        {tracks.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl shadow-lg">
            <div className="text-gray-400 text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Примеров пока нет
            </h3>
            <p className="text-gray-600">
              Скоро здесь появятся примеры наших работ
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamplesPage