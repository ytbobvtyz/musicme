import { useState } from 'react'
import { TariffPlan } from '@/types/tariff'

interface QuestionnaireProps {
  tariff: TariffPlan
  onSubmit: (data: any) => void
  onBack: () => void
}

const QUESTIONNAIRE_STEPS = [
  {
    title: "О получателе",
    questions: [
      {
        id: 'qualities',
        question: "Какие 3 качества больше всего характеризуют этого человека?",
        placeholder: "Например: добрый, веселый, надежный..."
      },
      {
        id: 'hobbies', 
        question: "Какие у него/нее увлечения или хобби?",
        placeholder: "Например: любит готовить, увлекается фотографией..."
      },
      {
        id: 'special',
        question: "Что делает этого человека особенным для вас?",
        placeholder: "Опишите что делает этого человека уникальным..."
      }
    ]
  },
  {
    title: "О ваших отношениях",
    questions: [
      {
        id: 'meet',
        question: "Как вы познакомились?",
        placeholder: "Опишите историю вашего знакомства..."
      },
      {
        id: 'memory',
        question: "Какое ваше самое яркое общее воспоминание?",
        placeholder: "Опишите самый запоминающийся момент..."
      },
      {
        id: 'connection',
        question: "Что вас связывает больше всего?",
        placeholder: "Общие интересы, ценности, опыт..."
      }
    ]
  },
  {
    title: "О событии и музыкальных предпочтениях",
    questions: [
      {
        id: 'importance',
        question: "Почему это событие важно?",
        placeholder: "Что делает это событие особенным..."
      },
      {
        id: 'emotions',
        question: "Какие эмоции вы хотите передать?",
        placeholder: "Радость, благодарность, гордость, любовь..."
      },
      {
        id: 'music_inspiration',
        question: "Трек для вдохновения (необязательно)",
        placeholder: "Исполнитель и название песни, если хотите похожее звучание...",
        optional: true
      },
      {
        id: 'special_wishes',
        question: "Есть ли особые пожелания к тексту песни?",
        placeholder: "Любимые фразы, слова, стиль...",
        optional: true
      }
    ]
  }
]

const Questionnaire = ({ tariff, onSubmit, onBack }: QuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

  const currentStepData = QUESTIONNAIRE_STEPS[currentStep]

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentStep < QUESTIONNAIRE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      onSubmit(answers)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    } else {
      onBack()
    }
  }

  // Проверяем завершенность шага (только обязательные вопросы)
  const isStepComplete = currentStepData.questions.every(q => 
    q.optional ? true : answers[q.id]?.trim()
  )

  // Подсчет прогресса
  const totalQuestions = QUESTIONNAIRE_STEPS.flatMap(step => 
    step.questions.filter(q => !q.optional)
  ).length
  
  const answeredQuestions = QUESTIONNAIRE_STEPS.flatMap(step =>
    step.questions.filter(q => !q.optional && answers[q.id]?.trim())
  ).length

  const progress = Math.round((answeredQuestions / totalQuestions) * 100)

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Детальная анкета
        </h2>
        <p className="text-gray-600 mb-4">
          Тариф: <span className="font-semibold">{tariff.name}</span> • Шаг {currentStep + 1} из {QUESTIONNAIRE_STEPS.length}
        </p>
        
        {/* Прогресс-бар */}
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Прогресс заполнения</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentStepData.title}
          </h3>
          
          <div className="space-y-6">
            {currentStepData.questions.map((item) => (
              <div key={item.id}>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  {item.question}
                  {item.optional && (
                    <span className="text-gray-400 text-sm font-normal ml-1">(необязательно)</span>
                  )}
                </label>
                <textarea
                  value={answers[item.id] || ''}
                  onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                  rows={item.id === 'music_inspiration' ? 2 : 3}
                  placeholder={item.placeholder}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                />
                {item.id === 'music_inspiration' && answers[item.id] && (
                  <p className="mt-1 text-sm text-green-600">
                    🎵 Отлично! Учтем ваши музыкальные предпочтения
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            {currentStep === 0 ? 'Назад к форме' : 'Назад'}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepComplete}
            className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === QUESTIONNAIRE_STEPS.length - 1 ? 'Создать заказ' : 'Далее →'}
          </button>
        </div>

        {/* Подсказка для поля вдохновения */}
        {currentStep === QUESTIONNAIRE_STEPS.length - 1 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Музыкальное вдохновение</p>
                <p className="mt-1">Укажите исполнителя и название песни, если хотите чтобы ваша композиция была похожа по звучанию, аранжировке или настроению. Это поможет нашему продюсеру лучше понять ваши ожидания.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Questionnaire