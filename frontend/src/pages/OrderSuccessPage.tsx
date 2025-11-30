// src/pages/OrderSuccessPage.tsx
import { Link, useLocation, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

const OrderSuccessPage = () => {
  const { state } = useLocation()
  const { orderId } = useParams()
  const [orderDetails, setOrderDetails] = useState<any>(null)

  useEffect(() => {
    // Можно добавить загрузку деталей заказа по orderId если нужно
    console.log('Order ID:', orderId)
  }, [orderId])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center animate-fade-in">
          {/* Анимированная иконка успеха */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-green-500 animate-checkmark" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>

          {/* Заголовок */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Заказ принят!
          </h1>
          
          {/* Основное сообщение */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            Мы уже начали работать над вашей уникальной песней. 
            Вы получите уведомление в Telegram, когда композиция будет готова.
          </p>

          {/* Детали заказа */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Что дальше?</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Заказ принят в работу</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">⏱</span>
                <span>Срок выполнения: 24-48 часов</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">🔔</span>
                <span>Уведомление придет в Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5">🎵</span>
                <span>Прослушаете preview перед оплатой</span>
              </li>
            </ul>
          </div>

          {/* Блок для гостевых заказов */}
          {state?.guestOrder && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    Создайте аккаунт для удобства
                  </p>
                  <p className="text-xs text-blue-700 mb-3">
                    Чтобы отслеживать статус заказа, получать уведомления 
                    и иметь доступ к истории ваших заказов
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to="/auth/register"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors text-center"
                    >
                      Создать аккаунт
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="space-y-3">
            <Link
              to="/"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-95"
            >
              Вернуться на главную
            </Link>
            
            <Link
              to="/examples"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Посмотреть примеры работ
            </Link>

            {!state?.guestOrder && (
              <Link
                to="/orders"
                className="block w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:text-blue-700 transition-colors text-sm"
              >
                Перейти к моим заказам ›
              </Link>
            )}
          </div>

          {/* Контактная информация */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Есть вопросы?{' '}
              <a 
                href="mailto:ytbob@yandex.ru" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Напишите нам
              </a>
              {' '}или напишите в{' '}
              <a 
                href="https://t.me/musicme_support" 
                className="text-blue-600 hover:text-blue-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage