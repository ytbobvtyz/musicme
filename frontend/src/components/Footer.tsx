const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Mysong-Podarok.ru</h3>
            <p className="text-gray-400">
              Уникальные песни-подарки. Платите только если результат вам понравится.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Контакты</h4>
            <p className="text-gray-400">Email: info@mysong-podarok.ru</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Условия</h4>
            <p className="text-gray-400">
              <a href="#" className="hover:text-white">Пользовательское соглашение</a>
            </p>
            <p className="text-gray-400">
              <a href="#" className="hover:text-white">Политика конфиденциальности</a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024 Mysong-Podarok.ru. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

