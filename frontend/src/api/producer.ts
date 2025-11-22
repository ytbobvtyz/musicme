import { Order } from '@/types/order'
import apiClient from './client'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const getProducerOrders = async (orderStatus?: string): Promise<Order[]> => {
  // ИСПРАВЛЯЕМ параметр с order_status на orderStatus
  const params = orderStatus ? `?order_status=${orderStatus}` : ''  // ← теперь правильно!
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

export const addProducerComment = async (orderId: string, comment: string) => {
  try {
    const response = await apiClient.post(`/producer/orders/${orderId}/add-comment`, { comment })
    return response.data
  } catch (error: any) {
    console.error('🔍 Add producer comment error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка добавления комментария')
  }
}

export const producerConfirmPayment = async (orderId: string) => {
  try {
    const response = await apiClient.post(`/producer/orders/${orderId}/confirm-payment`)
    return response.data
  } catch (error: any) {
    console.error('🔍 Producer confirm payment error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка подтверждения оплаты')
  }
}

export const uploadFinalTrack = async (formData: FormData) => {
  try {
    // Получаем order_id из formData
    const orderId = formData.get('order_id') as string
    if (!orderId) {
      throw new Error('order_id обязателен для загрузки финального трека')
    }

    // Используем правильный URL с order_id
    const response = await apiClient.post(
      `/producer/orders/${orderId}/upload-final-track`, 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  } catch (error: any) {
    console.error('🔍 Upload final track error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка загрузки финального трека')
  }
}