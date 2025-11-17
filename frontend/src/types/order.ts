import { Track } from './track'
import { Theme } from './theme'
import { Genre } from './genre'
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
  tariff_plan: string // ← ДОБАВЛЯЕМ в основной интерфейс
  preferences?: Record<string, any>
  status: string
  deadline_at: string
  interview_link?: string
  estimated_time?: string
  created_at: string
  updated_at: string
  theme?: Theme
  genre?: Genre
  producer?: User
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
  tariff_plan: string // ← ДОБАВЛЯЕМ и здесь
  producer?: string
  producer_id?: string
  preferences?: Record<string, any>
  status: string
  deadline_at: string
  interview_link?: string
  estimated_time?: string
  created_at: string
  updated_at: string
}

// Функция преобразования Order в OrderDisplay
export const orderToDisplay = (order: Order): OrderDisplay => ({
  ...order,
  theme: order.theme?.name || 'Неизвестно',
  genre: order.genre?.name || 'Неизвестно',
  producer: order.producer?.name || 'Не назначен',  // ← ДОБАВЛЯЕМ
})