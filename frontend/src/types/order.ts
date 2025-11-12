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
  preferences?: Record<string, any>
  status: string
  interview_link?: string
  estimated_time?: string
  created_at: string
  updated_at: string
  theme?: Theme  // ← объект темы
  genre?: Genre  // ← объект жанра
}

export interface OrderCreate {
  theme_id: string
  genre_id: string
  recipient_name: string
  occasion?: string
  details?: string
  preferences?: Record<string, any>
}

export interface OrderDetail extends Order {
  tracks: Track[]
}

// ⬇️⬇️⬇️ ДОБАВИМ ВСПОМОГАТЕЛЬНЫЕ ТИПЫ ⬇️⬇️⬇️

// Для отображения в UI - содержит строковые названия
export interface OrderDisplay {
  id: string
  user_id: string
  theme: string  // ← название темы как строка
  genre: string  // ← название жанра как строка
  recipient_name: string
  occasion?: string
  details?: string
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
  theme: order.theme?.name || 'Неизвестно',  // ← берем название из объекта theme
  genre: order.genre?.name || 'Неизвестно',  // ← берем название из объекта genre
})