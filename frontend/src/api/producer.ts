// src/api/producer.ts
import apiClient from './client'
import { Order } from '@/types/order'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

export const getProducerOrders = async (orderStatus?: string): Promise<Order[]> => {
  const response = await apiClient.get('/producer/orders', { 
    params: orderStatus ? { order_status: orderStatus } : {} 
  })
  return response.data
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await apiClient.put(`/producer/orders/${orderId}/status`, { status })
  return response.data
}

export const uploadTrack = async (formData: FormData) => {
  const response = await apiClient.post('/producer/tracks', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateTrack = async (trackId: string, updateData: any) => {
  const response = await apiClient.put(`/producer/tracks/${trackId}`, updateData)
  return response.data
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