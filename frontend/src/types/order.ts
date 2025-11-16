import { Track } from './track'
import { Theme } from './theme'
import { Genre } from './genre'

export interface Order {
  id: string
  user_id: string
  theme_id: string
  genre_id: string
  recipient_name: string
  occasion?: string
  details?: string
  tariff_plan: string // ← ДОБАВЛЯЕМ в основной интерфейс
  preferences?: Record<string, any>
  status: string
  interview_link?: string
  estimated_time?: string
  created_at: string
  updated_at: string
  theme?: Theme
  genre?: Genre
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
  preferences?: Record<string, any>
  status: string
  interview_link?: string
  estimated_time?: string
  created_at: string
  updated_at: string
}

// Функция для преобразования Order в OrderDisplay
export const orderToDisplay = (order: Order): OrderDisplay => ({
  ...order,
  theme: order.theme?.name || 'Неизвестно',
  genre: order.genre?.name || 'Неизвестно',
})