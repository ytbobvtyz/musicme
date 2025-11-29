import apiClient from './client'
import { Order } from '@/types/order'
import { User } from '@/types/user'

export const getOrders = async (params?: { status?: string }): Promise<Order[]> => {
  const response = await apiClient.get('/admin/orders', { params })
  return response.data
}

export const getProducers = async (): Promise<User[]> => {
  const response = await apiClient.get('/admin/producers')
  return response.data
}

export const assignProducer = async (orderId: string, producerId: string) => {
  const response = await apiClient.post(`/admin/orders/${orderId}/assign`, { 
    producer_id: producerId 
  })
  return response.data
}

export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await apiClient.put(`/admin/orders/${orderId}/status`, { status })
  return response.data
}

// Orders
export const getAdminOrders = async (params?: any) => {
  const response = await apiClient.get('/admin/orders', { params })
  return response.data
}

export const assignProducerToOrder = async (orderId: string, producerId: string) => {
  const response = await apiClient.post(`/admin/orders/${orderId}/assign`, { producer_id: producerId })
  return response.data
}

export const updateOrderStatusAdmin = async (orderId: string, status: string) => {
  const response = await apiClient.patch(`/admin/orders/${orderId}/status?status=${status}`)
  return response.data
}

export const deleteOrderAdmin = async (orderId: string) => {
  const response = await apiClient.delete(`/admin/orders/${orderId}`)
  return response.data
}

export const confirmPaymentReceived = async (orderId: string) => {
  const response = await apiClient.post(`/admin/orders/${orderId}/confirm-payment-received`)
  return response.data
}

// Stats
export const getAdminStats = async (period: string) => {
  const response = await apiClient.get('/admin/stats', { params: { period } })
  return response.data
}

// Tracks
export const getAdminTracksDebug = async () => {
  const response = await apiClient.get('/admin/tracks-debug-simple')
  return response.data
}

export const uploadAdminTrack = async (orderId: string, formData: FormData) => {
  const response = await apiClient.post(`/admin/orders/${orderId}/tracks/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deleteAdminTrack = async (trackId: string) => {
  const response = await apiClient.delete(`/admin/tracks/${trackId}`)
  return response.data
}

export const getAdminTracksSimple = async () => {
  const response = await apiClient.get('/admin/tracks-debug-simple')
  return response.data
}

export const getTrackAudioPublicUrl = (trackId: string) => {
  return `/api/v1/admin/tracks/${trackId}/audio-public`
}