import { OrderCreate } from '@/types/order'

// Используем fetch напрямую для лучшего контроля
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const createOrder = async (orderData: OrderCreate) => {
  console.log('🔍 Sending order data:', orderData)
  
  const response = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('🔍 Create order error response:', errorText)
    throw new Error(`Ошибка создания заказа: ${response.status}`)
  }
  
  return response.json()
}

// Остальные функции оставляем как есть
export const getOrders = async (params?: { status?: string; limit?: number; offset?: number }) => {
  // ФИКСИМ ОШИБКУ: преобразуем числа в строки
  const searchParams = new URLSearchParams()
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
  }
  
  const response = await fetch(`/api/v1/orders?${searchParams}`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) throw new Error('Ошибка загрузки заказов')
  return response.json()
}

export const getOrder = async (orderId: string) => {
  const response = await fetch(`/api/v1/orders/${orderId}`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) throw new Error('Ошибка загрузки заказа')
  return response.json()
}