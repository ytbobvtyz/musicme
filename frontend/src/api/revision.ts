import apiClient from './client'

export interface RevisionComment {
  id: string
  order_id: string
  user_id: string
  comment: string
  revision_number: number
  created_at: string
  user_name?: string
  user_email?: string
}

export const getRevisionComments = async (orderId: string): Promise<RevisionComment[]> => {
  try {
    const response = await apiClient.get(`/orders/${orderId}/revision-comments`)
    return response.data
  } catch (error: any) {
    console.error('🔍 Get revision comments error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка загрузки комментариев')
  }
}