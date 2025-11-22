import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { useAdmin } from '@/hooks/useAdmin'
import { useProducer } from '@/hooks/useProducer'

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
          
          <div className="flex items-center gap-8">
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
                
                <span
                  className={`text-sm md:text-base font-medium ${
                    scrolled || !isHomePage ? 'text-gray-600' : 'text-gray-600'
                  }`}
                >
                  {user?.name || user?.email}
                </span>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className={`text-sm md:text-base font-medium transition-colors duration-200 hover:text-primary-600 ${
                    scrolled || !isHomePage ? 'text-gray-700' : 'text-gray-700'
                  }`}
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link
                to="/order"
                className="button-primary text-base px-6 py-2.5"
              >
                Заказать
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header