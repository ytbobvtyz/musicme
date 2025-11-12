// Маппинг статусов заказа для отображения
export const ORDER_STATUSES = {
    draft: 'Черновик',
    waiting_interview: 'Ожидает интервью', 
    in_progress: 'В работе',
    ready: 'Готов',
    paid: 'Оплачен',
    completed: 'Завершен',
    cancelled: 'Отменен'
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
      ready: 'bg-purple-100 text-purple-800',
      paid: 'bg-indigo-100 text-indigo-800',
      draft: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
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