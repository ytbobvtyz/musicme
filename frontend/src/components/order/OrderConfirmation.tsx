import { TariffPlan, formatPrice } from '@/constants/tariffs'
import { createOrder } from '@/api/orders'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface OrderConfirmationProps {
  orderData: any
  tariff: TariffPlan
  onRequireAuth?: () => void
  isGuestMode?: boolean
}

const OrderConfirmation = ({ orderData, tariff, onRequireAuth, isGuestMode }: OrderConfirmationProps) => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const handleCreateOrder = async () => {
    if (!isAuthenticated && !isGuestMode) {
      if (onRequireAuth) {
        onRequireAuth()
      } else {
        alert('Пожалуйста, войдите в систему')
      }
      return
    }
  
    setLoading(true)
    try {
      const orderPayload = {
        theme_id: orderData.theme_id,
        genre_id: orderData.genre_id,
        recipient_name: orderData.recipient_name,
        occasion: orderData.occasion,
        details: orderData.details,
        preferences: {
          tariff: tariff.id,
          ...(tariff.hasQuestionnaire && { questionnaire: orderData.questionnaire }),
          ...(tariff.hasInterview && { contact: orderData.contact })
        }
      }
  
      await createOrder(orderPayload)
      
      navigate('/order/success', { 
        state: { 
          guestOrder: isGuestMode,
          orderData: orderPayload 
        } 
      })
    } catch (error) {
      console.error('Ошибка при создании заказа:', error)
      alert('Произошла ошибка при создании заказа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Подтверждение заказа
        </h2>
        <p className="text-gray-600">
          Проверьте данные перед созданием заказа
        </p>
        {isGuestMode && (
          <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 inline-block">
            <p className="text-sm text-yellow-800">
              ⚠️ Вы оформляете заказ как гость
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Детали заказа</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Тариф</dt>
                <dd className="font-medium">{tariff.name}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Стоимость</dt>
                <dd className="font-medium text-blue-600">{formatPrice(tariff.price)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Срок выполнения</dt>
                <dd className="font-medium">{tariff.deadlineHours} часов</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о получателе</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Имя получателя</dt>
                <dd className="font-medium">{orderData.recipient_name}</dd>
              </div>
              {orderData.occasion && (
                <div>
                  <dt className="text-sm text-gray-500">Описание повода</dt>
                  <dd className="font-medium">{orderData.occasion}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {orderData.details && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Особые пожелания</h4>
            <p className="text-gray-700">{orderData.details}</p>
          </div>
        )}

        {tariff.hasQuestionnaire && orderData.questionnaire && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Ответы из анкеты</h4>
            <div className="space-y-2 text-sm text-gray-700">
              {Object.entries(orderData.questionnaire).slice(0, 3).map(([key, value]) => (
                <p key={key} className="line-clamp-2">
                  <span className="font-medium">{key}:</span> {String(value).slice(0, 100)}...
                </p>
              ))}
            </div>
          </div>
        )}

        {tariff.hasInterview && orderData.contact && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Контактные данные</h4>
            <dl className="space-y-2 text-sm text-gray-700">
              <div>
                <dt className="font-medium">Способ связи:</dt>
                <dd>{orderData.contact.contact_method}</dd>
              </div>
              <div>
                <dt className="font-medium">Контакт:</dt>
                <dd>{orderData.contact.contact_value}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => window.history.back()}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          Назад
        </button>
        <button
          onClick={handleCreateOrder}
          disabled={loading}
          className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Создание...' : 'Создать заказ'}
        </button>
      </div>

      {isGuestMode && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Гостевой заказ</p>
              <p className="mt-1">После создания заказа мы предложим вам создать аккаунт для отслеживания статуса и получения уведомлений.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderConfirmation