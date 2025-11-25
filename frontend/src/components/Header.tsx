import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { useProducer } from '@/hooks/useProducer'
import AuthBlock from '@/components/AuthBlock'

const Header = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const { isProducer, loading: producerLoading } = useProducer()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isHomePage = location.pathname === '/'
  const isLoading = adminLoading || producerLoading

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'glass shadow-sm backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Логотип */}
          <Link
            to="/"
            className={`text-xl md:text-2xl font-semibold transition-colors duration-200 ${
              scrolled || !isHomePage
                ? 'text-gray-900'
                : 'text-gray-900'
            }`}
          >
            MusicMe.ru
          </Link>
          
          {/* Навигация */}
          <div className="flex items-center gap-6 md:gap-8">
            <Link
              to="/"
              className={`text-sm md:text-base font-medium transition-colors duration-200 hover:text-primary-600 ${
                scrolled || !isHomePage ? 'text-gray-700' : 'text-gray-700'
              }`}
            >
              Главная
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/orders"
                  className={`text-sm md:text-base font-medium transition-colors duration-200 hover:text-primary-600 ${
                    scrolled || !isHomePage ? 'text-gray-700' : 'text-gray-700'
                  }`}
                >
                  Мои заказы
                </Link>
                <Link
                  to="/examples"
                  className={`text-sm md:text-base font-medium transition-colors duration-200 hover:text-primary-600 ${
                    scrolled || !isHomePage ? 'text-gray-700' : 'text-gray-700'
                  } ${location.pathname === '/examples' ? 'text-primary-600 font-semibold' : ''}`}
                >
                  Примеры
                </Link>
                
                {/* Вкладка Продюсирование - только для продюсеров */}
                {!isLoading && isProducer && (
                  <Link
                    to="/producer"
                    className={`text-sm md:text-base font-medium transition-colors duration-200 hover:text-primary-600 ${
                      scrolled || !isHomePage ? 'text-gray-700' : 'text-gray-700'
                    } ${
                      location.pathname === '/producer' ? 'text-primary-600 font-semibold' : ''
                    }`}
                  >
                    Продюсирование
                  </Link>
                )}
                
                {/* Вкладка Администрирование - только для админов */}
                {!isLoading && isAdmin && (
                  <Link
                    to="/admin"
                    className={`text-sm md:text-base font-medium transition-colors duration-200 hover:text-primary-600 ${
                      scrolled || !isHomePage ? 'text-gray-700' : 'text-gray-700'
                    } ${
                      location.pathname === '/admin' ? 'text-primary-600 font-semibold' : ''
                    }`}
                  >
                    Администрирование
                  </Link>
                )}
                
                {/* Компактный блок пользователя */}
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {user?.email}
                    </span>
                  </div>
                  
                  {/* Аватар */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
                  </div>
                  
                  <button
                    onClick={() => useAuthStore.getState().logout()}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    title="Выйти"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Для неавторизованных - кнопка заказа и AuthBlock */}
                <Link
                  to="/order"
                  className="button-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-2.5"
                >
                  Заказать
                </Link>
                
                {/* AuthBlock для неавторизованных */}
                <div className="hidden md:block">
                  <AuthBlock />
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header