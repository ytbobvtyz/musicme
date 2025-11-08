import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Уникальная песня-подарок
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Платите только если результат вам понравится
        </p>
        <Link
          to="/order"
          className="bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Заказать песню
        </Link>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Как это работает</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Оформите заказ</h3>
            <p className="text-gray-600">
              Заполните форму с деталями о получателе и поводе для песни
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Прослушайте превью</h3>
            <p className="text-gray-600">
              Получите готовую песню и прослушайте первые 60 секунд бесплатно
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Оплатите если понравилось</h3>
            <p className="text-gray-600">
              Если результат вас устраивает, оплатите и получите полную версию
            </p>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Примеры работ</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* TODO: Добавить реальные примеры с аудио */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Песня на день рождения</h3>
            <p className="text-gray-600 mb-4">
              Трогательная песня для близкого друга на юбилей
            </p>
            {/* Аудио плеер будет добавлен позже */}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Песня на свадьбу</h3>
            <p className="text-gray-600 mb-4">
              Романтическая композиция для молодоженов
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">Песня на годовщину</h3>
            <p className="text-gray-600 mb-4">
              Трогательная песня о любви и верности
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

