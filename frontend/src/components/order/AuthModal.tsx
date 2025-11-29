// src/components/order/AuthModal.tsx
import { useAuthStore } from '@/store/authStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onGuestMode: () => void
}

const AuthModal = ({ isOpen, onClose, onSuccess, onGuestMode }: AuthModalProps) => {
  const { setToken } = useAuthStore()

  // Функция для получения OAuth URL
  const getOAuthUrl = (provider: string) => {
    // Используем относительный путь
    return `/api/v1/auth/${provider}/login`
  }

  if (!isOpen) return null

  const handleOAuthLogin = (provider: string) => {
    // Временная заглушка для Google и Telegram
    if (provider === 'google' || provider === 'telegram') {
      alert(`Авторизация через ${provider} временно недоступна. Используйте Яндекс или ВКонтакте.`)
      return
    }
    
    // Для Яндекс и VK используем правильные URLs
    const oauthUrl = getOAuthUrl(provider)
    console.log('🔍 OAuth URL:', oauthUrl)
    window.location.href = oauthUrl
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
        {/* Заголовок */}
        <div className="p-6 border-b border-gray-200">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Войдите в аккаунт
            </h3>
            <p className="text-gray-600">
              Чтобы сохранить заказ и отслеживать его статус
            </p>
          </div>
        </div>

        {/* Контент */}
        <div className="p-6">

          {/* Блок OAuth */}
          <div className="space-y-4">
            <button
              onClick={() => handleOAuthLogin('yandex')}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#FC3F1D] text-white rounded-xl font-semibold hover:bg-[#E03618] transition-colors"
            >
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-[#FC3F1D] font-bold text-sm">Я</span>
              </div>
              Продолжить с Яндекс ID
            </button>

            <button
              onClick={() => handleOAuthLogin('vk')}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#0077FF] text-white rounded-xl font-semibold hover:bg-[#0066DD] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 16.962c-.729.215-1.472.328-2.218.328-1.278 0-2.5-.3-3.591-.9-1.091-.6-2.037-1.437-2.775-2.409-.738-.972-1.293-2.062-1.634-3.225-.341-1.163-.5-2.381-.5-3.606 0-.746.113-1.489.328-2.218.215-.729.525-1.425.9-2.062.375-.637.825-1.209 1.328-1.706.503-.497 1.069-.9 1.706-1.275.637-.375 1.333-.685 2.062-.9.729-.215 1.472-.328 2.218-.328 1.278 0 2.5.3 3.591.9 1.091.6 2.037 1.437 2.775 2.409.738.972 1.293 2.062 1.634 3.225.341 1.163-.5 2.381-.5 3.606 0 .746-.113 1.489-.328 2.218-.215.729-.525 1.425-.9 2.062-.375.637-.825 1.209-1.328 1.706-.503.497-1.069.9-1.706 1.275-.637.375-1.333.685-2.062.9z"/>
              </svg>
              Продолжить с ВКонтакте
            </button>

            {/* Кнопка Google */}
            <button
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors border border-gray-300"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Продолжить с Google
            </button>

            {/* Кнопка Telegram */}
            <button
              onClick={() => handleOAuthLogin('telegram')}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#0088CC] text-white rounded-xl font-semibold hover:bg-[#0077BB] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 16.962c-.729.215-1.472.328-2.218.328-1.278 0-2.5-.3-3.591-.9-1.091-.6-2.037-1.437-2.775-2.409-.738-.972-1.293-2.062-1.634-3.225-.341-1.163-.5-2.381-.5-3.606 0-.746.113-1.489.328-2.218.215-.729.525-1.425.9-2.062.375-.637.825-1.209 1.328-1.706.503-.497 1.069-.9 1.706-1.275.637-.375 1.333-.685 2.062-.9.729-.215 1.472-.328 2.218-.328 1.278 0 2.5.3 3.591.9 1.091.6 2.037 1.437 2.775 2.409.738-.972 1.293-2.062 1.634-3.225.341-1.163.5-2.381.5-3.606 0-.746-.113-1.489-.328-2.218-.215-.729-.525-1.425-.9-2.062-.375-.637-.825-1.209-1.328-1.706-.503-.497-1.069-.9-1.706-1.275-.637-.375-1.333-.685-2.062-.9-.729-.215-1.472-.328-2.218-.328-1.278 0-2.5.3-3.591.9-1.091.6-2.037 1.437-2.775 2.409-.738.972-1.293 2.062-1.634 3.225-.341 1.163-.5 2.381-.5 3.606 0 .746.113 1.489.328 2.218.215.729.525 1.425.9 2.062.375.637.825 1.209 1.328 1.706.503.497 1.069.9 1.706 1.275.637.375 1.333.685 2.062.9z"/>
              </svg>
              Продолжить с Telegram
            </button>
          </div>

          {/* Разделитель */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">V</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Гостевой режим */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal