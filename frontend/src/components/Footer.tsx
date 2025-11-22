// src/components/Footer.tsx
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">MusicMe.ru</h3>
            <p className="text-gray-600 leading-relaxed max-w-md">
              Уникальные песни-подарки. Платите только если результат вам понравится.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Контакты</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:ytbob@yandex.ru"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  ytbob@yandex.ru
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Условия</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Пользовательское соглашение
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Политика конфиденциальности
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-center text-sm">
            &copy; {new Date().getFullYear()} MusicMe.ru. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer