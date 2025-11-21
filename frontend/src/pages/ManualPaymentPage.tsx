// src/pages/ManualPaymentPage.tsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getOrder } from '@/api/orders'
import PaymentFAQ from '@/components/PaymentFAQ'

const ManualPaymentPage = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showFAQ, setShowFAQ] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (isAuthenticated && orderId) {
      loadOrder()
    }
  }, [isAuthenticated, orderId])

  const loadOrder = async () => {
    try {
      const data = await getOrder(orderId!)
      setOrder(data)
    } catch (error) {
      console.error('Ошибка загрузки заказа:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  // Реквизиты для оплаты (замените на свои)
  const paymentDetails = {
    bank: 'Тинькофф',
    cardNumber: '5536 9138 1234 5678',
    recipient: 'Иванов Иван Иванович',
    amount: order?.price || 0,
    purpose: `Оплата заказа ${orderId}`
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Пожалуйста, войдите в систему</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Загрузка заказа...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl text-gray-600">Заказ не найден</p>
        <Link to="/orders" className="text-primary-600 hover:underline mt-4 inline-block">
          Вернуться к заказам
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Хлебные крошки */}
      <nav className="mb-8">
        <Link to={`/orders/${orderId}`} className="text-primary-600 hover:underline">
          ← Назад к заказу
        </Link>
      </nav>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Заголовок */}
        <div className="bg-primary-600 text-white p-6">
          <h1 className="text-2xl font-bold mb-2">Оплата заказа</h1>
          <p className="text-primary-100">Переведите оплату по реквизитам ниже</p>
        </div>

        {/* Детали заказа */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Детали заказа:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Для кого:</span>
              <p className="font-medium">{order.recipient_name}</p>
            </div>
            <div>
              <span className="text-gray-600">Тариф:</span>
              <p className="font-medium capitalize">{order.tariff_plan}</p>
            </div>
            <div>
              <span className="text-gray-600">Повод:</span>
              <p className="font-medium">{order.theme?.name || 'Не указано'}</p>
            </div>
            <div>
              <span className="text-gray-600">Сумма:</span>
              <p className="font-medium text-green-600 text-lg">{order.price} ₽</p>
            </div>
          </div>
        </div>

        {/* Реквизиты для оплаты */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Реквизиты для перевода:</h2>
          
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Банк:</span>
              <span className="font-medium">{paymentDetails.bank}</span>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Номер карты:</span>
                <button 
                  onClick={() => copyToClipboard(paymentDetails.cardNumber.replace(/\s/g, ''))}
                  className="text-primary-600 hover:text-primary-700 text-sm"
                >
                  {copySuccess ? 'Скопировано!' : 'Копировать'}
                </button>
              </div>
              <div className="bg-white p-3 rounded border border-gray-300 font-mono">
                {paymentDetails.cardNumber}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Получатель:</span>
              <span className="font-medium">{paymentDetails.recipient}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Сумма:</span>
              <span className="font-medium text-green-600">{paymentDetails.amount} ₽</span>
            </div>
            
            <div>
              <span className="text-gray-600 block mb-1">Назначение платежа:</span>
              <div className="bg-white p-3 rounded border border-gray-300">
                {paymentDetails.purpose}
              </div>
            </div>
          </div>
        </div>

        {/* Инструкция */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold mb-3">Как оплатить:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Откройте приложение вашего банка</li>
            <li>Выберите перевод по номеру карты</li>
            <li>Введите номер карты получателя</li>
            <li>Укажите сумму {order.price} ₽</li>
            <li>В назначении платежа укажите: "{paymentDetails.purpose}"</li>
            <li>Подтвердите перевод</li>
          </ol>
        </div>

        {/* Что после оплаты */}
        <div className="p-6">
          <h3 className="font-semibold mb-3">После оплаты:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Сообщите нам об оплате в Telegram: @musicme_support</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Мы активируем полную версию в течение 1-2 часов</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Вы получите уведомление на email</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => setShowFAQ(true)}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          ❓ Частые вопросы
        </button>
        
        <a
          href={`https://t.me/musicme_support?text=Здравствуйте! Хочу сообщить об оплате заказа ${orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-center"
        >
          📨 Сообщить об оплате в Telegram
        </a>
      </div>

      {/* Компонент с FAQ */}
      <PaymentFAQ isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
    </div>
  )
}

export default ManualPaymentPage