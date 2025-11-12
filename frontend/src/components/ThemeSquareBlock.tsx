import { useState } from 'react'
import { ExampleTrack } from '@/types/exampleTrack'

interface ThemeSquareBlockProps {
  themeName: string
  tracks: ExampleTrack[]
  delay?: number
  compact?: boolean
}

const ThemeSquareBlock = ({ 
  themeName, 
  tracks, 
  delay = 0,
  compact = false
}: ThemeSquareBlockProps) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const currentTrack = tracks[currentTrackIndex]

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length)
  }

  const getThemeGradient = (theme: string) => {
    const gradients: Record<string, string> = {
      'день рождения': 'from-blue-500 to-cyan-500',
      'праздник': 'from-purple-500 to-indigo-500',
      'новый год': 'from-green-500 to-emerald-500',
      'свадьба': 'from-pink-500 to-rose-500',
      'любовь': 'from-red-500 to-pink-500',
      'дружба': 'from-orange-500 to-amber-500',
      'другое': 'from-gray-500 to-slate-500'
    }
    return gradients[theme] || 'from-primary-500 to-accent-500'
  }

  const getTrackCoverUrl = (track: ExampleTrack) => {
    return `http://localhost:8000/api/v1/example-tracks/${track.id}/cover`
  }

  return (
    <div 
      className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in aspect-square flex flex-col ${
        compact ? 'border border-gray-200' : ''
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Верхняя часть - ТОЛЬКО ОБЛОЖКА */}
      <div 
        className="flex-1 relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${getTrackCoverUrl(currentTrack)})`,
        }}
      >
        {/* Фолбэк градиент */}
        <div className={`absolute inset-0 bg-gradient-to-br ${getThemeGradient(themeName)} opacity-60 -z-10`}></div>
        
        {/* Накладка для лучшей читаемости текста */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Заголовок темы */}
        <div className="absolute top-4 left-4 right-4">
          <h3 className="text-white text-lg font-semibold line-clamp-2 drop-shadow-sm">
            {getThemeDisplayName(themeName)}
          </h3>
          <p className="text-white/90 text-sm mt-1 drop-shadow-sm">
            {tracks.length} трек{tracks.length > 1 ? 'а' : ''}
          </p>
        </div>

        {/* Стрелка вниз для прокрутки */}
        {tracks.length > 1 && (
          <button
            onClick={nextTrack}
            className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm rounded-full p-2 hover:bg-white/40 transition-all duration-200 hover:scale-110 border border-white/40 shadow-lg z-10"
            title="Следующий трек"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>

      {/* Нижняя часть - АУДИОПЛЕЕР И ИНФО */}
      <div className="p-4 bg-white flex-shrink-0 border-t border-gray-100 space-y-3">
        {/* Название трека */}
        <div className="text-center">
          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
            {currentTrack.title}
          </h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {currentTrack.description || 'Без описания'}
          </p>
        </div>

        {/* Аудиоплеер */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
          <audio 
            controls 
            className="w-full rounded-lg [&::-webkit-media-controls-panel]:bg-white [&::-webkit-media-controls-panel]:rounded-lg"
          >
            <source 
              src={`http://localhost:8000/api/v1/example-tracks/${currentTrack.id}/audio`} 
              type="audio/mpeg" 
            />
            Ваш браузер не поддерживает аудио элементы.
          </audio>
        </div>
        
        {/* Индикатор текущего трека */}
        {tracks.length > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xs text-gray-500 font-medium">
              {currentTrackIndex + 1}/{tracks.length}
            </span>
            <div className="flex space-x-1.5">
              {tracks.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentTrackIndex ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Вспомогательные функции для отображения тем
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

export default ThemeSquareBlock