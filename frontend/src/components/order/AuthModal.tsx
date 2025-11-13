import { useAuthStore } from '@/store/authStore'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  onGuestMode: () => void
}

const AuthModal = ({ isOpen, onClose, onSuccess, onGuestMode }: AuthModalProps) => {
  const { setToken } = useAuthStore()

  if (!isOpen) return null

  const handleGuestContinue = () => {
    console.log('🎯 Guest mode button clicked')
    onGuestMode() // Это устанавливает isGuestMode = true
    onClose()
    // НЕ вызываем onSuccess() - это только для успешной авторизации
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
          {/* Сообщение о преимуществах */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 text-center">
              ✅ Ваш заказ сохранен и будет автоматически создан после авторизации
            </p>
          </div>

          {/* Блок OAuth */}
          <div className="space-y-4">
            <button
              onClick={() => {
                window.location.href = 'http://localhost:8000/api/v1/auth/yandex/login'
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#FC3F1D] text-white rounded-xl font-semibold hover:bg-[#E03618] transition-colors"
            >
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <span className="text-[#FC3F1D] font-bold text-sm">Я</span>
              </div>
              Продолжить с Яндекс ID
            </button>

            <button
              onClick={() => {
                window.location.href = 'http://localhost:8000/api/v1/auth/vk/login'
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-[#0077FF] text-white rounded-xl font-semibold hover:bg-[#0066DD] transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 16.962c-.729.215-1.472.328-2.218.328-1.278 0-2.5-.3-3.591-.9-1.091-.6-2.037-1.437-2.775-2.409-.738-.972-1.293-2.062-1.634-3.225-.341-1.163-.5-2.381-.5-3.606 0-.746.113-1.489.328-2.218.215-.729.525-1.425.9-2.062.375-.637.825-1.209 1.328-1.706.503-.497 1.069-.9 1.706-1.275.637-.375 1.333-.685 2.062-.9.729-.215 1.472-.328 2.218-.328 1.278 0 2.5.3 3.591.9 1.091.6 2.037 1.437 2.775 2.409.738.972 1.293 2.062 1.634 3.225.341 1.163.5 2.381.5 3.606 0 .746-.113 1.489-.328 2.218-.215.729-.525 1.425-.9 2.062-.375.637-.825 1.209-1.328 1.706-.503.497-1.069.9-1.706 1.275-.637.375-1.333.685-2.062.9z"/>
              </svg>
              Продолжить с ВКонтакте
            </button>
          </div>

          {/* Гостевое продолжение */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleGuestContinue}
              className="w-full text-center text-blue-600 hover:text-blue-700 font-semibold py-3"
            >
              Продолжить как гость ›
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Вы сможете создать аккаунт позже
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal