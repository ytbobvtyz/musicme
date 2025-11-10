import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'

const Header = () => {
  const { user, isAuthenticated } = useAuthStore()
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
            Mysong
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
