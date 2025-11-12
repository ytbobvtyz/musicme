import { useState, useEffect } from 'react'
import { ExampleTrack } from '@/types/exampleTrack'
import ThemeSquareBlock from '@/components/ThemeSquareBlock'

const ExamplesPage = () => {
  const [tracks, setTracks] = useState<ExampleTrack[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTheme, setActiveTheme] = useState<string>('all')

  useEffect(() => {
    fetchExampleTracks()
  }, [])

  const fetchExampleTracks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/example-tracks')
      
      if (response.ok) {
        const data = await response.json()
        const activeTracks = data.filter((track: ExampleTrack) => track.is_active)
        setTracks(activeTracks)
      }
    } catch (error) {
      console.error('Error fetching example tracks:', error)
    } finally {
      setLoading(false)
    }
  }

  // Группировка треков по темам
  const tracksByTheme = tracks.reduce((acc, track) => {
    const themeName = track.theme?.name || 'Другие'
    if (!acc[themeName]) {
      acc[themeName] = []
    }
    acc[themeName].push(track)
    return acc
  }, {} as Record<string, ExampleTrack[]>)

  // Получаем все темы для фильтрации
  const allThemes = Object.keys(tracksByTheme)

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
        {/* Упрощенный заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Примеры работ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Слушайте наши песни, сгруппированные по темам
          </p>
        </div>

        {/* Фильтр по темам */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => setActiveTheme('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeTheme === 'all'
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
            }`}
          >
            Все темы
          </button>
          {allThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => setActiveTheme(theme)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTheme === theme
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
              }`}
            >
              {getThemeDisplayName(theme)}
            </button>
          ))}
        </div>

        {/* Секции по темам с блоками в ряд */}
        <div className="space-y-12">
          {Object.entries(tracksByTheme)
            .filter(([theme]) => activeTheme === 'all' || theme === activeTheme)
            .map(([theme, themeTracks]) => (
              <section key={theme} className="bg-white rounded-3xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="w-3 h-3 bg-primary-500 rounded-full mr-3"></span>
                  {getThemeDisplayName(theme)}
                  <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {themeTracks.length} трек{themeTracks.length > 1 ? 'а' : ''}
                  </span>
                </h2>
                
                {/* Блоки ThemeSquareBlock в ряд */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {themeTracks.map((track, index) => (
                    <ThemeSquareBlock
                      key={track.id}
                      themeName={theme}
                      tracks={[track]} // Передаем массив из одного трека
                      delay={index * 100}
                      compact={true}
                    />
                  ))}
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

// Вспомогательная функция
const getThemeDisplayName = (theme: string) => {
  const names: Record<string, string> = {
    'день рождения': 'День рождения',
    'праздник': 'Праздники', 
    'новый год': 'Новый год',
    'свадьба': 'Свадьба',
    'любовь': 'Любовь',
    'дружба': 'Дружба',
    'другое': 'Другое'
  }
  return names[theme] || theme
}

export default ExamplesPage