import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

const Header = () => {
  const { user, isAuthenticated } = useAuthStore()

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            Mysong-Podarok.ru
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600">
              Главная
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600">
                  Мои заказы
                </Link>
                <span className="text-gray-700">{user?.name || user?.email}</span>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Выйти
                </button>
              </>
            ) : (
              <Link
                to="/order"
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                Заказать песню
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header

