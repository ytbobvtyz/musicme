// src/components/PaymentFAQ.tsx
import { useState } from 'react'

interface PaymentFAQProps {
  isOpen: boolean
  onClose: () => void
}

const PaymentFAQ = ({ isOpen, onClose }: PaymentFAQProps) => {
  if (!isOpen) return null

  const faqItems = [
    {
      question: "Что будет после оплаты?",
      answer: "Сразу после подтверждения оплаты вы получите полную версию песни в высоком качестве. Также откроется доступ к скачиванию и возможность запросить финальную правку при необходимости."
    },
    {
      question: "Что если я найду ошибку после оплаты?",
      answer: "Не волнуйтесь! После оплаты у вас остаётся право на одну финальную правку. Мы исправим любые лексические, грамматические ошибки, звуковые дефекты или неприемлемые выражения."
    },
    {
      question: "Могу ли я получить трек в WAV и отдельные партии?",
      answer: "Да! При необходимости мы можем предоставить:\n• WAV файл в максимальном качестве\n• Раздельные дорожки (вокал и инструментал)\n• Просто укажите это в финальном отзыве после оплаты"
    },
    {
      question: "Кому принадлежат права на трек?",
      answer: "Если коротко — вам! После оплаты все права на созданную песню переходят к вам. Вы можете использовать её как угодно: для личного прослушивания, в соцсетях, на мероприятиях. Подробнее в нашей оферте."
    },
    {
      question: "Как долго хранится трек?",
      answer: "Мы храним ваши треки бессрочно. Вы всегда сможете вернуться и скачать их снова, даже через несколько лет."
    },
    {
      question: "Можно ли внести изменения в текст после оплаты?",
      answer: "Да, в рамках финальной правки мы можем внести корректировки в текст. Однако значительные изменения текста могут потребовать дополнительной оплаты."
    },
    {
      question: "Какого качества будет финальный трек?",
      answer: "Вы получите студийное качество звука (320 kbps MP3). При необходимости можем предоставить lossless-форматы (WAV, FLAC)."
    }
  ]

  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Заголовок */}
        <div className="bg-primary-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Частые вопросы перед оплатой</h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          <p className="text-primary-100 mt-1">
            Всё, что важно знать перед оплатой
          </p>
        </div>

        {/* Содержимое */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left p-4 flex justify-between items-center hover:bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <span className={`transform transition-transform ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-4 pb-4">
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Дополнительная информация */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Гарантии</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>✅ Полная версия сразу после оплаты</li>
              <li>✅ Право на финальную правку</li>
              <li>✅ Бессрочное хранение треков</li>
              <li>✅ Все права передаются вам</li>
              <li>✅ Поддержка 24/7</li>
            </ul>
          </div>

          {/* Ссылка на оферту */}
          <div className="mt-6 text-center">
            <a 
              href="/offer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 text-sm"
            >
              Подробнее в публичной оферте →
            </a>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
          >
            Понятно, спасибо!
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentFAQ