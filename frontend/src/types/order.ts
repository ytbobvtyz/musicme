import { Track } from './track'
import { User } from './user'

export interface Order {
  id: string
  user_id: string
  theme_id: string
  genre_id: string
  producer_id?: string
  recipient_name: string
  occasion?: string
  details?: string
  tariff_plan: string
  preferences?: Record<string, any>
  status: string
  deadline_at: string
  interview_link?: string
  rounds_remaining: number
  price: number
  created_at: string
  updated_at: string
  
  // Связи
  theme?: {
    id: string
    name: string
  }
  genre?: {
    id: string
    name: string
  }
  producer?: User
  user?: User
}

export interface OrderDetail extends Order {
  tracks: Track[]
}

export interface OrderDisplay {
  id: string
  user_id: string
  theme: string
  genre: string
  recipient_name: string
  occasion?: string
  details?: string
  tariff_plan: string
  producer?: string
  status: string
  deadline_at: string
  interview_link?: string
  created_at: string
  updated_at: string
}

export interface OrderCreate {
  theme_id: string
  genre_id: string
  recipient_name: string
  occasion?: string
  details?: string
  tariff_plan: string
  preferences?: Record<string, any>
}

export const orderToDisplay = (order: Order): OrderDisplay => ({
  ...order,
  theme: order.theme?.name || 'Неизвестно',
  genre: order.genre?.name || 'Неизвестно',
  producer: order.producer?.name || 'Не назначен',
})

