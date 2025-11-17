import { Order } from '@/types/order'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const getProducerOrders = async (status?: string) => {
  const response = await fetch(`/api/v1/producer/orders?${new URLSearchParams({ status } as any)}`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Ошибка загрузки заказов')
  return response.json()
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetch(`/api/v1/producer/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  })
  if (!response.ok) throw new Error('Ошибка обновления статуса')
  return response.json()
}