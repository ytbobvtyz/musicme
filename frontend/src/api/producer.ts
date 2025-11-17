import { Order } from '@/types/order'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const getProducerOrders = async (orderStatus?: string): Promise<Order[]> => {
  const params = orderStatus ? `?order_status=${orderStatus}` : ''  // ← меняем параметр
  const response = await fetch(`/api/v1/producer/orders${params}`, {
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Error fetching producer orders:', errorText)
    throw new Error(`Ошибка загрузки заказов: ${response.status}`)
  }
  
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

// src/api/producer.ts
export const uploadTrack = async (formData: FormData) => {
  const token = localStorage.getItem('token')
  const response = await fetch('/api/v1/producer/tracks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ошибка загрузки трека: ${response.status}`)
  }
  
  return response.json()
}

export const updateTrack = async (trackId: string, updateData: any) => {
  const token = localStorage.getItem('token')
  const response = await fetch(`/api/v1/producer/tracks/${trackId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updateData)
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ошибка обновления трека: ${response.status}`)
  }
  
  return response.json()
}