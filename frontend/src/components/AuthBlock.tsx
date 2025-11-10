import { useAuthStore } from '@/store/authStore'

const AuthBlock = () => {
  const { isAuthenticated, user } = useAuthStore()

  const handleAuth = async (provider: 'vk' | 'google' | 'yandex') => {
    // TODO: Реализовать OAuth авторизацию
    console.log(`Авторизация через ${provider}`)
    // Временно показываем alert
    alert(`Авторизация через ${provider} будет реализована позже`)
  }

  if (isAuthenticated && user) {
    return (
      <div className="fixed top-24 left-6 z-40 animate-fade-in">
        <div className="glass rounded-2xl p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || user.email}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500">Авторизован</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-24 left-4 md:left-6 z-40 animate-fade-in hidden md:block">
      <div className="glass rounded-2xl p-5 shadow-xl backdrop-blur-xl min-w-[260px] max-w-[300px]">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Войти в аккаунт
        </h3>
        <div className="space-y-2.5">
          <button
            onClick={() => handleAuth('vk')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#0077FF] text-white rounded-xl font-medium hover:bg-[#0066DD] active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.785 16.241s.287-.033.435-.2c.135-.15.131-.433.131-.433s-.02-1.305.584-1.498c.595-.19 1.357.958 2.165 1.379.607.317 1.068.247 1.068.247l2.15-.031s1.122-.07.589-.956c-.044-.071-.311-.651-1.598-1.84-1.351-1.252-1.17-.526.448-1.614.988-.83 1.382-1.336 1.258-1.55-.117-.199-.841-.147-.841-.147l-2.166.013s-.16-.022-.278.05c-.115.07-.189.231-.189.231s-.338.909-.785 1.68c-.947 1.513-1.326 1.595-1.48 1.503-.36-.224-.27-.899-.27-1.38 0-1.499.227-2.123-.445-2.285-.224-.054-.388-.09-.961-.095-.734-.007-1.354.002-1.705.004-.135.013-.235.06-.305.196-.093.18-.07.557-.07.557s.133 1.573.305 2.361c.362 1.659.608 1.955.67 2.046.154.224.106.689.106.689s-.016 1.006-.239 1.193c-.235.197-.557.205-.623.205-.485.015-1.267-.129-2.369-1.089-.1-.09-.668-.639-1.38-1.968-.925-1.68-1.619-3.55-1.619-3.55s-.134-.343-.037-.527c.063-.117.285-.188.285-.188l2.208-.012s.329-.023.538.236c.219.271.713.946.713.946s.714 1.203 1.695 2.097c.822.746 1.44.978 1.608 1.083.338.214.541.166.541.593-.002.436-.004 1.14.002 1.49z"/>
            </svg>
            <span>ВКонтакте</span>
          </button>

          <button
            onClick={() => handleAuth('google')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white text-gray-900 rounded-xl font-medium border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={() => handleAuth('yandex')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#FC3F1D] text-white rounded-xl font-medium hover:bg-[#E03618] active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.186 0h-.745v9.103H0v.745h11.441V24h.745V9.848H24v-.745H12.186V0z"/>
            </svg>
            <span>Яндекс</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Войдите, чтобы сохранить заказы
        </p>
      </div>
    </div>
  )
}

export default AuthBlock

