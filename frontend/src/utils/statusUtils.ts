// Маппинг статусов заказа для отображения
export const ORDER_STATUSES = {
    draft: 'Черновик',
    waiting_interview: 'Ожидает интервью', 
    in_progress: 'В работе',
    ready_for_review: 'Готов для проверки', // ⬅️ ДОБАВЛЯЕМ
    ready: 'Готов',
    paid: 'Оплачен',
    completed: 'Завершен',
    cancelled: 'Отменен',
    revision_requested: 'Требует доработки' // ⬅️ ДОБАВЛЯЕМ
  } as const
  
  // Типы для TypeScript
  export type OrderStatus = keyof typeof ORDER_STATUSES
  export type OrderStatusText = typeof ORDER_STATUSES[OrderStatus]
  
  // Функция для получения читаемого статуса
  export const getStatusText = (status: string): string => {
    return ORDER_STATUSES[status as OrderStatus] || status
  }
  
  // Функция для получения CSS классов для статуса
  export const getStatusClasses = (status: string): string => {
    const baseClasses = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium'
    
    const statusClassMap: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_interview: 'bg-yellow-100 text-yellow-800',
      ready_for_review: 'bg-purple-100 text-purple-800', // ⬅️ ДОБАВЛЯЕМ
      ready: 'bg-purple-100 text-purple-800',
      paid: 'bg-indigo-100 text-indigo-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
      revision_requested: 'bg-orange-100 text-orange-800' // ⬅️ ДОБАВЛЯЕМ
    }
    
    return `${baseClasses} ${statusClassMap[status] || 'bg-gray-100 text-gray-800'}`
  }
  
  // Опции статусов для селектов (если понадобится в админке)
  export const getStatusOptions = () => {
    return Object.entries(ORDER_STATUSES).map(([value, label]) => ({
      value,
      label
    }))
  }

  // ⬇️⬇️⬇️ ДОБАВЛЯЕМ НОВЫЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ⬇️⬇️⬇️

  // Функция для получения цвета статуса (для графиков и т.д.)
  export const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      'draft': 'gray',
      'waiting_interview': 'yellow',
      'in_progress': 'blue',
      'ready_for_review': 'purple',
      'ready': 'purple',
      'paid': 'indigo',
      'completed': 'green',
      'cancelled': 'red',
      'revision_requested': 'orange'
    }
    return colorMap[status] || 'gray'
  }

  // Функция для проверки можно ли запросить правку
  export const canRequestRevision = (status: string, roundsRemaining: number): boolean => {
    return status === 'ready_for_review' && roundsRemaining > 0
  }

  // Функция для проверки можно ли оплатить
  export const canPay = (status: string): boolean => {
    return status === 'ready_for_review'
  }

  // Функция для проверки находится ли заказ в работе
  export const isInProgress = (status: string): boolean => {
    return status === 'in_progress' || status === 'revision_requested'
  }

  // Функция для проверки завершен ли заказ
  export const isCompleted = (status: string): boolean => {
    return status === 'completed' || status === 'paid' || status === 'cancelled'
  }