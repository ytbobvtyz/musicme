import apiClient from './client'
import { Order, OrderCreate } from '@/types/order'

export const getOrders = async (params?: { status?: string; limit?: number; offset?: number }) => {
  const response = await apiClient.get('/orders', { params })
  return response.data
}

export const getOrder = async (orderId: string) => {
  const response = await apiClient.get(`/orders/${orderId}`)
  return response.data
}

export const createOrder = async (orderData: OrderCreate) => {
  const response = await apiClient.post('/orders', orderData)
  return response.data
}

