export interface TariffPlan {
    id: string
    name: string
    price: number
    originalPrice: number
    description: string
    features: string[]
    popular: boolean
    badge?: string
    deadlineHours: number
    maxRevisions: number | null
    hasQuestionnaire: boolean
    hasInterview: boolean
  }
  
  export const TARIFF_PLANS: TariffPlan[] = [
    {
      id: 'basic',
      name: 'Базовый',
      price: 2900,
      originalPrice: 3900,
      description: 'Идеально для быстрых поздравлений',
      features: [
        'Песня до 3 минут',
        'Срок выполнения: 24-48 часов',
        '1 раунд правок',
        'AI + валидация качества',
        'Preview 60 секунд перед оплатой'
      ],
      popular: false,
      badge: 'Экономный выбор',
      deadlineHours: 48,
      maxRevisions: 1,
      hasQuestionnaire: false,
      hasInterview: false
    },
    {
      id: 'advanced',
      name: 'Продвинутый',
      price: 4900,
      originalPrice: 5900,
      description: 'Золотая середина с глубокой проработкой',
      features: [
        'Песня до 4 минут',
        'Срок выполнения: 2-3 дня',
        '2 раунда правок',
        'Детальная анкета + активное участие продюсера',
        'Глубокая текстовая проработка',
        'Preview 60 секунд перед оплатой'
      ],
      popular: true,
      badge: 'ВЫБОР МНОГИХ',
      deadlineHours: 72,
      maxRevisions: 2,
      hasQuestionnaire: true,
      hasInterview: false
    },
    {
      id: 'premium',
      name: 'Премиум',
      price: 9900,
      originalPrice: 11900,
      description: 'Максимум персонализации для важных событий',
      features: [
        'Песня до 5 минут',
        'Срок выполнения: 3-5 дней',
        'Неограниченные правки',
        'Видео-интервью 30 минут',
        'Персональный продюсер',
        'Эксклюзивный подход',
        'Preview 60 секунд перед оплатой'
      ],
      popular: false,
      badge: 'Эксклюзив',
      deadlineHours: 120,
      maxRevisions: null, // unlimited
      hasQuestionnaire: true,
      hasInterview: true
    }
  ]
  
  export const getTariffById = (id: string): TariffPlan => {
    return TARIFF_PLANS.find(tariff => tariff.id === id) || TARIFF_PLANS[0]
  }
  
  export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' ₽'
  }