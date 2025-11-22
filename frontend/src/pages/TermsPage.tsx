// src/pages/TermsPage.tsx
import { Link } from 'react-router-dom'

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          ← На главную
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Пользовательское соглашение</h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <p className="text-yellow-800">
                <strong>Внимание:</strong> Полная версия пользовательского соглашения находится в разработке. 
                По всем юридическим вопросам обращайтесь на <a href="mailto:ytbob@yandex.ru" className="underline">ytbob@yandex.ru</a>
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Основные положения</h2>
            
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Общие условия</h3>
                <p>Сервис MusicMe.ru предоставляет услуги по созданию персонализированных музыкальных треков.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">2. Процесс заказа</h3>
                <p>Пользователь выбирает тариф, заполняет информацию для песни, и наши продюсеры создают уникальный трек.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3. Оплата и гарантии</h3>
                <p>Оплата производится только после одобрения preview-версии трека. Мы гарантируем конфиденциальность ваших данных.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">4. Контакты</h3>
                <p>По всем вопросам, связанным с использованием сервиса, обращайтесь: ytbob@yandex.ru</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage