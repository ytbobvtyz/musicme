
import apiClient from './client'

export interface PaymentInitiateRequest {
  order_id: string
  amount?: number
  currency?: string
}

export interface PaymentResponse {
  payment_id: string
  payment_url: string
  confirmation_token: string
  amount: number
  currency: string
}

export const createPayment = async (orderId: string): Promise<PaymentResponse> => {
  try {
    const paymentData: PaymentInitiateRequest = {
      order_id: orderId
    }

    const response = await apiClient.post('/payments/initiate', paymentData)
    return response.data
  } catch (error: any) {
    console.error('🔍 Create payment error:', error.response?.data)
    throw new Error(error.response?.data?.detail || `Ошибка создания платежа: ${error.response?.status}`)
  }
}

export const checkPaymentStatus = async (paymentId: string) => {
  try {
    const response = await apiClient.get(`/payments/${paymentId}/status`)
    return response.data
  } catch (error: any) {
    console.error('🔍 Check payment status error:', error.response?.data)
    throw new Error(error.response?.data?.detail || 'Ошибка проверки статуса платежа')
  }
}