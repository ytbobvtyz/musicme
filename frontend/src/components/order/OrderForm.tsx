import { useState } from 'react'
import { Theme } from '@/types/theme'
import { Genre } from '@/types/genre'
import { TariffPlan } from '@/constants/tariffs'

interface OrderFormProps {
  tariff: TariffPlan
  themes: Theme[]
  genres: Genre[]
  onSubmit: (data: any) => void
  onBack: () => void
  initialData?: any
}

const OrderForm = ({ tariff, themes, genres, onSubmit, onBack, initialData }: OrderFormProps) => {
  const [formData, setFormData] = useState({
    theme_id: initialData?.theme_id || '',
    genre_id: initialData?.genre_id || '',
    recipient_name: initialData?.recipient_name || '',
    occasion: initialData?.occasion || '',
    details: initialData?.details || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Основная информация
        </h2>
        <p className="text-gray-600">
          Тариф: <span className="font-semibold">{tariff.name}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Повод <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.theme_id}
              onChange={(e) => setFormData({ ...formData, theme_id: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              <option value="">Выберите жанр</option>
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

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
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
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
              rows={4}
              placeholder="Расскажите о получателе подарка, ваших отношениях, важных деталях для песни..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              {formData.details.length}/1000 символов
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Назад
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {tariff.hasQuestionnaire ? 'Далее →' : 'Создать заказ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderForm