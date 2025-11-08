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
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Оформить заказ на песню</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Повод *
          </label>
          <select
            required
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Жанр *
          </label>
          <select
            required
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Для кого (имя) *
          </label>
          <input
            type="text"
            required
            value={formData.recipient_name}
            onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
            maxLength={100}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Описание повода
          </label>
          <textarea
            value={formData.occasion}
            onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
            maxLength={200}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Особые пожелания
          </label>
          <textarea
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            maxLength={1000}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Расскажите о получателе подарка, ваших отношениях, важных деталях для песни..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Отправка...' : 'Оформить заказ'}
        </button>
      </form>
    </div>
  )
}

export default OrderPage

