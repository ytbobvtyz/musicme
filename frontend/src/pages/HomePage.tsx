import { Link } from 'react-router-dom'
import AuthBlock from '@/components/AuthBlock'
import { useExampleTracks } from '@/hooks/useExampleTracks'
import { useState } from 'react'
import { ExampleTrack } from '@/types/exampleTrack'
import ThemeSquareBlock from '@/components/ThemeSquareBlock'
import { TARIFF_PLANS, formatPrice } from '@/constants/tariffs'

const HomePage = () => {
  const { tracksByTheme, loading } = useExampleTracks()
  
  // Топовые темы для главной страницы
  const topThemes = [
    'день рождения',
    'праздник', 
    'новый год'
  ]

  // Тарифные планы
  const tariffPlans = TARIFF_PLANS.map(tariff => ({
    ...tariff,
    price: formatPrice(tariff.price),
    originalPrice: formatPrice(tariff.originalPrice)
  }))

  return (
    <div className="bg-white">
      {/* Auth Block - Right Top */}
      <div className="fixed top-6 right-6 z-50">
        <AuthBlock />
      </div>
      
      {/* Hero Section - Updated Branding */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center animate-fade-in">
          {/* Updated Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              musicme
              <span className="text-blue-600">.ru</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>
          
          <h2 className="text-display-sm md:text-display font-bold text-gray-900 mb-6 tracking-tight">
            Уникальная песня-подарок
            <br />
            <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600">
              на любой бюджет
            </span>
          </h2>
          
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Платите только если результат
            <br className="hidden md:block" />
            вам понравится
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/order"
              className="button-primary bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
            >
              Заказать песню
            </Link>
            <Link
              to="#tariffs"
              className="button-secondary border-blue-600 text-blue-600 hover:bg-blue-50 text-lg px-8 py-4"
            >
              Выбрать тариф
            </Link>
          </div>
          
          {/* Updated decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl -z-10"></div>
        </div>
      </section>

      {/* Dynamic Examples Section - Updated */}
      <section id="examples" className="py-32 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-headline font-bold mb-4 text-gray-900">
              Примеры наших работ
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Послушайте песни, которые мы создали для наших клиентов
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка примеров...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topThemes.map((themeName, themeIndex) => {
                const themeTracks = tracksByTheme[themeName] || []
                
                if (themeTracks.length === 0) return null
                
                return (
                  <ThemeSquareBlock
                    key={themeName}
                    themeName={themeName}
                    tracks={themeTracks}
                    delay={themeIndex * 100}
                  />
                )
              })}
            </div>
          )}

          <div className="text-center mt-16">
            <Link
              to="/examples"
              className="button-primary bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Посмотреть все примеры
            </Link>
          </div>
        </div>
      </section>

      {/* Tariffs Section - New */}
      <section id="tariffs" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-headline font-bold mb-4 text-gray-900">
              Выберите подходящий тариф
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              От быстрого поздравления до эксклюзивной персональной песни
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {tariffPlans.map((tariff, index) => (
              <div
                key={tariff.id}
                className={`relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-scale-in ${
                  tariff.popular ? 'ring-2 ring-blue-500 ring-offset-4' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {tariff.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {tariff.badge}
                    </div>
                  </div>
                )}
                
                {tariff.badge && !tariff.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                      {tariff.badge}
                    </div>
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {tariff.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {tariff.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {tariff.price}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {tariff.originalPrice}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tariff.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={`/order?tariff=${tariff.id}`}
                    className={`w-full block text-center py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                      tariff.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Выбрать {tariff.name}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              💰 Для всех тарифов действует правило: платите только если результат вам понравится!
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Updated */}
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-headline font-bold text-center mb-4 text-gray-900">
            Как это работает
          </h2>
          <p className="text-xl text-gray-600 text-center mb-20 max-w-2xl mx-auto">
            Простой процесс создания персональной песни
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                number: '01',
                title: 'Выберите тариф и оформите заказ',
                description: 'Подберите подходящий уровень персонализации под ваш бюджет и задачу.',
                delay: '0ms',
              },
              {
                number: '02',
                title: 'Прослушайте превью',
                description: 'Получите готовую песню и прослушайте первые 60 секунд бесплатно. Оцените качество и эмоции.',
                delay: '100ms',
              },
              {
                number: '03',
                title: 'Оплатите если понравилось',
                description: 'Если результат вас устраивает, оплатите и получите полную версию в высоком качестве.',
                delay: '200ms',
              },
            ].map((step, index) => (
              <div
                key={index}
                className="group text-center animate-fade-in-up"
                style={{ animationDelay: step.delay }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-bold mb-6 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                <h3 className="text-title font-semibold mb-4 text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Updated */}
      <section className="py-32 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
          <h2 className="text-headline md:text-display-sm font-bold mb-6">
            Готовы создать
            <br />
            уникальный подарок?
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-2xl mx-auto font-light">
            Начните прямо сейчас и подарите незабываемые эмоции
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/order"
              className="inline-block bg-white text-blue-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-2xl"
            >
              Заказать песню
            </Link>
            <Link
              to="#tariffs"
              className="inline-block bg-transparent border-2 border-white text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/10 active:scale-95 transition-all duration-200"
            >
              Сравнить тарифы
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage