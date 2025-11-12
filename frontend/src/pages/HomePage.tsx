import { Link } from 'react-router-dom'
import AuthBlock from '@/components/AuthBlock'
import { useExampleTracks } from '@/hooks/useExampleTracks'
import { useState } from 'react'
import { ExampleTrack } from '@/types/exampleTrack' // Добавляем импорт
import ThemeSquareBlock from '@/components/ThemeSquareBlock'

const HomePage = () => {
  const { tracksByTheme, loading } = useExampleTracks()
  
  // Топовые темы для главной страницы
  const topThemes = [
    'день рождения',
    'праздник', 
    'новый год'
  ]

  return (
    <div className="bg-white">
      {/* Auth Block - Left Top */}
      <AuthBlock />
      
      {/* Hero Section - Apple Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-white to-white"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center animate-fade-in">
          <h1 className="text-display-sm md:text-display font-bold text-gray-900 mb-6 tracking-tight">
            Уникальная песня
            <br />
            <span className="text-gradient">как подарок</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Платите только если результат
            <br className="hidden md:block" />
            вам понравится
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/order"
              className="button-primary"
            >
              Заказать песню
            </Link>
            <Link
              to="/examples"
              className="button-secondary"
            >
              Посмотреть примеры
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-200/30 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl -z-10"></div>
        </div>
      </section>

      {/* Features Section - Apple Style */}
      <section className="py-32 bg-gray-50/50">
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
                title: 'Оформите заказ',
                description: 'Расскажите нам о получателе и поводе. Мы узнаем все детали, чтобы создать идеальную песню.',
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
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white text-3xl font-bold mb-6 shadow-lg shadow-primary-500/25 group-hover:scale-110 transition-transform duration-300">
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

      {/* Dynamic Examples Section - Small Square Blocks */}
      <section id="examples" className="py-32 bg-white">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
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
              className="button-primary text-lg px-8 py-3"
            >
              Посмотреть все примеры
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section - Apple Style */}
      <section className="py-32 bg-gradient-to-br from-primary-600 to-accent-600 relative overflow-hidden">
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
          <Link
            to="/order"
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 active:scale-95 transition-all duration-200 shadow-2xl"
          >
            Заказать песню
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage