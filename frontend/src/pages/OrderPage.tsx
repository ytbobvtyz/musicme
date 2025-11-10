import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { createOrder } from '@/api/orders'

const OrderPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [formData, setFormData] = useState({
    theme: '',
    genre: '',
    recipient_name: '',
    occasion: '',
    details: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      // TODO: Реализовать OAuth авторизацию
      alert('Пожалуйста, войдите в систему')
      return
    }

    setLoading(true)
    try {
      // TODO: Реализовать создание заказа через API
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
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-100"
              >
                <option value="">Выберите повод</option>
                <option value="свадьба">Свадьба</option>
                <option value="день_рождения">День рождения</option>
                <option value="годовщина">Годовщина</option>
                <option value="предложение">Предложение руки и сердца</option>
                <option value="другой">Другой</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Жанр <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-gray-100"
              >
                <option value="">Выберите жанр</option>
                <option value="поп">Поп</option>
                <option value="рок">Рок</option>
                <option value="хип-хоп">Хип-хоп</option>
                <option value="джаз">Джаз</option>
                <option value="классика">Классика</option>
                <option value="электронная">Электронная</option>
                <option value="другой">Другой</option>
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
