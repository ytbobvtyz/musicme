import { useState, useEffect } from 'react'
import { TariffPlan, TariffCreate } from '@/types/tariff'

interface TariffFormProps {
  tariff?: TariffPlan
  onSubmit: (data: TariffCreate) => void
  onCancel: () => void
}

const TariffForm = ({ tariff, onSubmit, onCancel }: TariffFormProps) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: 0,
    original_price: 0,
    deadline_days: 1,
    rounds: 1,
    has_questionnaire: false,
    has_interview: false,
    features: [''],
    badge: '',
    popular: false,
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    if (tariff) {
      setFormData({
        code: tariff.code,
        name: tariff.name,
        description: tariff.description,
        price: tariff.price,
        original_price: tariff.original_price || 0,
        deadline_days: tariff.deadline_days,
        rounds: tariff.rounds,
        has_questionnaire: tariff.has_questionnaire,
        has_interview: tariff.has_interview,
        features: [...tariff.features],
        badge: tariff.badge || '',
        popular: tariff.popular,
        is_active: tariff.is_active,
        sort_order: tariff.sort_order
      })
    }
  }, [tariff])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Фильтруем пустые фичи
    const filteredFeatures = formData.features.filter(feature => feature.trim() !== '')
    
    onSubmit({
      ...formData,
      features: filteredFeatures,
      original_price: formData.original_price || undefined
    })
  }

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }))
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">
        {tariff ? 'Редактировать тариф' : 'Создать тариф'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Основные поля */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Код тарифа *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="basic, advanced, premium"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Базовый"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Описание *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Идеально для быстрых поздравлений"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Цена (руб) *
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Старая цена (руб)
            </label>
            <input
              type="number"
              value={formData.original_price}
              onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseInt(e.target.value) || 0 }))}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Срок выполнения (дни) *
            </label>
            <input
              type="number"
              value={formData.deadline_days}
              onChange={(e) => setFormData(prev => ({ ...prev, deadline_days: parseInt(e.target.value) || 1 }))}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Количество правок *
            </label>
            <input
              type="number"
              value={formData.rounds}
              onChange={(e) => setFormData(prev => ({ ...prev, rounds: parseInt(e.target.value) || 1 }))}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Бейдж
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Популярный, Эксклюзив"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Порядок сортировки
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Чекбоксы */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.has_questionnaire}
              onChange={(e) => setFormData(prev => ({ ...prev, has_questionnaire: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Анкета</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.has_interview}
              onChange={(e) => setFormData(prev => ({ ...prev, has_interview: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Интервью</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.popular}
              onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Популярный</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Активен</span>
          </label>
        </div>

        {/* Фичи */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Особенности тарифа
          </label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Песня до 3 минут"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              + Добавить особенность
            </button>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {tariff ? 'Обновить' : 'Создать'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  )
}

export default TariffForm