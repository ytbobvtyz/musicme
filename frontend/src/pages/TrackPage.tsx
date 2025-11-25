import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getTrack } from '@/api/tracks'
import { Track } from '@/types/track'

const TrackPage = () => {
  const { trackId } = useParams<{ trackId: string }>()
  const [track, setTrack] = useState<Track | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (trackId) {
      loadTrack()
    }
  }, [trackId])

  const loadTrack = async () => {
    try {
      const data = await getTrack(trackId!)
      setTrack(data)
    } catch (error) {
      console.error('Ошибка при загрузке трека:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    // TODO: Реализовать инициализацию платежа
    alert('Функция оплаты будет реализована позже')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Загрузка трека...</p>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Трек не найден</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{track.title || 'Ваша песня'}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        {track.preview_url && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Превью (60 секунд)</h2>
            <audio controls className="w-full">
              <source src={track.preview_url} type="audio/mpeg" />
              Ваш браузер не поддерживает аудио элемент.
            </audio>
          </div>
        )}

        {track.full_url ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Полная версия</h2>
            <audio controls className="w-full">
              <source src={track.full_url} type="audio/mpeg" />
              Ваш браузер не поддерживает аудио элемент.
            </audio>
            <a
              href={track.full_url}
              download
              className="mt-4 inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              Скачать трек
            </a>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xl text-gray-600 mb-6">
              Понравился результат? Оплатите и получите полную версию!
            </p>
            <button
              onClick={handlePayment}
              className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700"
            >
              Оплатить полную версию (9,900 ₽)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackPage

