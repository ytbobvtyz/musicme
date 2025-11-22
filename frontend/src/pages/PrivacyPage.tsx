// src/pages/PrivacyPage.tsx
import { Link } from 'react-router-dom'

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          ← На главную
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Политика конфиденциальности</h1>
          
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-blue-800">
                <strong>Важная информация:</strong> Полная версия политики конфиденциальности готовится. 
                По вопросам обработки персональных данных обращайтесь на <a href="mailto:ytbob@yandex.ru" className="underline">ytbob@yandex.ru</a>
              </p>
            </div>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Обработка персональных данных</h2>
            
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Какие данные мы собираем</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Контактная информация (email, имя)</li>
                  <li>Информация для создания песни (имена, события, предпочтения)</li>
                  <li>Технические данные (IP-адрес, браузер)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">2. Как мы используем данные</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Для создания персонализированного музыкального трека</li>
                  <li>Для связи с вами по вопросам заказа</li>
                  <li>Для улучшения качества наших услуг</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3. Защита данных</h3>
                <p>Мы принимаем все необходимые меры для защиты ваших персональных данных от несанкционированного доступа.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">4. Ваши права</h3>
                <p>Вы можете запросить удаление ваших персональных данных, написав на ytbob@yandex.ru</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage