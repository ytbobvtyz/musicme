// src/api/orders.ts
import apiClient from './client'
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
  
  try {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  } catch (error: any) {
    console.error('🔍 Create order error:', error.response?.data)
    throw new Error(error.response?.data?.detail || `Ошибка создания заказа: ${error.response?.status}`)
  }
}

export const getOrders = async (params?: { status?: string; limit?: number; offset?: number }) => {
  const response = await apiClient.get('/orders', { params })
  return response.data
}

export const getOrder = async (orderId: string) => {
  const response = await apiClient.get(`/orders/${orderId}`)
  return response.data
}

// ⬇️⬇️⬇️ ДОБАВЛЯЕМ НОВЫЕ МЕТОДЫ ⬇️⬇️⬇️

export const requestRevision = async (orderId: string, comment: string) => {
  const response = await fetch(`/api/v1/orders/${orderId}/request-revision`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ comment })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('🔍 Request revision error response:', errorText)
    throw new Error(`Ошибка запроса правки: ${response.status}`)
  }
  
  return response.json()
}

export const approveOrder = async (orderId: string) => {
  const response = await fetch(`/api/v1/orders/${orderId}/approve`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ошибка подтверждения заказа: ${response.status}`)
  }
  
  return response.json()
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await fetch(`/api/v1/orders/${orderId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Ошибка обновления статуса: ${response.status}`)
  }
  
  return response.json()
}

export const confirmPayment = async (orderId: string) => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/confirm-payment`)
    return response.data
  } catch (error: any) {
    console.error('🔍 Confirm payment error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка подтверждения оплаты')
  }
}
export const finalApprove = async (orderId: string) => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/final-approve`)
    return response.data
  } catch (error: any) {
    console.error('🔍 Final approve error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка подтверждения заказа')
  }
}

export const requestFinalRevision = async (orderId: string, comment: string) => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/final-revision`, { comment })
    return response.data
  } catch (error: any) {
    console.error('🔍 Final revision error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка запроса финальной правки')
  }
}

export const cancelOrder = async (orderId: string): Promise<{message: string}> => {
  try {
    const response = await apiClient.post(`/orders/${orderId}/cancel`)
    return response.data
  } catch (error: any) {
    console.error('🔍 Cancel order error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка отмены заказа')
  }
}