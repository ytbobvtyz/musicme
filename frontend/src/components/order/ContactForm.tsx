import { useState } from 'react'
import { TariffPlan } from '@/constants/tariffs'

interface ContactFormProps {
  tariff: TariffPlan
  onSubmit: (contactData: any) => void
  onBack: () => void
}

type ContactMethod = 'whatsapp' | 'telegram' | 'email' | 'phone'

const ContactForm = ({ tariff, onSubmit, onBack }: ContactFormProps) => {
  const [selectedMethod, setSelectedMethod] = useState<ContactMethod | null>(null)
  const [contactValue, setContactValue] = useState('')

  const contactMethods = [
    {
      id: 'whatsapp' as ContactMethod,
      name: 'WhatsApp',
      icon: '📱',
      placeholder: '+7 (999) 123-45-67',
      description: 'Напишем в WhatsApp для уточнения деталей'
    },
    {
      id: 'telegram' as ContactMethod,
      name: 'Telegram',
      icon: '✈️',
      placeholder: '@username',
      description: 'Свяжемся в Telegram для обсуждения'
    },
    {
      id: 'email' as ContactMethod,
      name: 'Email',
      icon: '📧',
      placeholder: 'your@email.com',
      description: 'Отправим письмо с дальнейшими шагами'
    },
    {
      id: 'phone' as ContactMethod,
      name: 'Телефонный звонок',
      icon: '📞',
      placeholder: '+7 (999) 123-45-67',
      description: 'Позвоним для личной консультации'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMethod || !contactValue.trim()) return

    onSubmit({
      contact_method: selectedMethod,
      contact_value: contactValue.trim()
    })
  }

  const getInputType = () => {
    if (selectedMethod === 'email') return 'email'
    if (selectedMethod === 'phone' || selectedMethod === 'whatsapp') return 'tel'
    return 'text'
  }

  const getValidationPattern = () => {
    if (selectedMethod === 'email') return undefined
    if (selectedMethod === 'phone' || selectedMethod === 'whatsapp') return '\\+7\\s?\\(?\\d{3}\\)?\\s?\\d{3}-?\\d{2}-?\\d{2}'
    return undefined
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Свяжемся с вами
        </h2>
        <p className="text-gray-600">
          Тариф: <span className="font-semibold">{tariff.name}</span> • Выберите удобный способ связи
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Выбор способа связи */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Выберите способ связи <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(method.id)
                    setContactValue('')
                  }}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{method.icon}</span>
                    <span className="font-semibold text-gray-900">{method.name}</span>
                  </div>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Поле для контакта */}
          {selectedMethod && (
            <div className="animate-fade-in">
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                {selectedMethod === 'email' ? 'Ваш email' : 
                 selectedMethod === 'telegram' ? 'Ваш Telegram username' : 
                 'Ваш номер телефона'} <span className="text-red-500">*</span>
              </label>
              <input
                type={getInputType()}
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder={contactMethods.find(m => m.id === selectedMethod)?.placeholder}
                pattern={getValidationPattern()}
                required
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              {selectedMethod === 'telegram' && (
                <p className="mt-2 text-sm text-gray-500">
                  💡 Укажите ваш @username в Telegram (например, @username)
                </p>
              )}
              {(selectedMethod === 'phone' || selectedMethod === 'whatsapp') && (
                <p className="mt-2 text-sm text-gray-500">
                  💡 Формат: +7 (999) 123-45-67
                </p>
              )}
            </div>
          )}

          {/* Кнопки навигации */}
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
              disabled={!selectedMethod || !contactValue.trim()}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отправить заявку
            </button>
          </div>
        </form>

        {/* Информационный блок */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <div className="text-green-600 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-green-800">
              <p className="font-medium">Что будет дальше?</p>
              <p className="mt-1">Мы свяжемся с вами в течение 2 часов в рабочее время (10:00-20:00) для обсуждения деталей вашего заказа и согласования времени видео-интервью.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactForm