import { Order } from '@/types/order'
import { User } from '@/types/user'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const getOrders = async (params?: { status?: string }) => {
  const response = await fetch(`/api/v1/admin/orders?${new URLSearchParams(params as any)}`, {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Ошибка загрузки заказов')
  return response.json()
}

export const getProducers = async (): Promise<User[]> => {
  const response = await fetch('/api/v1/admin/producers', {
    headers: getAuthHeaders()
  })
  if (!response.ok) throw new Error('Ошибка загрузки продюсеров')
  return response.json()
}

export const assignProducer = async (orderId: string, producerId: string) => {
  const response = await fetch(`/api/v1/admin/orders/${orderId}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ producer_id: producerId })
  })
  if (!response.ok) throw new Error('Ошибка назначения продюсера')
  return response.json()
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  })
  if (!response.ok) throw new Error('Ошибка обновления статуса')
  return response.json()
}