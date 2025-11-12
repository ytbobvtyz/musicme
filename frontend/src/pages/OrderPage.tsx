import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { createOrder } from '@/api/orders'
import { getThemes } from '@/api/themes'
import { getGenres } from '@/api/genres'
import { Theme } from '@/types/theme'
import { Genre } from '@/types/genre'

const OrderPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [themes, setThemes] = useState<Theme[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    theme_id: '',  // ← ИЗМЕНИЛОСЬ: теперь theme_id вместо theme
    genre_id: '',  // ← ИЗМЕНИЛОСЬ: теперь genre_id вместо genre
    recipient_name: '',
    occasion: '',
    details: '',
  })

  // Загружаем темы и жанры при монтировании
  useEffect(() => {
    const loadData = async () => {
      try {
        const [themesData, genresData] = await Promise.all([
          getThemes(),
          getGenres()
        ])
        setThemes(themesData)
        setGenres(genresData)
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error)
        alert('Не удалось загрузить данные для формы')
      }
    }
    
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему')
      return
    }

    if (!formData.theme_id || !formData.genre_id) {
      alert('Пожалуйста, выберите тему и жанр')
      return
    }

    setLoading(true)
    try {
      await createOrder(formData)
      navigate('/orders')
    } catch (error) {
      console.error('Ошибка при создании заказа:', error)
      alert('Произошла ошибка при создании заказа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-headline md:text-display-sm font-bold text-gray-900 mb-4">
            Оформите заказ
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Расскажите нам о получателе и поводе. Мы создадим уникальную песню специально для вас.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 animate-fade-in-up">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Повод <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.theme_id}
                onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-100"
              >
                <option value="">Выберите повод</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Жанр <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.genre_id}
                onChange={(e) => setFormData({ ...formData, genre_id: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-100"
              >
                <option value="">Выберите жанр</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Остальные поля остаются без изменений */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Для кого (имя) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.recipient_name}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                maxLength={100}
                placeholder="Имя получателя подарка"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Описание повода
              </label>
              <textarea
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                maxLength={200}
                rows={3}
                placeholder="Кратко опишите повод для песни"
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none hover:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Особые пожелания
              </label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                maxLength={1000}
                rows={6}
                placeholder="Расскажите о получателе подарка, ваших отношениях, важных деталях для песни, любимых словах или фразах..."
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 resize-none hover:bg-gray-100"
              />
              <p className="mt-2 text-sm text-gray-500">
                {formData.details.length}/1000 символов
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full button-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Отправка...
                  </span>
                ) : (
                  'Оформить заказ'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OrderPage