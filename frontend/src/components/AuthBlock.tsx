import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'

const AuthBlock = () => {
  const { isAuthenticated, user, setToken } = useAuthStore()
  const navigate = useNavigate()

  // Загружаем Telegram Widget Script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleAuth = async (provider: 'vk' | 'google' | 'yandex' | 'telegram') => {
    if (provider === 'yandex') {
      // Относительный путь - будет работать на любом домене
      window.location.href = '/api/v1/auth/yandex/login'
      return
    }
    
    // TODO: Реализовать OAuth авторизацию для других провайдеров
    console.log(`Авторизация через ${provider}`)
    alert(`Авторизация через ${provider} будет реализована позже`)
  }

  const sendTelegramAuthData = async (telegramData: any) => {
    try {
      // Используем apiClient вместо прямого fetch
      const response = await apiClient.post('/auth/telegram', telegramData)
      
      if (response.status === 200) {
        const { access_token, user } = response.data
        setToken(access_token)
        console.log('Успешная авторизация через Telegram')
      } else {
        console.error('Ошибка авторизации через Telegram')
      }
    } catch (error) {
      console.error('Ошибка при отправке данных Telegram:', error)
    }
  } 

  // Компактный вид для авторизованного пользователя
  if (isAuthenticated && user) {
    return (
      <div className="fixed top-4 right-4 z-40 animate-fade-in">
        <div className="glass rounded-xl p-3 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
              {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate max-w-[80px]">
                {user.name || user.email.split('@')[0]}
              </p>
              <p className="text-[10px] text-gray-500">Аккаунт</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Компактный вид для неавторизованного пользователя
  return (
    <div className="fixed top-4 right-4 z-40 animate-fade-in">
      <div className="glass rounded-xl p-3 shadow-lg backdrop-blur-xl">
        <div className="flex flex-col gap-2">
          {/* Компактные кнопки авторизации */}
          <button
            onClick={() => handleAuth('yandex')}
            className="flex items-center justify-center w-8 h-8 bg-[#FC3F1D] text-white rounded-lg font-medium hover:bg-[#E03618] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Яндекс"
          >
            <span className="text-xs font-bold">Я</span>
          </button>

          <button
            onClick={() => handleAuth('google')}
            className="flex items-center justify-center w-8 h-8 bg-white text-gray-900 rounded-lg font-medium border border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
            title="Google"
          >
            <span className="text-xs font-bold">G</span>
          </button>

          <button
            onClick={() => handleAuth('vk')}
            className="flex items-center justify-center w-8 h-8 bg-[#0077FF] text-white rounded-lg font-medium hover:bg-[#0066DD] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            title="ВКонтакте"
          >
            <span className="text-xs font-bold">VK</span>
          </button>

          {/* Телеграм кнопка - можно временно скрыть */}
          {/* <button
            onClick={() => handleAuth('telegram')}
            className="flex items-center justify-center w-8 h-8 bg-[#0088CC] text-white rounded-lg font-medium hover:bg-[#0077B6] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Войти через Telegram"
          >
            <span className="text-xs font-bold">T</span>
          </button> */}
        </div>
        
        {/* Подсказка при наведении на весь блок */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Войти в аккаунт
        </div>
      </div>
    </div>
  )
}

export default AuthBlock