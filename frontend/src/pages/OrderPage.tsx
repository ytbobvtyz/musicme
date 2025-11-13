import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getThemes } from '@/api/themes'
import { getGenres } from '@/api/genres'
import { createOrder } from '@/api/orders'
import { Theme } from '@/types/theme'
import { Genre } from '@/types/genre'
import { TARIFF_PLANS, getTariffById, type TariffPlan } from '@/constants/tariffs'
import OrderForm from '@/components/order/OrderForm'
import Questionnaire from '@/components/order/Questionnaire'
import ContactForm from '@/components/order/ContactForm'
import OrderConfirmation from '@/components/order/OrderConfirmation'
import AuthModal from '@/components/order/AuthModal'

type OrderStep = 'tariff' | 'form' | 'questionnaire' | 'contact' | 'confirmation'

const OrderPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  
  const [themes, setThemes] = useState<Theme[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [currentStep, setCurrentStep] = useState<OrderStep>('tariff')
  const [selectedTariff, setSelectedTariff] = useState<TariffPlan>(
    () => getTariffById(searchParams.get('tariff') || 'basic')
  )
  const [orderData, setOrderData] = useState<any>({})
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isGuestMode, setIsGuestMode] = useState(false)

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

  // Если переключились в гостевой режим, создаем заказ
  useEffect(() => {
    if (isGuestMode && currentStep === 'confirmation') {
      handleGuestOrderCreation()
    }
  }, [isGuestMode, currentStep])

  const handleTariffSelect = (tariff: TariffPlan) => {
    setSelectedTariff(tariff)
    setCurrentStep('form')
  }

  const handleFormSubmit = (formData: any) => {
    setOrderData({ ...orderData, ...formData })
    
    if (selectedTariff.hasQuestionnaire) {
      setCurrentStep('questionnaire')
    } else {
      setCurrentStep('confirmation')
    }
  }

  const handleQuestionnaireSubmit = (questionnaireData: any) => {
    setOrderData({ ...orderData, questionnaire: questionnaireData })
    
    if (selectedTariff.hasInterview) {
      setCurrentStep('contact')
    } else {
      setCurrentStep('confirmation')
    }
  }

  const handleContactSubmit = (contactData: any) => {
    setOrderData({ ...orderData, contact: contactData })
    setCurrentStep('confirmation')
  }

  const handleRequireAuth = () => {
    // Сохраняем данные в localStorage
    localStorage.setItem('pendingOrder', JSON.stringify({
      orderData,
      tariff: selectedTariff.id,
      timestamp: Date.now()
    }))
    setShowAuthModal(true)
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // Данные автоматически восстановятся в OrderConfirmation
  }

  const handleGuestOrderCreation = async () => {
    try {
      const orderPayload = {
        theme_id: orderData.theme_id,
        genre_id: orderData.genre_id,
        recipient_name: orderData.recipient_name,
        occasion: orderData.occasion,
        details: orderData.details,
        preferences: {
          tariff: selectedTariff.id,
          ...(selectedTariff.hasQuestionnaire && { questionnaire: orderData.questionnaire }),
          ...(selectedTariff.hasInterview && { contact: orderData.contact })
        }
      }

      await createOrder(orderPayload)
      console.log('Гостевой заказ:', orderPayload)
      // Переходим на страницу успеха
      navigate('/order/success', { 
        state: { 
          guestOrder: true,
          orderData: orderPayload 
        } 
      })
    } catch (error) {
      console.error('Ошибка при создании гостевого заказа:', error)
      alert('Произошла ошибка при создании заказа')
    }
  }

  const getProgressSteps = () => {
    const baseSteps = [
      { step: 'tariff', label: 'Тариф' },
      { step: 'form', label: 'Детали' },
      { step: 'confirmation', label: 'Подтверждение' }
    ]
    
    if (selectedTariff.hasQuestionnaire) {
      baseSteps.splice(2, 0, { step: 'questionnaire', label: 'Анкета' })
    }
    
    if (selectedTariff.hasInterview) {
      baseSteps.splice(baseSteps.length - 1, 0, { step: 'contact', label: 'Контакты' })
    }
    
    return baseSteps
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'tariff':
        return (
          <TariffSelection 
            selectedTariff={selectedTariff}
            onTariffSelect={handleTariffSelect}
          />
        )
      case 'form':
        return (
          <OrderForm
            tariff={selectedTariff}
            themes={themes}
            genres={genres}
            onSubmit={handleFormSubmit}
            onBack={() => setCurrentStep('tariff')}
            initialData={orderData}
          />
        )
      case 'questionnaire':
        return (
          <Questionnaire
            tariff={selectedTariff}
            onSubmit={handleQuestionnaireSubmit}
            onBack={() => setCurrentStep('form')}
          />
        )
      case 'contact':
        return (
          <ContactForm
            tariff={selectedTariff}
            onSubmit={handleContactSubmit}
            onBack={() => setCurrentStep('questionnaire')}
          />
        )
      case 'confirmation':
        return (
          <OrderConfirmation
            orderData={orderData}
            tariff={selectedTariff}
            onRequireAuth={handleRequireAuth}
            isGuestMode={isGuestMode}
          />
        )
    }
  }

  const progressSteps = getProgressSteps()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {progressSteps.map((step, index) => (
              <div key={step.step} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  currentStep === step.step 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110' 
                    : currentStep > step.step || (currentStep === 'confirmation' && index < progressSteps.length - 1)
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.step || (currentStep === 'confirmation' && index < progressSteps.length - 1) ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < progressSteps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                    currentStep > step.step ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {progressSteps.map((step) => (
              <span key={step.step} className="text-center flex-1">
                {step.label}
              </span>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        {renderStep()}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        onGuestMode={() => setIsGuestMode(true)}
      />
    </div>
  )
}

// Компонент выбора тарифа
const TariffSelection = ({ selectedTariff, onTariffSelect }: {
  selectedTariff: TariffPlan
  onTariffSelect: (tariff: TariffPlan) => void
}) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Выберите тариф
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          От быстрого поздравления до эксклюзивной персональной песни
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TARIFF_PLANS.map((tariff) => (
          <div
            key={tariff.id}
            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
              selectedTariff.id === tariff.id 
                ? 'border-blue-500 shadow-xl scale-105' 
                : 'border-gray-200'
            }`}
          >
            {tariff.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  {tariff.badge}
                </div>
              </div>
            )}

            {tariff.badge && !tariff.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  {tariff.badge}
                </div>
              </div>
            )}

            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{tariff.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{tariff.description}</p>
              
              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  {formatPrice(tariff.price)}
                </div>
                <div className="text-sm text-gray-500 line-through">
                  {formatPrice(tariff.originalPrice)}
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {tariff.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onTariffSelect(tariff)}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  selectedTariff.id === tariff.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {selectedTariff.id === tariff.id ? 'Выбрано' : 'Выбрать'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() => onTariffSelect(selectedTariff)}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg"
        >
          Продолжить с тарифом "{selectedTariff.name}"
        </button>
      </div>
    </div>
  )
}

// Вспомогательная функция для форматирования цены
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
}

export default OrderPage